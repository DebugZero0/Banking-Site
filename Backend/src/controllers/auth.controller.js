const router = require('express').Router();
const UserModel = require('../Models/user.model');
const jwt=require('jsonwebtoken');
const emailService = require('../services/email.service');
const tokenblackListModel = require('../Models/blackList.model');



async function register(req, res) {
    const { email, password, name } = req.body;

    const isExistingUser = await UserModel.findOne({ email });
    if (isExistingUser) {
        return res.status(422).json({ message: 'Email already exists', status:'failed' });
    }
    const user = new UserModel({ email, password, name });
    await user.save();

    const token = jwt.sign({id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
    res.cookie('token', token);

    res.status(201).json({ 
        message: 'User registered successfully', 
        status:'success', 
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
            systemUser: user.systemUser,
            lastLoginAt: user.lastLoginAt,
            lastLogoutAt: user.lastLogoutAt,
        },
        token 
    });

    // Send registration email
    await emailService.sendRegistrationEmail(user.email, user.name);
}

async function login(req, res) {
    const { email, password } = req.body;
    const user= await UserModel.findOne({ email }).select('+password +systemUser'); // 
    if(!user){
        return res.status(401).json({ message: 'Invalid email or password', status:'failed' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password', status:'failed' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign({id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token);

    res.status(200).json({ 
        message: 'Login successful', 
        status:'success', 
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
            systemUser: user.systemUser,
            lastLoginAt: user.lastLoginAt,
            lastLogoutAt: user.lastLogoutAt,
        },
        token });
}

async function logout(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Get token from cookie or Authorization header
    if (!token) {
        return res.status(400).json({ message: 'No token provided', status:'failed' });
    }
    res.clearCookie('token'); // Clear the token cookie

    // Add the token to the blacklist
    await tokenblackListModel.create({ token: token });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
            await UserModel.findByIdAndUpdate(decoded.id, { lastLogoutAt: new Date() });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', status:'failed' });
    }

    res.status(200).json({ message: 'Logout successful', status:'success' });
}

module.exports = {
    register,
    login,
    logout
};
