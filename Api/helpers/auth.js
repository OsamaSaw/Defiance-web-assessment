const jwt = require('jsonwebtoken');

const generateToken = async (res, user) => {
  // Handle both real user objects and mock user objects
  const userId = user._id || user.id;
  const userEmail = user.email;
  const userRole = user.role || 'user';
  
  const accessToken = jwt.sign(
    {
      id: userId,
      email: userEmail,
      role: userRole
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    {
      id: userId,
      email: userEmail,
      role: userRole
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
  
  // Set cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });
  
  res.cookie('logged', true, {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });
  
  return { accessToken, refreshToken };
};

const clearTokens = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('logged');
};

module.exports = {
  generateToken,
  clearTokens
};