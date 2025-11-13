// middlewares/rateLimiter.js
import redisClient from '../models/redisClient.js';

// const rateLimiter = (limit, windowInSeconds) => {
//   return async (req, res, next) => {
//     try {
//       // Skip rate limit for admins or special users
//       if (req.user?.isAdmin || req.user?.isSpecial) {
//         return next();
//       }

//       const ip = req.ip || req.connection.remoteAddress;
//       const key = `rate_limit:${ip}`;

//       const currentCount = await redisClient.get(key);

//       if (currentCount) {
//         if (parseInt(currentCount) >= limit) {
//           return res.status(429).json({ error: 'Too many requests, slow down.' });
//         }
//         await redisClient.incr(key);
//       } else {
//         await redisClient.set(key, 1, { EX: windowInSeconds });
//       }

//       next();
//     } catch (err) {
//       console.error('Rate limiter error:', err);
//       next();
//     }
//   };
// };

const rateLimiter =(maxRequests, windowSeconds)=>{
  return async (req, res, next) => {
    try {
      // Skip admins & special users
      if (req.user && (req.user.isAdmin || req.user.isSpecial)) {
        return next();
      }
      if (req.path.startsWith('/kalpquizwebhook')) {
      return next();
    }

      // Use user ID if logged in, else IP
      const identifier = req.user?.id || req.ip;
      const redisKey = `rate:${identifier}`;

      // Increment request count
      const currentCount = await redisClient.incr(redisKey);

      // First request in the window → set expiry
      if (currentCount === 1) {
        await redisClient.expire(redisKey, windowSeconds);
      }

      // If over limit → block
      if (currentCount > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
        });
      }

      next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      // Fail open if Redis fails
      next();
    }
  };
}

export default rateLimiter;