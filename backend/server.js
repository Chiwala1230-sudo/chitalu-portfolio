const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// File where messages will be saved
const MESSAGES_FILE = path.join(__dirname, 'messages.txt');

// ===== BREVO EMAIL CONFIGURATION (REAL EMAILS!) =====
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: "a9fd9e001@smtp-brevo.com",     // Your Brevo SMTP login
        pass: "atQc7A9LNKH13pX2"               // Your Brevo SMTP password
    }
});

console.log('📧 Brevo configured - Ready to send REAL emails from your Gmail!');

// Function to save message to file
function saveMessageToFile(name, email, message, ipAddress) {
    const timestamp = new Date().toLocaleString('en-ZM', { timeZone: 'Africa/Lusaka' });
    
    const entry = `
╔══════════════════════════════════════════════════════════╗
║ 📅 Time: ${timestamp}
║ 👤 Name: ${name}
║ 📧 Email: ${email}
║ 🌐 IP: ${ipAddress || 'Not recorded'}
║ 💬 Message: ${message}
╚══════════════════════════════════════════════════════════╝
`;
    
    fs.appendFileSync(MESSAGES_FILE, entry);
    console.log('💾 Message saved to messages.txt');
}

// Function to send email notifications
async function sendEmailNotifications(name, email, message) {
    try {
        // Email to YOU (the owner) - goes to your Gmail
        const adminEmail = {
            from: `"Chitalu Chiwala Portfolio" <ernestchiwala2@gmail.com>`,
            to: 'ernestchiwala2@gmail.com',
            subject: '🔔 NEW MESSAGE from your Portfolio!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0A0C10; color: #EFF1F5;">
                    <div style="background: linear-gradient(135deg, #60A5FA, #3B82F6); padding: 20px; text-align: center; border-radius: 10px;">
                        <h1 style="color: white;">📬 New Contact Message</h1>
                    </div>
                    <div style="background: #11161F; padding: 20px; border-radius: 10px; margin-top: 20px;">
                        <p><strong>👤 Name:</strong> ${name}</p>
                        <p><strong>📧 Email:</strong> ${email}</p>
                        <p><strong>💬 Message:</strong></p>
                        <p style="background: #1E293B; padding: 15px; border-radius: 8px;">${message}</p>
                        <hr style="border-color: #2D3A50;">
                        <p style="font-size: 12px; color: #94A3B8;">Reply directly to: ${email}</p>
                    </div>
                </div>
            `
        };
        
        // Auto-reply to the person who messaged you
        const userReply = {
            from: `"Chitalu Chiwala" <ernestchiwala2@gmail.com>`,
            to: email,
            subject: 'Thank you for contacting Chitalu Chiwala!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0A0C10; color: #EFF1F5;">
                    <div style="background: linear-gradient(135deg, #60A5FA, #3B82F6); padding: 20px; text-align: center; border-radius: 10px;">
                        <h1 style="color: white;">Hello ${name}! 👋</h1>
                    </div>
                    <div style="background: #11161F; padding: 20px; border-radius: 10px; margin-top: 20px;">
                        <p>Thank you for reaching out to me!</p>
                        <p>I've received your message and will get back to you within <strong>24-48 hours</strong>.</p>
                        <div style="background: #1E293B; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Your message:</strong></p>
                            <p style="margin: 10px 0 0 0;">"${message}"</p>
                        </div>
                        <p>In the meantime, feel free to connect with me on:</p>
                        <ul>
                            <li>🔗 <a href="https://www.linkedin.com/in/ernest-chiwala-bb21b5402" style="color: #60A5FA;">LinkedIn</a></li>
                            <li>📱 TikTok: <strong>@chitalu.io</strong></li>
                            <li>💻 GitHub: <strong>Chiwala1230-sudo</strong></li>
                        </ul>
                        <hr style="border-color: #2D3A50;">
                        <p style="font-size: 12px; color: #94A3B8;">Best regards,<br><strong>Chitalu (Ernest) Chiwala</strong><br>Full-Stack Developer</p>
                    </div>
                </div>
            `
        };
        
        await transporter.sendMail(adminEmail);
        console.log('📧 REAL EMAIL sent to YOU (admin) - Check your Gmail!');
        
        await transporter.sendMail(userReply);
        console.log('📧 Auto-reply sent to visitor');
        
        return true;
        
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return false;
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Get all messages (for you to view in browser)
app.get('/api/messages', (req, res) => {
    try {
        if (fs.existsSync(MESSAGES_FILE)) {
            const messages = fs.readFileSync(MESSAGES_FILE, 'utf8');
            res.send(`<pre style="background: #0A0C10; color: #00FF00; padding: 20px; font-family: monospace; font-size: 14px; white-space: pre-wrap;">${messages}</pre>`);
        } else {
            res.send('No messages yet. Be the first!');
        }
    } catch (error) {
        res.status(500).json({ error: 'Error reading messages' });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    // Get IP address
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    console.log('\n📝 NEW CONTACT FORM SUBMISSION:');
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Message: ${message}`);
    console.log(`   IP: ${ipAddress}`);
    
    // Validation
    if (!name || name.trim().length < 2) {
        return res.status(400).json({ 
            success: false, 
            error: 'Name must be at least 2 characters' 
        });
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
        return res.status(400).json({ 
            success: false, 
            error: 'Valid email address is required' 
        });
    }
    
    if (!message || message.trim().length < 10) {
        return res.status(400).json({ 
            success: false, 
            error: 'Message must be at least 10 characters' 
        });
    }
    
    // Save to file
    saveMessageToFile(name, email, message, ipAddress);
    
    // Send real email notifications
    await sendEmailNotifications(name, email, message);
    
    console.log('✅ Message processed successfully!\n');
    
    res.json({ 
        success: true, 
        message: 'Message received! I will respond within 24-48 hours.' 
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 CHITALU'S PORTFOLIO BACKEND IS RUNNING!              ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   📡 Server: http://localhost:${PORT}                      ║
║   💾 Messages saved to: backend/messages.txt              ║
║   👀 View messages: http://localhost:${PORT}/api/messages  ║
║   📧 REAL EMAILS: Brevo configured!                       ║
║   📬 Emails will go to: ernestchiwala2@gmail.com          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});