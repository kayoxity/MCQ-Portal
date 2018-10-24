var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./models/user');

mongoose.connect("mongodb://localhost/test1", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));
app.set('view engine','ejs');


app.use(require('express-session')({
    secret : "Kayoxity is pro",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

app.get('/', (req,res) => {
    res.render('index');
});

//Login route
app.get('/login', (req,res) => {
    res.render('login');
});

app.post('/login',passport.authenticate('local', {
    successRedirect : '/home',
    failureRedirect : '/login'
}), (req,res) => {
});

//Logout route
app.get('/logout',(req,res) => {
    req.logout();
    res.redirect('/');
})

//Register route
app.get('/register', (req,res) => {
    res.render('register');
});

app.post('/register', (req,res) => {
    req.body.username;
    req.body.password;
    User.register(new User({username : req.body.username}), req.body.password , function(err,user) {
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req,res,function() {
            res.redirect('index');
        });
    });
});

app.get('/home' ,isLoggedIn, (req,res) => {
    res.render('home');
});


app.listen('3000', () => console.log('Listening on port 3000'));