// IMPORTING NECESSARY 
const mongoose = require('mongoose')

// CONNECTION 
mongoose.connect(process.env.MONGODB_CONNECTION , {
    useNewUrlParser: true,
    useCreateIndex: true
})