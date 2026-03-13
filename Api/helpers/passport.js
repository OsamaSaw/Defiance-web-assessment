require('dotenv').config();  // ADD THIS LINE AT THE VERY TOP

const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy } = require('passport-jwt');
const { Strategy: CustomStrategy } = require('passport-custom');

const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Rt = require('../models/rt');
const {
  WrongEmail,
  WrongPassword,
  ServerError,
  Unauthorized,
  MissingRefreshToken,
  ExpiredRefreshToken,
  DeletedAccount,
  InactiveAccount,
  UnauthorizedRefreshToken
} = require('./response');

const optionsJwt = {
  jwtFromRequest: req => {
    if (req && Object.keys(req.cookies).length && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }
    return null;
  },
  secretOrKey: process.env.JWT_SECRET
};

const optionsRefreshToken = {
  jwtFromRequest: req => {
    if (req && Object.keys(req.cookies).length && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return null;
  },
  secretOrKey: process.env.RT_SECRET
};

module.exports = passport => {
  // ... rest of your code remains the same
};