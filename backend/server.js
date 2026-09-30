// ============================================
//  server.js — Portfolio Contact Form Backend
//  Tech: Node.js + Express + Nodemailer + MySQL
// ============================================

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const db   = require('./db');
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin  : '*',
    methods : ['GET', 'POST', 'PUT', 'DELETE'],
}));

// ── Routes ───────────────────────────────────
const projectsRoute  = require('./routes/projects');
const messagesRoute  = require('./routes/messages');
const skillsRoute    = require('./routes/skills');
const educationRoute = require('./routes/education');
const servicesRoute  = require('./routes/services');

app.use('/api/projects',  projectsRoute);
app.use('/api/messages',  messagesRoute);
app.use('/api/skills',    skillsRoute);
app.use('/api/education', educationRoute);
app.use('/api/services',  servicesRoute);

// ── Rate Limiter ─────────────────────────────
const contactLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max      : 5,
    message  : { success: false, message: 'Too many messages sent. Please try again later.' }
});

// ── Nodemailer Transporter ───────────────────
const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth    : {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS,
    }
});

// Verify transporter on startup
transporter.verify((error) => {
    if (error) {
        console.error('❌ Email transporter error:', error.message);
    } else {
        console.log('✅ Email transporter is ready');
    }
});

// ── Helper: input validation ─────────────────
function validateInput({ name, email, subject, message }) {
    if (!name    || name.trim().length    < 2)  return 'Name must be at least 2 characters.';
    if (!email   || !email.includes('@'))        return 'Please provide a valid email address.';
    if (!message || message.trim().length < 10) return 'Message must be at least 10 characters.';
    return null;
}

// ── POST /contact ────────────────────────────
app.post('/contact', contactLimiter, async (req, res) => {
    const { name, email, subject, message } = req.body;

    // 1. Validate
    const validationError = validateInput({ name, email, subject, message });
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    // 2. Save message to database
    try {
        await db.query(
            'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject || '', message]
        );
    } catch (dbErr) {
        console.error('❌ Failed to save message to DB:', dbErr.message);
    }

    // 3. Build email to YOU
    const ownerMail = {
        from    : `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to      : process.env.EMAIL_USER,
        replyTo : email,
        subject : `📬 Portfolio Contact: ${subject || 'New Message'}`,
        html    : `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:10px;overflow:hidden;">
                <div style="background:#ff4321;padding:24px 30px;">
                    <h2 style="color:#fff;margin:0;">New Message from Your Portfolio</h2>
                </div>
                <div style="padding:30px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px 0;color:#888;font-size:14px;width:90px;">Name</td>
                            <td style="padding:10px 0;font-weight:bold;">${escapeHtml(name)}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#888;font-size:14px;">Email</td>
                            <td style="padding:10px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#888;font-size:14px;">Subject</td>
                            <td style="padding:10px 0;">${escapeHtml(subject || '—')}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#888;font-size:14px;vertical-align:top;">Message</td>
                            <td style="padding:10px 0;line-height:1.7;">${escapeHtml(message).replace(/\n/g, '<br>')}</td>
                        </tr>
                    </table>
                    <p style="margin-top:24px;font-size:13px;color:#aaa;">
                        Hit Reply to respond directly to ${escapeHtml(name)}.
                    </p>
                </div>
            </div>
        `
    };

    // 4. Build auto-reply to SENDER
    const autoReply = {
        from    : `"Chathura Madusha" <${process.env.EMAIL_USER}>`,
        to      : email,
        subject : `Thanks for reaching out, ${name}! 👋`,
        html    : `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;border-radius:10px;overflow:hidden;">
                <div style="background:#ff4321;padding:24px 30px;">
                    <h2 style="color:#fff;margin:0;">Thanks for your message!</h2>
                </div>
                <div style="padding:30px;color:#333;">
                    <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
                    <p>Thanks for reaching out through my portfolio! I have received your message and will get back to you as soon as possible, usually within 24 hours.</p>
                    <p style="background:#fff;border-left:4px solid #ff4321;padding:14px 20px;border-radius:4px;font-style:italic;color:#555;">
                        "${escapeHtml(message.substring(0, 120))}${message.length > 120 ? '...' : ''}"
                    </p>
                    <p>Best regards,<br><strong>Chathura Madusha</strong><br>
                    <span style="color:#888;font-size:13px;">Web Developer | Open University of Sri Lanka</span></p>
                </div>
                <div style="background:#eee;padding:14px 30px;text-align:center;font-size:12px;color:#aaa;">
                    This is an automated reply from chathuramadusha20@gmail.com
                </div>
            </div>
        `
    };

    // 5. Send both emails
    try {
        await transporter.sendMail(ownerMail);
        await transporter.sendMail(autoReply);
        console.log(`✅ Message received from ${name} <${email}>`);
        return res.status(200).json({
            success : true,
            message : "Your message was sent successfully! I'll reply soon."
        });
    } catch (err) {
        console.error('❌ Failed to send email:', err.message);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please email me directly at chathuramadusha20@gmail.com'
        });
    }
});

// ── Health Check ─────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'Portfolio backend is running 🚀' });
});

// ── Start Server ─────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ── Utility: escape HTML ──────────────────────
function escapeHtml(text) {
    return String(text)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}