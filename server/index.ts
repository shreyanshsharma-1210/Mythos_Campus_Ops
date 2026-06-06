import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleVapiProxy,
  handleVapiCall,
  handleVapiTest,
} from "./routes/vapi-proxy";
import { handleWhatsAppSend } from "./routes/whatsapp";
import { handleCampusAgent } from "./routes/campus-agent";
import { createStoreRouter } from "./routes/store";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req: any, res: any) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Shared in-memory store (all tabs/users read & write here)
  app.use("/api/store", createStoreRouter());

  // WhatsApp / Resend notifications
  app.post("/api/whatsapp/send", handleWhatsAppSend);

  app.get("/api/vapi/test", handleVapiTest);
  app.post("/api/vapi/call", handleVapiCall);
  app.all("/api/vapi/:endpoint", handleVapiProxy);

  // Campus AI Agent (SSE streaming)
  app.post("/api/campus-agent", handleCampusAgent);

  app.get("/api/pdf/health", async (req, res) => {
    res.json({ status: 'ok', message: 'PDF processor is running' });
  });
  
  app.post("/api/pdf/process", async (req, res) => {
    try {
      const { processPDF, upload } = await import("./routes/pdf-processor");
      const multerMiddleware = upload.single('pdf');
      
      multerMiddleware(req, res, (err: any) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        processPDF(req, res, () => {});
      });
    } catch (error: any) {
      console.error('PDF route error:', error);
      res.status(500).json({ error: 'Failed to load PDF processor', details: error.message });
    }
  });

  app.post("/api/visualization/generate", async (req, res) => {
    try {
      const { generateVisualization } = await import("./routes/visualization-generator");
      generateVisualization(req, res, () => {});
    } catch (error: any) {
      console.error('Visualization route error:', error);
      res.status(500).json({ error: 'Failed to load visualization generator', details: error.message });
    }
  });

  return app;
}
