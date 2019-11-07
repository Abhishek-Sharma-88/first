if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find( user => user.email === email),
    id => users.find(user => user.id === id)
    );

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(cookieParser('your secret here'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

users = [];

app.get('/', (req, res) => {
    res.render('index.ejs', {name:'Abhishek'});
})

app.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs');
});

app.get('/fee', checkAuthenticated, (req, res)=>{
    res.render('fee');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs');
});

//db connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/abhi-login', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    username: String, email: String, password: String
});

const User = mongoose.model('User', userSchema);
app.post('/register', async (req, res)=>{

    // console.log(req.body.password);
    
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        req.body.password = hashedPassword;

        User(req.body).save((err, data) => {
            if(err) throw err;
        });

        users.push({
         id: Date.now().toString(),
         name: req.body.name,
         email: req.body.email,
         password: hashedPassword   
        });
        console.log('user registered: ', users);
        
        res.redirect('/login');
    } catch (error) {
        res.redirect('/register');
    }
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

app.listen(4000, ()=>{
    console.log('server is listening at port 4000');
})