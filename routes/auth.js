var express = require('express');
var route = express.Router()
var db = require('../models');
var session = require('express-session');
var passport = require('passport')
var local = require('passport-local').Strategy;
var flash = require('connect-flash');
var nodemailer = require('../config/email');
var bcrypt = require('bcrypt');

//Passport Local Strategy for login process
passport.use('loginn', new local({

        usernameField: 'email',

        passwordField: 'password',

        passReqToCallback: true // allows us to pass back the entire request to the callback

    },
    function(req, email, password, done) {
        // console.log(username)
        var isValidPassword = function(userpass, password) {

            return bcrypt.compareSync(password, userpass);

        }
        db.user.findOne({
            where: {
                email: email
            }
        }).then((user) => {
            if (!user) {

                return done(null, false, {
                    message: 'Email does not exist'
                });

            }
            if (!isValidPassword(user.password, password)) {

                return done(null, false, {
                    message: 'Incorrect password.'
                });

            }
            var userinfo = user.get();
            //console.log(userinfo);
            return done(null, userinfo);
        }).catch((err) => {
            console.log("Error:", err);

            return done(null, false, {
                message: 'Something went wrong with your Signin'
            });
        })
    }
));

//Passport Serialization of user
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

//Passport Deserialize of user
passport.deserializeUser(function(id, done) {
    db.user.findOne({
        where: {
            id: id
        }
    }).then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err, null)
    })

});




route.get("/", (req, res) => {
    //Checks if user is looged in or not
    if (req.user) {
        res.render('index', { name: req.user.first_name });
    } else {
        res.render('index')
    }

})

route.get("/register", (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('register')
    }

})

route.post("/register", (req, res) => {
    //Checks if email is already in use or not
    db.user.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        //If email is not in use then create a new account
        if (!user) {
            //Genrates a random 16 digit random token
            var token = require('crypto').randomBytes(16).toString('hex');
            //Hash the password before storing
            let hash = bcrypt.hashSync(req.body.password, 10);
            //User object for all data
            var user = {
                    first_name: req.body.fname,
                    last_name: req.body.lname,
                    email: req.body.email,
                    password: hash,
                    token: token
                }
                //Create new user in database
            db.user.create(user).then((user) => {
                //Sending a verification email to user
                let message = "<h1>Verify your account!</h1><p><a href='";
                message += `/verifyemail?email=${user.email}&token=${user.token}`
                message += "'>click here</a></p>"
                var mailOptions = {
                    from: 'ronak@gmail.com',
                    to: user.email,
                    subject: 'Sending Email using Node.js',
                    html: message
                };
                nodemailer(mailOptions)
                req.session.email = user.email
                res.redirect('/emailverify')

            }).catch((err) => {
                console.log(err)
            })

        } else {
            req.flash('info', 'Email Already Taken!')
            res.redirect('/register')
        }

    }).catch((err) => {
        console.log(err)
    })


})

route.get('/emailverify', (req, res) => {
    //Checks if user email is in session 
    if (req.session.email) {
        console.log(req.session)
        res.render('emailverify', { messages: req.flash('error') });
    } else {
        throw new Error("Something Went Wrong")
    }

})

route.get('/resendemail', (req, res) => {
    if (req.query.email) {
        token = require('crypto').randomBytes(16).toString('hex');
        db.user.update({ token: token }, {
            where: {
                email: req.query.email
            }
        }).then((user) => {
            if (user) {
                req.flash('error', 'Mail Resend');
                res.redirect('/emailverify')
            } else {
                throw new Error("Something Went Wrong")
            }

        })
    } else {
        throw new Error("Something Went Wrong")
    }

})

route.get('/verifyemail', (req, res) => {
    if (req.query.email && req.query.token) {
        db.user.findOne({
            where: {
                email: req.query.email,
                token: req.query.token
            }
        }).then((user) => {
            if (!user) {
                throw new Error("Link Expired!")
            } else {
                db.user.update({ everify: 1 }, {
                    where: {
                        email: req.query.email,
                        token: req.query.token
                    }
                }).then((user) => {
                    res.render('verified', {
                        title: 'Verified',
                        message: 'Yehhhhhh! your account is verified now you can login.'
                    })
                })
            }
        }).catch((err) => {
            console.log(err)
        })
    }
})

route.get('/login', (req, res) => {
    if (req.user) {
        res.redirect('/')
    } else {
        res.render('login', { messages: req.flash('error') })
    }

})

route.post('/login',
    passport.authenticate('loginn', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {
        // console.log(req.body);
        res.redirect('/')
    }
);

route.post("/emailtaken", (req, res) => {
    db.user.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        if (Boolean(user)) {
            res.send("Email already taken!")
        } else {
            res.status = 501;
        }
    })
})

route.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})





module.exports = route