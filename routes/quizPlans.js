import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import QuizPlan from '../models/quizplancredit.js';
// const QuizPlan = require("../models/QuizPlan");

const router = express.Router();




router.get("/plans", authenticateToken,async (req, res) => {
  try {
    const plans = await QuizPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz plans" });
  }
});


export default router;