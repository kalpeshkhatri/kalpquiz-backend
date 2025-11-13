
// function to check that user is admin or not... aa function ek middleware ni jem kaam kare 6e.aa function after authMiddleware pa6i use thay 6e karan ke aana mate aapne user ni token parthi information malse. je aapne login route ma set kari ne rakhi 6e.==> { id: user._id,isAdmin: user.isAdmin,creditQuiz:user.creditQuiz},
const isAdminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

export default isAdminMiddleware;