const jwt = require('jsonwebtoken');


exports.generateToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET||"asdadd123987", {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use true in production (HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-origin for Swagger
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};




