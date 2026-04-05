const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'No Authorization header — access denied' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED TOKEN:", decoded); // debug

    // ✅ FIX: match your token structure
    req.user = decoded.user;

    next();
  } catch (err) {
    console.error("JWT ERROR:", err);
    return res.status(401).json({ msg: 'Token invalid or expired — please log in again' });
  }
};