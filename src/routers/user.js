const express = require('express')
const User = require('../models/user.js')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelMail } = require('../emails/account')
const multer = require('multer')
const sharp = require('sharp')
// const sharp = require()
const router = new express.Router()

router.post('/users' , async (req, res) => {
    const user = new User((req.body))

    try {
        const token = await user.getAuthToken()
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login' , async (req, res) => {
    try {
        const user =await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.getAuthToken()
        res.send({user , token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => { 
            return token.token !== req.token
        })
        await req.user.save()

        res.send("Logged out")
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("Logged out of all")
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {

    res.send(req.user)
})


router.patch('/users/me' , auth,async(req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'email']
    const validatedInfo = updates.every((update) => allowedUpdates.includes(update))

    if (!validatedInfo) {
       return res.send({error: "Invalid update"})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/users/me' , auth, async(req, res) => {
    

    try {
        const _id = req.user._id
        await req.user.remove()
        sendCancelMail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits : {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error("File should be of image format"))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar' , auth ,upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(400).send()
    }
})

module.exports = router