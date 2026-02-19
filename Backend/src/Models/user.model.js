const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Basic email validation regex
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // Exclude password from query results by default
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    lastLogoutAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Pre-save hook to hash the password before saving the user document
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return;
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


    const UserModel = mongoose.model('User', userSchema);

    module.exports = UserModel;