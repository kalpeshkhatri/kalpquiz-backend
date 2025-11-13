import express from 'express';
import redisClient from '../models/redisClient.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';


// const router = express.Router();

// // GET /debug/rate-limits → sorted by highest request count
// router.get('/rate-limits', async (req, res) => {
//   try {
//     const pattern = 'rate:*'; // match all rate limiter keys
//     const keys = await redisClient.keys(pattern);

//     if (keys.length === 0) {
//       return res.json({ message: 'No rate limiter data found', data: [] });
//     }

//     // Fetch values & TTLs
//     const values = await Promise.all(keys.map(key => redisClient.get(key)));
//     const ttlValues = await Promise.all(keys.map(key => redisClient.ttl(key)));

//     // Combine into an array
//     let data = keys.map((key, index) => ({
//       key,
//       count: parseInt(values[index]),
//       ttl: ttlValues[index]
//     }));

//     // Sort by highest count first
//     data.sort((a, b) => b.count - a.count);

//     res.json({
//       totalKeys: keys.length,
//       data
//     });
//   } catch (err) {
//     console.error('Error fetching rate limiter keys:', err);
//     res.status(500).json({ error: 'Redis fetch failed' });
//   }
// });

//------------------


const router = express.Router();

// Helper to determine key type
function detectKeyType(key) {
  const value = key.replace('rate:', '');
  // Simple IPv4 match
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(value)) return 'IP';
  return 'User';
}

router.get('/rate-limits', authenticateToken,isAdminMiddleware,async (req, res) => {
  try {
    const pattern = 'rate:*';
    const keys = await redisClient.keys(pattern);

    if (keys.length === 0) {
      return res.json({ message: 'No rate limiter data found', data: [] });
    }

    const values = await Promise.all(keys.map(key => redisClient.get(key)));
    const ttlValues = await Promise.all(keys.map(key => redisClient.ttl(key)));

    let data = keys.map((key, index) => ({
      key,
      type: detectKeyType(key), // New: IP or User
      count: parseInt(values[index]),
      ttl: ttlValues[index]
    }));

    data.sort((a, b) => b.count - a.count);

    res.json({
      totalKeys: keys.length,
      data
    });
  } catch (err) {
    console.error('Error fetching rate limiter keys:', err);
    res.status(500).json({ error: 'Redis fetch failed' });
  }
});

export default router;



// redis no client banava mate aapne (memurai) ne install karyu 6e.te run hovu joiye aapna computer ma te check karva mate aapne services ma jaine aapne te check karvanu ke aa runnning 6e ke nahi.
// pa6i aapne cmd ma jaine aapne check karie ke aapne website wapariye to data aavta hase. aapne cmd ma ==>
  //c:\>"C:\Program Files\Memurai\memurai-cli.exe" -h 127.0.0.1 -p 6379
// aa upar valu kariye to niche mujab data aavse.
  //127.0.0.1:6379>
//have aapne tema keys rate:* lakhvanu to ==>127.0.0.1:6379> keys rate:*
  //TO output ma aa aavse:
  //  1) "rate:::1"
//that means your backend is successfully writing to Redis.





//have aapne admin panel ma aa Redis na data display thay tene mate aapne aa route banavyo 6e. je only admin j dekhi sakse.
//  http://localhost:5000/debug/rate-limits





