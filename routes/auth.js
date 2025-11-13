import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
dotenv.config();

// import User from '../backend/models/User.js';

const router = express.Router();

// Signup Route
// router.post('/signup', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ message: 'Email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ email, password: hashedPassword });

//     await newUser.save();
//     res.status(201).json({ message: 'User created successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });


//----------------------
// router.post('/signup', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const exists = await User.findOne({ email });
//     console.log('hello')
//     if (exists) return res.status(400).json({ message: 'Email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log(email);

//     // const verificationToken = crypto.randomBytes(32).toString('hex');
//     // console.log(verificationToken)
//         try {
//       const verificationToken = crypto.randomBytes(32).toString('hex');
//       console.log('🔐 Token:', verificationToken);
//       } catch (tokenErr) {
//       console.error('❌ Error creating verification token:', tokenErr.message);
//       }

//     const newUser = new User({
//       email,
//       password: hashedPassword,
//       isVerified: false,
//       verificationToken
//     });
//     console.log(newUser);
//     await newUser.save();
  

//     // Send verification email
//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

    
//     const verifyUrl = `http://localhost:5000/auth/verify?token=${verificationToken}`;

//     await transporter.sendMail({
//       from: '"KalpQuiz" <no-reply@kalpquiz.com>',
//       to: email,
//       subject: 'Verify your KalpQuiz email',
//       html: `
//         <h3>Welcome to KalpQuiz!</h3>
//         <p>Click the link below to verify your email address:</p>
//         <a href="${verifyUrl}">${verifyUrl}</a>
//         <p>If you did not request this, ignore this email.</p>
//       `
//     });

//     res.status(201).json({ message: 'Signup successful! Please verify your email.' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });
//--------------
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const exists = await User.findOne({ email });
    console.log('hello');
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('📩 Email:', email);

    // ✅ Declare here — outside try block
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('🔐 Token:', verificationToken);

    const newUser = new User({
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      username,
    });
    console.log('💾 New user:', newUser);

    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const verifyUrl = `http://localhost:5000/auth/verify?token=${verificationToken}`;
    console.log('📨 Verify link:', verifyUrl);

    await transporter.sendMail({
      from: '"KalpQuiz" <no-reply@kalpquiz.com>',
      to: email,
      subject: 'Verify your KalpQuiz email',
      html: `
        <h3>${username},Welcome to KalpQuiz!</h3>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>If you did not request this, ignore this email.</p>
      `
    });

    res.status(201).json({ message: 'Signup successful! Please verify your email.' });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});






// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
   

    if (!user){ 
      // alert('invalid email or password');
      return res.status(401).json({ message: 'Invalid email or password' })}

    if (!user.isVerified) {
    return res.status(401).json({ message: 'Please verify your email before logging in.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const creditQuiz=user.creditQuiz;
    // Generate JWT
    const token = jwt.sign(
      { name: user.username,id:user.id,isAdmin: user.isAdmin,creditQuiz:user.creditQuiz},
      process.env.JWT_SECRET,
      { expiresIn: user.isAdmin ? '20m' : '30d' } // token valid for user is 30days and for admin only 20minute
    );

    res.status(200).json({ token,creditQuiz});
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});





// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: 'Invalid email or password' });

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

//     res.status(200).json({ message: 'Login successful', email: user.email });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });


router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('<h3>Email verified! You can now log in.</h3>');
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Forgot Password
// router.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'No account found with that email.' });

//     const token = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken =token;
//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // valid for 15 minutes
//     await user.save();

//     const resetLink = `http://localhost:1234/reset-password.html?token=${token}`; // point to frontend

//     await transporter.sendMail({
//       to: email,
//       from: '"KalpQuiz" <no-reply@kalpquiz.com>',
//       subject: 'Reset your KalpQuiz password',
//       html: `
//         <h3>Reset Your KalpQuiz Password</h3>
//         <p>Click below to reset your password:</p>
//         <a href="${resetLink}">${resetLink}</a>
//         <p>This link expires in 15 minutes.</p>
//       `
//     });

//     res.status(200).json({ message: 'Password reset link sent to your email.' });
//   } catch (err) {
//     console.error('❌ Forgot password error:', err.message);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // valid for 15 minutes
    await user.save();

    // ✅ DEFINE transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:1234/reset.html?token=${token}`;

    await transporter.sendMail({
      to: email,
      from: '"KalpQuiz" <no-reply@kalpquiz.com>',
      subject: 'Reset your KalpQuiz password',
      html: `
        <h3>Reset Your KalpQuiz Password</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error('❌ Reset password error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


//------------------------------------------------






//------------------------------------------------------

// aapne aa main (http://localhost:5000) na jode aa user route joday gayu. pa6i have aa protectedRoute profile pan joday gayu. aa profile ma ek jai sakse ke jeni pase JWT valid token hase . tene valid karvanu kam aa middleware nu 6e je jwt token mahi user ni detail ne  decode kare 6e.




export default router;
