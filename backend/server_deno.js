// Deno Backend for Chitalu's Portfolio - Uses Environment Variable

// Read API key from environment variable (SECURE!)
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || "";

if (!BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY environment variable not set!");
} else {
  console.log("✅ Brevo API key loaded from environment");
}

// Function to send email using Brevo API
async function sendEmail(name, email, message) {
  const url = "https://api.brevo.com/v3/smtp/email";
  
  // Email to YOU (admin)
  const adminEmail = {
    sender: { name: "Chitalu Portfolio", email: "ernestchiwala2@gmail.com" },
    to: [{ email: "ernestchiwala2@gmail.com", name: "Ernest Chiwala" }],
    subject: "🔔 NEW MESSAGE from your Portfolio!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>📬 New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Reply directly to: ${email}</p>
      </div>
    `
  };
  
  // Auto-reply to visitor
  const userReply = {
    sender: { name: "Chitalu Chiwala", email: "ernestchiwala2@gmail.com" },
    to: [{ email: email, name: name }],
    subject: "Thank you for contacting Chitalu Chiwala!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello ${name}! 👋</h2>
        <p>Thank you for reaching out to me!</p>
        <p>I've received your message and will get back to you within <strong>24-48 hours</strong>.</p>
        <p>Best regards,<br><strong>Chitalu Chiwala</strong><br>Full-Stack Developer</p>
      </div>
    `
  };
  
  try {
    // Send both emails
    const [res1, res2] = await Promise.all([
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
        body: JSON.stringify(adminEmail)
      }),
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
        body: JSON.stringify(userReply)
      })
    ]);
    
    if (res1.ok && res2.ok) {
      console.log("📧 Emails sent successfully!");
      return true;
    } else {
      console.error("Email error:", await res1.text(), await res2.text());
      return false;
    }
  } catch (error) {
    console.error("Email failed:", error.message);
    return false;
  }
}

// Main server handler
Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  
  // Health check
  if (pathname === "/api/health" && req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "healthy", message: "Backend running with email!" }),
      { headers }
    );
  }
  
  // Contact form
  if (pathname === "/api/contact" && req.method === "POST") {
    try {
      const { name, email, message } = await req.json();
      
      console.log("\n📝 NEW CONTACT FORM SUBMISSION:");
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Message: ${message}`);
      
      // Validation
      if (!name || name.length < 2) {
        return new Response(
          JSON.stringify({ success: false, error: "Name too short" }),
          { status: 400, headers }
        );
      }
      
      if (!email || !email.includes("@")) {
        return new Response(
          JSON.stringify({ success: false, error: "Valid email required" }),
          { status: 400, headers }
        );
      }
      
      if (!message || message.length < 10) {
        return new Response(
          JSON.stringify({ success: false, error: "Message too short" }),
          { status: 400, headers }
        );
      }
      
      // Send emails
      await sendEmail(name, email, message);
      
      console.log("✅ Message processed!\n");
      
      return new Response(
        JSON.stringify({ success: true, message: "Message received! Check your email." }),
        { headers }
      );
      
    } catch (error) {
      console.error("Error:", error.message);
      return new Response(
        JSON.stringify({ success: false, error: "Server error" }),
        { status: 500, headers }
      );
    }
  }
  
  return new Response(
    JSON.stringify({ error: "Not found" }),
    { status: 404, headers }
  );
});

console.log("🚀 Deno backend running with Brevo email!");
console.log("✅ Health: /api/health");
console.log("📧 Emails will be sent!");