import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
// import Maintopic1 from '../models/maintopic.js';
import Maintopic2 from '../models/maintopic.js';

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to your profile!', user: req.user });
});




//Fetching the data (for all users)

// router.get('/maintopics', authenticateToken,async (req, res) => {
//   try {
//     const topics = await Maintopic1.find();
//     res.json(topics);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch topics', error: err.message });
//   }
// });




//Updating or Adding New Topics (admin route)
// router.post('/update-topic',authenticateToken,async (req, res) => {
//   const { name, symbol } = req.body;

//   try {
//     const updated = await Maintopic1.findOneAndUpdate(
//       { name },
//       { symbol },
//       { new: true, upsert: true } // create if not exists
//     );

//     res.json({ message: 'Updated or created successfully', topic: updated });
//   } catch (err) {
//     res.status(500).json({ message: 'Update failed', error: err.message });
//   }
// });

router.get('/main-topics-names', authenticateToken,async (req, res) => {
  try {
    const topics = await Maintopic2.find({}, { name: 1, symbol: 1, _id: 0 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get('/allmain&subtopic',authenticateToken ,async (req, res) => {
  try {
    const topics = await Maintopic2.find({});

    const result = {};

    topics.forEach(topic => {
      result[topic.name] = topic.subtopics.map(sub => ({
        name: sub.name,
        symbol: sub.symbol
      }));
    });

    res.json(result); // return full object
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});








export default router;
