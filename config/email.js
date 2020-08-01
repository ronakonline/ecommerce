var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ronakonline1@gmail.com',
        pass: 'kttkvhvglnysxoha'
    }
});



var mail = function(options) {
    transporter.sendMail(options, function(error, info) {
        if (error) {
            console.log(error);
            return false
        } else {
            console.log('Email sent: ' + info.response);
            return true
        }
    });
}

module.exports = mail