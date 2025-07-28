
// middleware/adminCheck.js
export default (req, res, next) => {
  if (req.user?.username === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
};