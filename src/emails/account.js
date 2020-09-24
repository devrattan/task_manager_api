const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name)=> {
    console.log('abc');
    sgMail.send({
        to   : email,
        from : "dev.rattan010@gmail.com",
        subject: "WELCOME",
        html : `<h1>Welcome</h1> <h2>${name}</h2><body><p>You can now avail our services, we expect your feedback</p></body>` 
    })
    console.log('def');
}

const sendCancellationEmail = (email,name)=>{
    sgMail.send({
        to   : email,
        from : "dev.rattan010@gmail.com",
        subject : "WELCOME",
        text : `GOODBYE ${name}. What could be done to keep you on board`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}