
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import adminRoutes from './routes/adminRoutes.js';
import quizRoutes from './routes/quiz.js'
import quizcreditRoutes from './routes/quizPlans.js'
import  rojpayRoute from './routes/rojarpay.js'
import rateLimiter from './middlewares/rateLimiter.js';
import { authenticateToken } from './middlewares/authMiddleware.js';
import debugRateRouter from './routes/debugRate.js';
import kalpquizwebhook from './routes/rojarpaywebhook.js';
import createRoomRoute from './routes/RoomOwner.js';
// import insertDefaultMaintopics from './utils/insertmaintopic.js';// main topic ne insert karavva mate
// import maintopicRoutes from './routes/protected.js';

dotenv.config();

const app = express();
app.use(cors());

app.use('/kalpquizwebhook',kalpquizwebhook); // must be before json() because in this route we use raw data
app.use(express.json());

// app.use('/kalpquizwebhook',kalpquizwebhook);


//----------------------------
// app.use(authenticateToken, rateLimiter(60, 60));
// je aa auth route par jase tyare aa ratemite thi pass thavu padse.
app.use(rateLimiter(30, 60)); // 30 requests per 60 seconds
//----------------------------

app.use('/auth', authRoutes);

app.use('/debug', debugRateRouter);//for geting all data of rate limiting real time.


// app.use(express.json()); // Optional: to parse JSON body

// have je login thai ne aavya 6e tena par rate limiting lagaviye:
app.use(authenticateToken, rateLimiter(60, 60)); // 60 req/min per user


// protectedRoutes na badha routes aa user pa6i jodai jase. 
// Mount your routes under a base path, e.g., /user
app.use('/user', protectedRoutes);
// aa protectedRoutes ma /profile and /setup-maintopics aa route 6e. aane use karva mate aapne http:localhost:5000/user/profile and http:localhost:5000/user/setup-maintopics aa rite melvi sake 6e.


app.use('/admin',adminRoutes)//have aapne aa adminonlyallowed na route ne use karva mate aapne /admin/jete route nu name aavse.

app.use('/quiz',quizRoutes);//je pan ai thi question banse te aa qoute par thi javu padse.

app.use('/payment',quizcreditRoutes)

app.use('/kapquizpay',rojpayRoute);

app.use('/room',createRoomRoute)



const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // insertDefaultMaintopics(); // aa function ne call karvathi aapne maintopics database ma jata rahse
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
