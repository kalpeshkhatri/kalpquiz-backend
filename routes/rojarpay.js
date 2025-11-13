// backend/routes/payment.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import User from '../models/user.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import bodyParser from "body-parser";

dotenv.config();

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order API

// router.post("/create-order", authenticateToken ,async (req, res) => {
//     try {
//         const { amount } = req.body; // Amount in INR

//         const options = {
//             amount: amount * 100, // amount in smallest currency unit (paise)
//             currency: "INR",
//             receipt: `receipt_${Date.now()}`
//         };
//         console.log(options);

//         const order = await razorpay.orders.create(options);
//         res.json(order);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Something went wrong" });
//     }
// });




//----------------------------------------------------
// Verify payment
// router.post("/verify-payment", authenticateToken,(req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const generated_signature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//         .update(razorpay_order_id + "|" + razorpay_payment_id)
//         .digest("hex");

//     if (generated_signature === razorpay_signature) {
//         res.json({ success: true, message: "Payment verified successfully" });
//     } else {
//         res.status(400).json({ success: false, message: "Invalid signature" });
//     }
// });
//---------------------
// router.post('/verify-payment',authenticateToken, async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature,credits } = req.body;
//     console.log(req);

//     const sign = crypto
//         .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//         .update(razorpay_order_id + "|" + razorpay_payment_id)
//         .digest('hex');

//     if (sign === razorpay_signature) {
//         // Find logged in user
//         const userId = req.user.id; // from JWT middleware
//         console.log(userId);
//         await User.findByIdAndUpdate(userId, {
//             $inc: { creditQuiz: credits } // add credits 
//         });
//         res.json({ success: true, message: "Credits added" });
//     } else {
//         res.status(400).json({ success: false, message: "Payment verification failed" });
//     }
// });


///----------------------have aapne webhook thi verify kariye:
// for webhook we don't send JWT token:

    // router.post('/verifybywebhook',express.json({ type: 'application/json' }), async (req, res) => {
    //     const {credits } = req.body;
    //     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    //     const shasum = crypto.createHmac('sha256', secret);
    //     shasum.update(JSON.stringify(req.body));
    //     const digest = shasum.digest('hex');

    //     if (digest === req.headers['x-razorpay-signature']) {
    //         const payment = req.body.payload.payment.entity;
    //         const userEmail = payment.email; // Get from order metadata
    //         const userId = req.user.id;
    //         await User.findByIdAndUpdate(userId, {
    //             $inc: { creditQuiz: credits } // add credits 
    //         });
    //         // await User.findOneAndUpdate({ email: userEmail }, { $inc: { quizCredits: 10 } });
    //         res.json({ status: 'ok' });
    //     } else {
    //         res.status(400).send('Invalid signature');
    //     }
    // });

//-----------------by using below onlu webhook through its increase credit.
router.post("/create-order", authenticateToken, async (req, res) => {
    try {
        const { amount, credits } = req.body; // amount in INR, credits to give
        // console.log(req.body);//{ amount: '100', credits: '400' }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id, // store user ID in notes
                credits: credits,
                amounts:amount
            }
        };

        const order = await razorpay.orders.create(options);
        // console.log(order);//{amount: 10000,amount_due: 10000,amount_paid: 0,attempts: 0,created_at: 1755528738,currency: 'INR',entity: 'order',id: 'order_R6px8QErK7RgLu',notes: { credits: '400', userId: '689c641a4702f3b4889363da' },offer_id: null,receipt: 'receipt_1755528737184',status: 'created'}
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});


//----------------------
// router.post("/verifybywebhook",express.json({ type: "application/json" }),
//     async (req, res) => {
//         try {
//             const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

//             const shasum = crypto.createHmac("sha256", secret);
//             shasum.update(JSON.stringify(req.body));
//             const digest = shasum.digest("hex");

//             if (digest === req.headers["x-razorpay-signature"]) {
//                 const event = req.body.event;
//                 console.log(event);

//                 if (event === "payment.captured") {
//                     const payment = req.body.payload.payment.entity;
//                     const userId = payment.notes.userId;
//                     console.log(userId);
//                     const credits = parseInt(payment.notes.credits) || 0;

//                     if (userId && credits > 0) {
//                         await User.findByIdAndUpdate(userId, {
//                             $inc: { creditQuiz: credits }
//                         });
//                         console.log(`✅ Credits added to user ${userId}`);
//                     }
//                 }

//                 res.json({ status: "ok" });
//             } else {
//                 console.warn("❌ Invalid Razorpay Signature");
//                 res.status(400).send("Invalid signature");
//             }
//         } catch (err) {
//             console.error(err);
//             res.status(500).send("Server error");
//         }
//     }
// );

//we have to use bodyparse here because aa rozarpay.
// router.post(
//   "/verifybywebhook",
//   bodyParser.raw({ type: "application/json" }),
//   async (req, res) => {
//     try {
//       const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//       const shasum = crypto.createHmac("sha256", secret);
//       shasum.update(req.body); // raw buffer
//       const digest = shasum.digest("hex");

//       if (digest === req.headers["x-razorpay-signature"]) {
//         const payload = JSON.parse(req.body.toString());
//         console.log("🔹 Webhook Event:", payload.event);

//         if (payload.event === "payment.captured") {
//           const payment = payload.payload.payment.entity;
//           const userId = payment.notes.userId;
//           const credits = parseInt(payment.notes.credits) || 0;

//           if (userId && credits > 0) {
//             await User.findByIdAndUpdate(userId, { $inc: { creditQuiz: credits } });
//             console.log(`✅ ${credits} credits added to user ${userId}`);
//           }
//         }

//         res.json({ status: "ok" });
//       } else {
//         console.warn("❌ Invalid Razorpay Signature");
//         res.status(400).send("Invalid signature");
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Server error");
//     }
//   }
// );

//---------------------below is only for varify signature:its not actually add credit to mongodb but its handled by rozarpay webhook.

// router.post('/verify-payment',authenticateToken, async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature,credits } = req.body;
//     console.log(req.body)
//     // console.log(req);

//     const sign = crypto
//         .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//         .update(razorpay_order_id + "|" + razorpay_payment_id)
//         .digest('hex');

//     if (sign === razorpay_signature) {
//         // Find logged in user
//         // const userId = req.user.id; // from JWT middleware
//         // console.log(userId);
//         // await User.findByIdAndUpdate(userId, {
//         //     $inc: { creditQuiz: credits } // add credits 
//         // });
//         // aapne mongodb ma credit increase only webhook thi j karisu. increase aapne aa ahithi nahi kariye.


//         //----------jo signture valid hoy to aapne aa payment ni history user na account ma store karisu.

//         //---------
//         res.json({ success: true, message: "Credits added" });
//     } else {
//         res.status(400).json({ success: false, message: "Payment verification failed" });
//     }
// });


//--------------------------------aapne actually ma credit increse nahi kariye pan aapne ahiya user ni payment history ne ek array ma store kai ne rakhso.

router.post('/verify-payment', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits ,amount} = req.body;
  

  const sign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest('hex');

  if (sign === razorpay_signature) {
    try {
      // Get logged in user ID from JWT (added by authenticateToken middleware)
      const userId = req.user.id;

      // Store payment history
      await User.findByIdAndUpdate(userId, {
        $push: {
          paymentHistory: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: amount, // paise from Razorpay order (store if available)
            credits: credits,
            status: "success"
          }
        }
      });

      res.json({ success: true, message: "Payment recorded in history" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error while saving history" });
    }
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});



    export default router;
