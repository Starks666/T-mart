import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  app.use(express.json());

  // CORS Middleware (Simple)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Debug middleware
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
  });

  // Mock API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Verification Code Logic
  app.all("/api/auth/send-code", async (req, res) => {
    console.log(`[Auth API] Method: ${req.method}, Path: ${req.path}, Body:`, req.body);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} not allowed. Please use POST.` 
      });
    }

    const { email: rawEmail } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      let emailSent = false;
      if (resend) {
        try {
          await resend.emails.send({
            from: 'T mart <onboarding@resend.dev>',
            to: email,
            subject: 'Your Verification Code - T mart',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Password Reset Verification</h2>
                <p>Your 6-digit verification code is:</p>
                <h1 style="color: #d97706; letter-spacing: 5px;">${code}</h1>
                <p>This code will expire in 10 minutes.</p>
                <hr />
                <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
              </div>
            `
          });
          emailSent = true;
        } catch (emailError) {
          console.error('Resend Email Error (Falling back to console):', emailError);
        }
      }
      
      console.log(`Verification code for ${email}: ${code}`);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        success: true, 
        message: emailSent ? "Verification code sent to your email!" : "Email service unavailable. Use the debug code below.",
        debugCode: code,
        emailSent
      });
    } catch (error) {
      console.error('Auth API Error:', error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Catch-all for unmatched API routes
  app.all("/api/*", (req, res) => {
    console.log(`[API 404] ${req.method} ${req.url}`);
    res.status(404).json({ 
      success: false, 
      message: `API route ${req.method} ${req.url} not found` 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global Server Error:', err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
