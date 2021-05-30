// IMPORTING NECESSARY 
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

// CREATING THE SCHEMA 
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim: true
    } , 
    email : {
        type: String,
        required: true, 
        unique: true,
        trim : true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Email is Invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
                if(validator.contains(value, 'password')) {
                    throw new Error("Password contains password")
                }
            }
    },
    age : {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error("The age should be a positive number")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }], 
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
   })

userSchema.methods.toJSON =function() {
    const user = this
    const userObjects = user.toObject()

    delete userObjects.password
    delete userObjects.tokens
    delete userObjects.avatar

    return userObjects
}

userSchema.methods.getAuthToken = async function() {
    const user = this
    const token =await jwt.sign({_id: user._id} , 'thisismynewcourse')

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Invalid login request')
    }

    const isMatch =await bcrypt.compare(password , user.password)
    if(! isMatch) {
        throw new Error('Invalid Login request')
    }
    return user
}

userSchema.pre('save' , async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password =await bcrypt.hash(user.password, 8) 
    }

    next()
})

userSchema.pre('remove' , async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

// CREATING USER MODEL 
const User = mongoose.model('User' , userSchema)

module.exports = User