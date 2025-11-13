import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';
// import Maintopic1 from '../models/maintopic.js';
import Maintopic2 from '../models/maintopic.js';

import QuizPlan from '../models/quizplancredit.js'; //payment karva mate aa database mathi data leva mate


const router = express.Router();


// router.post('/setup-maintopics', authenticateToken, isAdminMiddleware, async (req, res) => {
//   // Only admin can reach here
//    try {
//     const maintopicobject =[{name:'Physics',symbol:'&#9881'},
//     {name:'Chemistry',symbol:'&#128167'},
//     {name:'Biology',symbol:'&#129410'},
//     {name:'Mathematics',symbol:'&#10135;'},
//     {name:'Engineering',symbol:'&#128295'},
//     {name:'Programming_Language',symbol:'&#128187'},
//     {name:'Computer_Engineering',symbol:'&#128421'},
//     {name:'Data_Structure_Algo',symbol:'&#128230'},
//     {name:'Civil_Engineering',symbol:'&#128679'},
//     {name:'Sports',symbol:'&#128250'},
//     {name:'Geography',symbol:'&#128506;&#65039;'},
//     {name:'Music',symbol:'&#127932'},
//     {name:'Movies',symbol:'&#127910'},
//     {name:'Television',symbol:'&#128250'},
//     {name:'Just_For_Fun',symbol:'&#128540'},
//     {name:'History',symbol:'&#128220'},
//     {name:'Literature',symbol:'&#129501'},
//     {name:'Language',symbol:'&#129311'},
//     {name:'Science',symbol:'&#129514'},
//     {name:'Gaming',symbol:'&#128377;&#65039'},
//     {name:'Entertainment',symbol:'&#127904'},
//     {name:'Religions',symbol:'&#128329;&#65039'},
//     {name:'Holiday',symbol:'&#129489;&#8205;&#127876'},
//     {name:"Novel" ,symbol:"&#128218;"},
//     {name:"Famous_Books" ,symbol:"&#128213;"},
//     {name:"Mythological_Book" ,symbol:"&#128330;"},
//     {name:"Indian_States" ,symbol:"&#127757;"},
//     {name:"Cars" ,symbol:"&#128663;"},
//     {name:"World_Culture" ,symbol:"&#127760;"},
//     {name:"Indian_Culture" ,symbol:"&#128966;"},
//     {name:"Tribes" ,symbol:"&#129492;"},
//     {name:"Countries" ,symbol:"&#127758;"}
    

// ]


//     await Maintopic1.deleteMany(); // optional: clear previous entries
//     await Maintopic1.insertMany(maintopicobject);

//     res.status(200).json({ message: 'Maintopics initialized' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error inserting maintopics', error: err.message });
//   }

// });

//----------------------------------------------

// POST /add-main-topic route:
router.post('/add-main-topic', authenticateToken, isAdminMiddleware, async (req, res) => {
      try{
      const { name, symbol, subtopics } = req.body;
      // je req.body hase tema object 6e. to tenu destructuring kari ne tamathi name,symbol,subtopic lai lidha.
      
      const newMainTopic = new Maintopic2({ name, symbol, subtopics });
      await newMainTopic.save();
      res.status(200).json({ message: 'Added Maintopic to database' });
      }
      catch(err){
        console.log(err);
        res.status(500).json({ message: 'Error inserting maintopics'});
      }
})



//GET all main topics
router.get('/main-topics', authenticateToken , isAdminMiddleware, async (req, res) => {
  const topics = await Maintopic2.find();
  // aa karvathi Maintopic2 model collection mathi  jetla pan document hase te badha aapan ne aa topics ma aavta rahse.aa asynchronous process 6e to vaar to lagse etle await aavse.aa topic ma badha array na form ma aavi jase.=>[{id: ,name: ,symbol:  ,subtopics:[{name:  ,symbol: },{} ]},{},{}]
  res.json(topics);
});


//DELETE main topic
router.delete('/main-topic/:id',  authenticateToken ,isAdminMiddleware, async (req, res) => {
  await Maintopic2.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

//PUT (Update) main topic
router.put('/main-topic/:id',  authenticateToken ,isAdminMiddleware, async (req, res) => {
  const { name, symbol, subtopics } = req.body;
  const updated = await Maintopic2.findByIdAndUpdate(
    req.params.id,
    { name, symbol, subtopics },
    { new: true }
  );
  res.json({ message: 'Updated', data: updated });
});

//


//-------------------------------------------payment mate admin panel---------------------
router.get("/adminplan",authenticateToken,isAdminMiddleware,async (req, res) => {
  try {
    const plans = await QuizPlan.find();
    console.log(plans)
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz plans" });
  }
});

// ADD new plan
router.post("/adminplan", authenticateToken,isAdminMiddleware,async (req, res) => {
  try {
    const newPlan = new QuizPlan(req.body);
    await newPlan.save();
    res.json(newPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE plan
router.put("/adminplan/:id", authenticateToken,isAdminMiddleware,async (req, res) => {
  try {
    const updatedPlan = await QuizPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE plan
router.delete("/adminplan/:id", authenticateToken,isAdminMiddleware,async (req, res) => {
  console.log(req);
  try {
    await QuizPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






export default router;


