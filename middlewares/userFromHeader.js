// middleware/userFromHeader.js
module.exports = function (req, res, next) {
  const userHeader = req.header('x-user-data');
  if (!userHeader) return res.status(401).json({ error: 'User not provided' });

  try {
    const user = JSON.parse(userHeader);
    if (!user.id) return res.status(400).json({ error: 'Invalid user data' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Invalid user JSON' });
  }
};
