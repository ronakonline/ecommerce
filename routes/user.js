var express = require('express');
var route = express.Router();
var db = require('../models')
var bcrypt = require('bcrypt')
var csrf = require('csurf');

//Middleware for csrf
var csrfprotection = csrf({})

//Middleware to check user is logged in or not
function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

//function to check entered password is correct or not 

function isvalidpassword(userpassword, password) {
    return bcrypt.compareSync(userpassword, password)
}


route.get('/', loggedIn, (req, res) => {
    db.address.findAll({
        raw: true,
        where: {
            user_id: req.user.id
        }
    }).then((list) => {
        //console.log(list)
        res.render('dashboard', { name: req.user.first_name, lastname: req.user.last_name, email: req.user.email, address: list, message: req.flash('info') });
    })

})


route.route('/addaddress')
    .get(loggedIn, csrfprotection, (req, res) => {
        res.render('add-address', { csrfToken: req.csrfToken(), name: req.user.first_name });
    })
    .post((req, res) => {
        var addressData = {
            user_id: req.user.id,
            flat: req.body.flat,
            add1: req.body.add1,
            landmark: req.body.landmark,
            zip: req.body.zipcode,
            city: req.body.city,
            state: req.body.state
        }
        db.address.create(addressData).then((address) => {
                //console.log(address)
                res.redirect('/user')
            }).catch((err) => {
                console.log(err);
            })
            //console.log(req.body);
    })

route.get('/updateaddress/:id', loggedIn, csrfprotection, (req, res) => {
    db.address.findOne({ where: { id: req.params.id } }).then((address) => {
        res.render('update-address', { csrfToken: req.csrfToken(), address: address, message: req.flash('info') })
    }).catch(err => {
        console.log(err)
    })

})

route.post('/updateaddress/:id', (req, res) => {
    db.address.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then((address) => {
        req.flash('info', 'Address Updated');
        res.redirect(`/user/updateaddress/${req.params.id}`)
    }).catch(err => {
        console.log(err)
    })
})

route.get('/deleteaddress/:id', loggedIn, (req, res) => {
    db.address.destroy({
        where: {
            id: req.params.id
        }
    }).then((msg) => {
        req.flash('info', 'Address Deleted')
        res.redirect('/user/');
    }).catch(err => {
        console.log(err)
    })
})

route.route('/changepassword')
    .get(loggedIn, csrfprotection, (req, res) => {
        res.render('change-password', { csrfToken: req.csrfToken(), name: req.user.first_name, info: req.flash('info'), error: req.flash('error') });
    })
    .post((req, res) => {
        var oldpassword = req.body.oldpassword;

        if (!isvalidpassword(oldpassword, req.user.password)) {
            req.flash('error', 'Incorrect Old Password');
            res.redirect('/user/changepassword');
        } else {
            const hash = bcrypt.hashSync(req.body.newpassword, 10)
            db.user.update({ password: hash }, {
                where: {
                    email: req.user.email
                }
            }).then((user) => {
                req.flash('info', 'Password Updated succssfully!')
                res.redirect('/user/changepassword');
            }).catch((err) => {
                console.log(err);
            })
        }
    })

module.exports = route;