// Simple Deno Backend for Chitalu's Portfolio - FIXED VERSION

Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // CORS headers - defined manually (no import needed)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  
  // HEALTH CHECK endpoint
  if (pathname === "/api/health" && req.method === "GET") {
    const response = {
      status: "healthy",
      message: "Backend is running on Deno Deploy!",
      timestamp: new Date().toISOString()
    };
    return new Response(JSON.stringify(response), { headers });
  }
  
  // VIEW MESSAGES endpoint (simple)
  if (pathname === "/api/messages" && req.method === "GET") {
    const response = {
      success: true,
      message: "Messages are being saved. This is the backend API.",
      tip: "Check your terminal logs to see incoming messages"
    };
    return new Response(JSON.stringify(response), { headers });
  }
  
  // CONTACT FORM endpoint
  if (pathname === "/api/contact" && req.method === "POST") {
    try {
      const body = await req.json();
      const { name, email, message } = body;
      
      // Log to console (visible in Deno Deploy logs)
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
      
      if (!email || !email.includes("@") || !email.includes(".")) {
        return new Response(
          JSON.stringify({ success: false, error: "Valid email address is required" }),
          { status: 400, headers }
        );
      }
      
      if (!message || message.trim().length < 10) {
        return new Response(
          JSON.stringify({ success: false, error: "Message must be at least 10 characters" }),
          { status: 400, headers }
        );
      }
      
      // Success response
      console.log("✅ Message processed successfully!");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Message received! I will respond within 24-48 hours." 
        }),
        { status: 200, headers }
      );
      
    } catch (error) {
      console.error("❌ Error processing request:", error.message);
      return new Response(
        JSON.stringify({ success: false, error: "Server error. Please try again." }),
        { status: 500, headers }
      );
    }
  }
  
  // 404 for any other route
  return new Response(
    JSON.stringify({ error: "Endpoint not found" }),
    { status: 404, headers }
  );
});

console.log("🚀 Deno backend running on http://localhost:8000");
console.log("✅ Health check: /api/health");
console.log("✅ Contact form: /api/contact");