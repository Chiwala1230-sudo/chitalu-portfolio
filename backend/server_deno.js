// Deno Backend for Chitalu's Portfolio - WITH BREVO EMAIL (WORKING)

// Your Brevo API Key
const BREVO_API_KEY = "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";

// Function to send email using Brevo API
async function sendEmail(name, email, message) {
  const url = "https://api.brevo.com/v3/smtp/email";
  
  // Email to YOU (admin)
  const adminEmail = {
    sender: { name: "Chitalu Portfolio", email: "ernestchiwala2@gmail.com" },
    to: [{ email: "ernestchiwala2@gmail.com", name: "Ernest Chiwala" }],
    subject: "🔔 NEW MESSAGE from your Portfolio!",
    htmlContent: `
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
  
  // Auto-reply to visitor
  const userReply = {
    sender: { name: "Chitalu Chiwala", email: "ernestchiwala2@gmail.com" },
    to: [{ email: email, name: name }],
    subject: "Thank you for contacting Chitalu Chiwala!",
    htmlContent: `
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
  
  try {
    // Send admin email
    const response1 = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify(adminEmail)
    });
    
    // Send auto-reply to visitor
    const response2 = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify(userReply)
    });
    
    const data1 = await response1.json();
    const data2 = await response2.json();
    
    if (response1.ok && response2.ok) {
      console.log("📧 Emails sent successfully!");
      console.log("   Admin email ID:", data1.id);
      console.log("   Auto-reply ID:", data2.id);
      return true;
    } else {
      console.error("Email error:", data1.message || data2.message);
      return false;
    }
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
}

// Main server handler
Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  
  // Handle preflight (OPTIONS request)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  
  // HEALTH CHECK endpoint
  if (pathname === "/api/health" && req.method === "GET") {
    console.log("✅ Health check requested");
    return new Response(
      JSON.stringify({ 
        status: "healthy", 
        message: "Backend is running on Deno Deploy with Brevo email!",
        timestamp: new Date().toISOString()
      }),
      { headers }
    );
  }
  
  // VIEW MESSAGES endpoint
  if (pathname === "/api/messages" && req.method === "GET") {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Messages are being logged and emailed. Check your inbox!" 
      }),
      { headers }
    );
  }
  
  // CONTACT FORM endpoint
  if (pathname === "/api/contact" && req.method === "POST") {
    try {
      const body = await req.json();
      const { name, email, message } = body;
      
      console.log("\n📝 NEW CONTACT FORM SUBMISSION:");
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Message: ${message}`);
      
      // Validation
      if (!name || name.trim().length < 2) {
        return new Response(
          JSON.stringify({ success: false, error: "Name must be at least 2 characters" }),
          { status: 400, headers }
        );
      }
      
      if (!email || !email.includes("@")) {
        return new Response(
          JSON.stringify({ success: false, error: "Valid email required" }),
          { status: 400, headers }
        );
      }
      
      if (!message || message.trim().length < 10) {
        return new Response(
          JSON.stringify({ success: false, error: "Message must be at least 10 characters" }),
          { status: 400, headers }
        );
      }
      
      // Send email notifications
      console.log("📧 Sending email notifications via Brevo...");
      const emailSent = await sendEmail(name, email, message);
      
      if (emailSent) {
        console.log("✅ Emails sent successfully!");
      } else {
        console.log("⚠️ Email sending had issues but message was received");
      }
      
      console.log("✅ Message processed successfully!\n");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Message received! Check your email for confirmation." 
        }),
        { headers }
      );
      
    } catch (error) {
      console.error("❌ Error:", error.message);
      return new Response(
        JSON.stringify({ success: false, error: "Server error. Please try again." }),
        { status: 500, headers }
      );
    }
  }
  
  // 404 for any other route
  console.log(`❌ 404: ${pathname} not found`);
  return new Response(
    JSON.stringify({ error: `Endpoint "${pathname}" not found` }),
    { status: 404, headers }
  );
});

console.log("\n🚀 Deno backend running with BREVO EMAIL!");
console.log("✅ Health check: /api/health");
console.log("📧 Email notifications: ACTIVE");
console.log("📬 Admin email: ernestchiwala2@gmail.com");
console.log("💬 Auto-reply: Sent to visitors\n");