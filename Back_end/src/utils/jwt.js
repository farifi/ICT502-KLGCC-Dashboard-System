const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

// In a real app, store refresh tokens in DB or a dedicated store.
const refreshTokens = new Map(); // key: refreshToken, value: { id, email, name, role }

const signAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

const signRefreshToken = (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
  refreshTokens.set(token, user);
  return token;
};

const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_TOKEN_SECRET);

const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_TOKEN_SECRET);

const revokeRefreshToken = (token) => {
  refreshTokens.delete(token);
};

const hasRefreshToken = (token) => refreshTokens.has(token);

const getUserFromRefreshToken = (token) => refreshTokens.get(token);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  hasRefreshToken,
  getUserFromRefreshToken,
};


