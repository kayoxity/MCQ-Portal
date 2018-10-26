var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./models/user'),
    {Test,Question} = require('./models/test');

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

var current = new Test({
    name : "",
    questions : []
});

var testss = [];

//Index page route

app.get('/', (req,res) => {
    res.render('index');
});

//Create-test route

app.get('/create',isLoggedIn,(req,res) => {
    res.render('create',{name:req.user.username});
});

app.post('/create',isLoggedIn,(req,res) => {
    var newTest = new Test({
        name : req.body.testname
    });
    newTest.save((err,test) => {
        if(err){
            console.log(err);
        }
        else{
            current = test;
        }
    });
    res.redirect('/create/1');
});

//Add questions route

app.get('/create/:num',isLoggedIn,(req,res) => {
    res.render('createQ',{qnumber : req.params.num,name:req.user.username});
});

app.post('/create/num',isLoggedIn, (req,res) => {
    current.questions.push({
        question : req.body.question,
        op1 : req.body.op1,
        op2 : req.body.op2,
        op3 : req.body.op3,
        op4 : req.body.op4,
        ans : req.body.ans
    });
    current.save((err,test) => {
        if(err){
            console.log(err);
        }
        else{
            current = test;
        }
    });
    var link = '/create/' + parseInt(req.body.qnumber, 10).toString();
    res.redirect(link);
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

//Home route

app.get('/home' ,function(req,res,next) {
    Test.find((err,test) => {
        if(err){
            console.log(err);
        }
        else{
            testss = test;
        }
        next();
    });
},
isLoggedIn, (req,res) => {
    
    res.render('home',{name:req.user.username,tests : testss});
});

//Test start route

app.get('/test/:num',function(req,res,next) {
    Test.find((err,test) => {
        if(err){
            console.log(err);
        }
        else{
            testss = test;
        }
        next();
    });
},
    isLoggedIn, (req,res) => {
        var num = req.params.num;
        console.log(testss[num]);
        res.render('test',{name:req.user.username,test:testss[num]});
});


app.listen('3000', () => console.log('Listening on port 3000'));