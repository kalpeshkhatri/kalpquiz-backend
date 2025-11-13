import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import dotenv from "dotenv";
import User from '../models/user.js';

dotenv.config();
const router = express.Router();

router.post(
  "/verifybywebhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    console.log(req);
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(req.body); // raw buffer
      const digest = shasum.digest("hex");

      if (digest === req.headers["x-razorpay-signature"]) {
        const payload = JSON.parse(req.body.toString());
        console.log("🔹 Webhook Event:", payload.event);

        if (payload.event === "payment.captured") {
          const payment = payload.payload.payment.entity;
          const userId = payment.notes.userId;
          const credits = parseInt(payment.notes.credits) || 0;

          if (userId && credits > 0) {
            await User.findByIdAndUpdate(userId, { $inc: { creditQuiz: credits } });
            console.log(`✅ ${credits} credits added to user ${userId}`);
          }
        }

        res.json({ status: "ok" });
      } else {
        console.warn("❌ Invalid Razorpay Signature");
        res.status(400).send("Invalid signature");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);



export default router;
