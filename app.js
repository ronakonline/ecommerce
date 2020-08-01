var express = require('express');
var hbs = require('hbs');
var path = require('path');
var auth = require('./routes/auth');
var user = require('./routes/user');
var bodyPareser = require('body-parser');
var session = require('express-session');
const db = require('./models');
var passport = require('passport')
var flash = require('connect-flash');

const app = express()


app.use(session({
    secret: "cats",
    saveUninitialized: true,
    resave: true
}));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());


const publicpath = path.join(__dirname, './public')

const partialpath = path.join(__dirname, './views/partials')

app.use(bodyPareser.urlencoded({ extended: false }))

app.set("views", "views");
app.set("view engine", "hbs")

hbs.registerPartials(partialpath)

app.use(express.static(publicpath))

app.use('/', auth)
app.use('/user', user)

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

// // error handler middleware
// app.use((error, req, res, next) => {
//     res.status(error.status || 500).render('error', {
//         error: {
//             status: error.status || 500,
//             message: 'Internal Server Error',
//         },
//     });
// });

db.sequelize.sync();
app.listen(3000)