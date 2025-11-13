// import express from 'express';
// import { authenticateToken } from '../middlewares/authMiddleware.js';
// import User from '../models/user.js';
// import { GoogleGenAI} from "@google/genai";
// import dotenv from 'dotenv';

// dotenv.config();
// const router = express.Router();

// Setup Gemini API
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
// let History=[]

import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

//-------------------------------------
// Helper function to generate JWT
// function generateToken(user) {
//   return jwt.sign(
//     {
//       name: user.username,
//       id: user._id,
//       isAdmin: user.isAdmin,
//       creditQuiz: user.creditQuiz
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: user.isAdmin ? '20m' : '30d' }
//   );
// }

//-------------------------------------
// Create quiz
router.post('/create', authenticateToken, async (req, res) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let History = [];

  try {
    console.log(req.body);
    const { Language, Level, maintopic1, subtopic1 ,nos1} = req.body;
    console.log(Language, Level, maintopic1, subtopic1 ,nos1 );
    const { id } = req.user;

    // Find user from DB
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.creditQuiz <= 0 || user.creditQuiz < nos1 || nos1>50) {
      return res.json({ redirectTo: '/payment' });
    }

    History.push({
      role: 'user',
      parts: [{
        text: `create ${nos1} Question related to this main topic  is ${maintopic1} and its sub topic is  ${subtopic1}.Question level should be ${Level}.Give me in ${Language}.`
      }]
    });

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: History,
      config: {
        systemInstruction: `
          if someone asks question that create questions related to any that topic then  you have to give then in array where element is object like {question:'',option1:'',option2:'',option3:'',option4:'',answer:''}. 
          for example someone want 1 question related to plane crash.your output should be: [{question:"Which part of the airplane is responsible for propulsion?",
          option1:"Fuselage",
          option2:"Cockpit",
          option3:"Engine",
          option4:"Rudder",
          answer:"Engine"
          }]

          don't do mistake give the full question.

          In mathematical question if question include something like this (a+b)^n then convert it to (a + b)ⁿ.
          In mathematical question if question include something like this  **a** = 2**i** + 3**j** then convert it to  a = 2i + 3j.

          sticktly don't ask me any question. if i give you topic and number you have to give question array in the form of json.
        `
      }
    });

    // Deduct 1 credit
    user.creditQuiz -= nos1;
    await user.save();

    // Generate new token
    // const newToken = generateToken(user);
    console.log(response.text);
    // const allquestion=await response.text;
    // console.log(allquestion)

    res.json({
      questions: response.text,
      creditQuiz: user.creditQuiz,
      // token: newToken
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

//-------------------------------------
// Create quiz without repeating previous
router.post('/createfornotreapeat', authenticateToken, async (req, res) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let History = [];

  try {
    const {Language, Level, maintopic1, subtopic1,previousquestion2,nos1 } = req.body;
    const { id } = req.user;
    console.log(Language, Level, maintopic1, subtopic1,previousquestion2,nos1)

    const user = await User.findById(id);
    // console.log(user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.creditQuiz <= 0 || user.creditQuiz < nos1 || nos1>50) {
      return res.json({ redirectTo: '/payment' });
    }

    History.push({
      role: 'user',
      parts: [{
        text: `create ${nos1} Question related to this main topic is ${maintopic1} and its sub topic is ${subtopic1}.Question level should be ${Level}.Give me in ${Language}.Dont repeat these questions:${previousquestion2}.`
      }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: History,
      config: {
        systemInstruction: `
          if someone asks question that create questions related to any that topic then  you have to give then in array where element is object like {question:'',option1:'',option2:'',option3:'',option4:'',answer:''}. 
          for example someone want 1 question related to plane crash.your output should be: [{question:"Which part of the airplane is responsible for propulsion?",
          option1:"Fuselage",
          option2:"Cockpit",
          option3:"Engine",
          option4:"Rudder",
          answer:"Engine"
          }]

          don't do mistake give the full question.

          In mathematical question if question include something like this (a+b)^n then convert it to (a + b)ⁿ.
          In mathematical question if question include something like this  **a** = 2**i** + 3**j** then convert it to  a = 2i + 3j.

          sticktly don't ask me any question. if i give you topic and number you have to give question array in the form of json.
        `
      }
    });

    user.creditQuiz -= nos1;
    await user.save();

    // const newToken = generateToken(user);
    // const allquestion=await response.text
    // console.log(response);
    console.log(response.text);

    res.json({
      questions: response.text,
      creditQuiz: user.creditQuiz,
      // token: newToken
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

export default router;


///////////////////////////////////////////////////////////////////
///////////////////////////////
////////////////////
////////////////
//////////





// router.post('/create', authenticateToken, async (req, res) => {
//     const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
//     let History=[]
//   try {
//     const { number, Language, Level, maintopic, subtopic} = req.body;

//     const { id, creditQuiz } = req.user;

//     // 1. Check user credits
//     const user = await User.findById(id);
//     if (!user) return res.status(404).json({ message: 'User not found' });


//     if (creditQuiz <= 0) {
//       return res.json({ redirectTo: '/payment' });
//     }

//     History.push({
//                 role:'user',
//                 parts:[{text:`create ${number} Question related to this main topic  is ${maintopic} and its sub topic is  ${subtopic}.Question level should be ${Level}.Give me in ${Language}.`}]
//             })

    
//     // 3. Call Gemini API
//     // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
//     // const result = await model.generateContent(prompt);
//     const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents:History,
//         config:{
//          systemInstruction: `
//         if someone asks question that create questions related to any that topic then  you have to give then in array where element is object like {question:'',option1:'',option2:'',option3:'',option4:'',answer:''}. 
//          for example someone want 1 question related to plane crash.your output should be: [{question:"Which part of the airplane is responsible for propulsion?",
//          option1:"Fuselage",
//         option2:"Cockpit",
//         option3:"Engine",
//         option4:"Rudder",
//         answer:"Engine"
//         }]

//         don't do mistake give the full question.

//         In mathematical question if question include something like this (a+b)^n then convert it to (a + b)ⁿ.
//         In mathematical question if question include something like this  **a** = 2**i** + 3**j** then convert it to  a = 2i + 3j.


//         sticktly don't ask me any question. if i give you topic and number you have to give question array in the form of json.
//         `,
//         // tools:[{
//         //     functionDeclarations:[createquestiondeclaration]
//         // }]
//     }
//        })








//     // const text = result.response.text();

//     // 4. Deduct 1 credit after success
//     creditQuiz -= 1;
//     await user.save();

//     // 5. Return questions
//     res.json(response.text);

//   } catch (error) {
//     console.error('Error creating quiz:', error);
//     res.status(500).json({ message: 'Failed to create quiz' });
//   }
// });




// //-------------------------------------
// router.post('/createfornotreapeat', authenticateToken, async (req, res) => {
//     const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
//     let History=[]
//   try {
//     const { number, Language, Level, maintopic, subtopic ,Previousquestion} = req.body;

//     const userId = req.user.id;

//     // 1. Check user credits
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });


//     if (user.creditQuiz <= 0) {
//       return res.json({ redirectTo: '/payment' });
//     }

//          History.push({
//                 role:'user',
//                 parts:[{text:`create ${number} Question related to this main topic  is ${maintopic} and its sub topic is  ${subtopic}.Question level should be ${Level}.Give me in ${Language}.Dont repeat these questions:${Previousquestion}.`}]
//             })
    
//     // 3. Call Gemini API
//     // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
//     // const result = await model.generateContent(prompt);
//     const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents:History,
//         config:{
//          systemInstruction: `
//         if someone asks question that create questions related to any that topic then  you have to give then in array where element is object like {question:'',option1:'',option2:'',option3:'',option4:'',answer:''}. 
//          for example someone want 1 question related to plane crash.your output should be: [{question:"Which part of the airplane is responsible for propulsion?",
//          option1:"Fuselage",
//         option2:"Cockpit",
//         option3:"Engine",
//         option4:"Rudder",
//         answer:"Engine"
//         }]

//         don't do mistake give the full question.

//         In mathematical question if question include something like this (a+b)^n then convert it to (a + b)ⁿ.
//         In mathematical question if question include something like this  **a** = 2**i** + 3**j** then convert it to  a = 2i + 3j.


//         sticktly don't ask me any question. if i give you topic and number you have to give question array in the form of json.
//         `,
//         // tools:[{
//         //     functionDeclarations:[createquestiondeclaration]
//         // }]
//     }
//        })

//     // const text = result.response.text();

//     // 4. Deduct 1 credit after success
//     user.creditQuiz -= 1;
//     await user.save();

//     // 5. Return questions
//     res.json(response.text);

//   } catch (error) {
//     console.error('Error creating quiz:', error);
//     res.status(500).json({ message: 'Failed to create quiz' });
//   }
// });







// export default router;
