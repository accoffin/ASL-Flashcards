const nodemailer = require("nodemailer");

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.HOST_EMAIL}`,
        pass: `${process.env.EMAIL_AUTH}`,
    }
});

const confirmationEmail = (id, email) => {
    return {
        from: `Derek Noble <${process.env.HOST_EMAIL}>`,
        to: `${email}`,
        subject: 'Let\'s keep in touch',
        html: `<body>
            <h1>Hello!</h1>
            <p>Thank you for using ASL Flashcards. Confirm your email address below</p>
            <a href="${process.env.APPLICATION_URL}/user/${id}/update?confirmed=true">Confirm</a>
        </body>`,
    };
};

module.exports = { mailTransporter, confirmationEmail };