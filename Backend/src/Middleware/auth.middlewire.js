const userModel = require('../Models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../Models/blackList.model');

async function authMiddleware(req, res, next) {
    // check for token in cookies or Authorization header
    const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token is missing or invalid' });
    }

    // Check if token is blacklisted
    const isblacklistedToken = await tokenBlacklistModel.findOne({ token });
    if (isblacklistedToken) {
        return res.status(401).json({ message: 'Token has been revoked' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('+systemUser');
        req.user = user; // Attach user to request object
        next();
    }catch(err){
        console.error('Error in auth middleware:', err);
        return res.status(401).json({ message: 'Token is invalid' });
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token is missing or invalid' });
    }
    // Check if token is blacklisted
    const isblacklistedToken = await tokenBlacklistModel.findOne({ token });
    if (isblacklistedToken) {
        return res.status(401).json({ message: 'Token has been revoked' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('+systemUser');
        if (!user.systemUser) {
            return res.status(403).json({ message: 'Access denied. System user required.' });
        }
        req.user = user; // Attach system user to request object
        return next();
    }catch(err){
        console.error('Error in system auth middleware:', err);
        return res.status(401).json({ message: 'System token is invalid' });
    }
}

module.exports = {authMiddleware, authSystemUserMiddleware};