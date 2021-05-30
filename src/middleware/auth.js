const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ' , '')
        // console.log(token)
        const decoded = jwt.verify(token , 'thisismynewcourse')
        // console.log(decoded)
        const user = await User.findOne( {_id : decoded._id , 'tokens.token': token} )
        
        req.tokens = token
        req.user = user
        next()

    } catch (error) {
            res.status(401).send({ error: 'Please Authenticate'})
    }
}

module.exports = auth