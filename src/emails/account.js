const mailgun = require("mailgun-js");
const DOMAIN = "sandboxd00406bd0a964797b59d4ef4156ec847.mailgun.org";
const api = "907b39c1a3d9493dd5d254652d52f76e-fa6e84b7-1ffa661e"
const mg = mailgun({apiKey: api , domain: DOMAIN});


const sendWelcomeEmail = (email, name) => {
    mg.messages().send({
        from: "Saransh <saransh.kanungo7@gmail.com>",
        to: email,
        subject: "Thanks for Joining",
        text: `Welcome to the app, ${name}. Let me know how are you doin?`
    });
}

const sendCancelMail = (email, name) => {
    mg.messages().send({
        from: "Saransh <saransh.kanungo7@gmail.com>",
        to: email,
        subject: "Why are you cancelling?",
        text: `Hey ${name}, we noticed that you deleted our application, Everything fine?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelMail
} 
