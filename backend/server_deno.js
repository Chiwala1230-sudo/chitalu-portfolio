// Deno Deploy Compatible Backend for Chitalu's Portfolio

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "https://deno.land/x/cors@v1.2.2/mod.ts";

// File to store messages (Deno Deploy has persistent storage)
const MESSAGES_FILE = "./messages.txt";

// Handle CORS
function corsResponse(body, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

// Save message to file
async function saveMessageToFile(name, email, message, ipAddress) {
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
  
  try {
    await Deno.writeTextFile(MESSAGES_FILE, entry, { append: true });
    console.log('💾 Message saved to messages.txt');
  } catch (error) {
    console.error('Error saving:', error);
  }
}

// Get all messages
async function getMessages() {
  try {
    const content = await Deno.readTextFile(MESSAGES_FILE);
    return content;
  } catch {
    return "No messages yet. Be the first!";
  }
}

// Main request handler
async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  
  // Health check
  if (path === "/api/health" && req.method === "GET") {
    return corsResponse({
      status: "healthy",
      message: "Backend is running on Deno Deploy!",
      timestamp: new Date().toISOString()
    });
  }
  
  // View messages
  if (path === "/api/messages" && req.method === "GET") {
    const messages = await getMessages();
    return new Response(
      `<pre style="background: #0A0C10; color: #00FF00; padding: 20px; font-family: monospace;">${messages}</pre>`,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }
  
  // Contact form
  if (path === "/api/contact" && req.method === "POST") {
    try {
      const body = await req.json();
      const { name, email, message } = body;
      
      const ipAddress = req.headers.get("x-forwarded-for") || "Unknown";
      
      console.log('\n📝 NEW CONTACT FORM SUBMISSION:');
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Message: ${message}`);
      console.log(`   IP: ${ipAddress}`);
      
      // Validation
      if (!name || name.trim().length < 2) {
        return corsResponse({ success: false, error: 'Name must be at least 2 characters' }, 400);
      }
      
      if (!email || !email.includes('@') || !email.includes('.')) {
        return corsResponse({ success: false, error: 'Valid email address is required' }, 400);
      }
      
      if (!message || message.trim().length < 10) {
        return corsResponse({ success: false, error: 'Message must be at least 10 characters' }, 400);
      }
      
      // Save to file
      await saveMessageToFile(name, email, message, ipAddress);
      
      console.log('✅ Message saved!');
      
      return corsResponse({
        success: true,
        message: 'Message received! I will respond within 24-48 hours.'
      });
      
    } catch (error) {
      console.error('Error:', error);
      return corsResponse({ success: false, error: 'Server error' }, 500);
    }
  }
  
  // 404
  return corsResponse({ error: 'Not found' }, 404);
}

// Start server
serve(handler, { port: 8000 });

console.log('🚀 Deno Deploy backend running on port 8000');