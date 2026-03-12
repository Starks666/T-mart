import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  app.use(express.json());

  // Mock API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Verification Code Logic
  app.post("/api/auth/send-code", async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      if (resend) {
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
      }
      
      console.log(`Verification code for ${email}: ${code}`);
      
      res.json({ 
        success: true, 
        message: "Verification code sent to your email!",
        debugCode: code // Keep this for testing until you verify email works
      });
    } catch (error) {
      console.error('Resend Error:', error);
      res.status(500).json({ success: false, message: "Failed to send code via email" });
    }
  });

  // bKash Payment Integration
  app.post("/api/bkash/create", async (req, res) => {
    const { amount, orderId } = req.body;
    
    // In a real app, you would call bKash Grant Token and Create Payment API here
    // For now, we simulate the process
    const merchantNumber = process.env.BKASH_MERCHANT_NUMBER || "+8801630989302";
    
    res.json({
      success: true,
      paymentID: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      bkashURL: `/bkash-mock-payment?amount=${amount}&orderId=${orderId}&merchant=${encodeURIComponent(merchantNumber)}`
    });
  });

  app.post("/api/bkash/execute", async (req, res) => {
    const { paymentID } = req.body;
    // Simulate successful execution
    res.json({
      success: true,
      trxID: `TRX${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: 'Completed'
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
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
