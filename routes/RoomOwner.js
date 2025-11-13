import express from 'express';
// import User from '../models/user.js';
import bcrypt from 'bcrypt';
import Room from '../models/room.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import User from '../models/user.js';



const router = express.Router();


router.post('/createRoom', authenticateToken,async (req, res) => {
    


  try {
    const { PrivatePassword, PublicPassword, Studentnos,Questionnos } = req.body;
    const {name,id} = req.user;
    console.log(req.user);

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deductcredit=0.25*Studentnos*Questionnos;

    if (user.creditQuiz < deductcredit) {
      return res.json({ redirectTo: '/payment' });
    }

    if(Studentnos<=4 || Studentnos>200 || Questionnos<20 || Questionnos>200){
        return res.status(404).json({ message: 'Invalid input' });
    }

    // if(PrivatePassword.length<8 || PrivatePassword.length>30 || PublicPassword.length<8 ||PublicPassword.length>30){
    //   return res.status(404).json({ message: 'Invalid input' });
    // }
    // const exists = await User.findOne({ email })
    // console.log('hello');
    // if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword1 = await bcrypt.hash(PrivatePassword, 10);
    const hashedPassword2 = await bcrypt.hash(PublicPassword, 10);
    // console.log('📩 Email:', email);

    // ✅ Declare here — outside try block
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // console.log('🔐 Token:', verificationToken);

    const newRoom = new Room({
        RoomOwnername:name,
        RoomOwnerId:id,
        PrivatePassword:hashedPassword1,
        PublicPassword:hashedPassword2,
        Studentnos,
        RemainingStudentNos:Studentnos,
        Questionnos,
        RoomcreatedDate:Date.now()
    });
    console.log('💾 New user:', newRoom);

    await newRoom.save();

    // user.creditQuiz -= deductcredit;
    // await user.save();

    // Store payment history
    await User.findByIdAndUpdate(id, {
        $inc: { creditQuiz:-deductcredit },
        $push: {
            roomHistory: {
              RoomId: newRoom._id,
              DeductedCredit:deductcredit,
             
            }
        
        }
      });


    // const transporter = nodemailer.createTransport({
    //   service: 'Gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
    // });

    // const verifyUrl = `http://localhost:5000/auth/verify?token=${verificationToken}`;
    // console.log('📨 Verify link:', verifyUrl);

    // await transporter.sendMail({
    //   from: '"KalpQuiz" <no-reply@kalpquiz.com>',
    //   to: email,
    //   subject: 'Verify your KalpQuiz email',
    //   html: `
    //     <h3>${username},Welcome to KalpQuiz!</h3>
    //     <p>Click the link below to verify your email address:</p>
    //     <a href="${verifyUrl}">${verifyUrl}</a>
    //     <p>If you did not request this, ignore this email.</p>
    //   `
    // });

    res.status(201).json({ message:'Room Created Successfully',id:newRoom._id });
  } catch (err) {
    console.error('❌ Room created error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});





export default router;

