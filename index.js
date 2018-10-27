var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./models/user'),
    Test = require('./models/test');

mongoose.connect("mongodb://localhost/test1", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
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





var testSchema = [];



// var testModel = mongoose.model("usertest",testSchema);

var current = new Test({
    name : "",
    questions : []
});

var currentProfile = new User({
    username : "",
    password : "",
    tests : [],
    type : "",
    gender : "",
    roll : "",
    college : "",
    email : ""
});

var testss = [];







//Index page route

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
});

//Register route
app.get('/register', (req,res) => {
    res.render('register');
});

app.post('/register', (req,res) => {
    req.body.username;
    req.body.password;
    User.register(new User({
        username : req.body.username,
        type : "Setter",
        gender : req.body.gender,
        roll : req.body.roll,
        college : req.body.college,
        email : req.body.email
    }), req.body.password , function(err,user) {
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req,res,function() {
            res.redirect('/');
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
isLoggedIn,
function(req,res,next) {
    User.find({ username : req.user.username}).populate("tests").exec((err,user) => {
        if(err){
            console.log(err)
        }
        else{
            testSchema = user[0].tests;
            // console.log(testSchema);
        }
        
        next();
    });
},(req,res) => {
    
    let y = [];
    for(var i = 0;i<testSchema.length;i++){
        y.push(testSchema[i].testname)
    }
    // console.log(y);
    res.render('home',{name:req.user.username,tests : testss,testSchema : y});
});


//Profile route
app.get('/profile',isLoggedIn,(req,res) => {
    // console.log(req.user);
    res.render('profile',{
        name : req.user.username,
        email : req.user.email,
        college : req.user.college,
        roll : req.user.roll
    });
});

//Edit profile route
app.get('/editprofile',isLoggedIn,(req,res) => {
    res.render('editprofile',{
        name : req.user.username,
        email : req.user.email,
        college : req.user.college,
        roll : req.user.roll,
        gender : req.user.gender
    });
});

app.post('/editprofile',isLoggedIn,(req,res) => {
    // console.log(req);
    User.updateOne({
        username:req.user.username},{
            username : req.body.username,
            email : req.body.email,
            college : req.body.college,
            roll : req.body.roll,
            gender : req.body.gender
        },
        (err,user) => {
            if(err){
                console.log(err);
            }
            else{
                // console.log(user);
            }
        }
    );

    res.redirect('/editprofile');
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
        current = testss[num];
        res.render('test',{name:req.user.username,test:testss[num]});
});

app.post('/test/num',isLoggedIn,(req,res) => {
        User.updateOne({
            username:req.user.username},
            {$push: {tests:{testname:current.name,score:req.body.score,taken:true}}},
            (err,user) => {
                if(err){
                    console.log(err);
                }
                else{
                    // console.log(user);
                }
            }
        );
        res.redirect('/home');
});

//Scorecard route
app.get('/scorecard',isLoggedIn,(req,res) => {
    res.render('scorecard',{name:req.user.username});
});


app.get('/scorecard/a',(req,res) => {
    var tester = req.query.test;
    // console.log(tester);
    var score = -1;
    User.find({username:req.user.username},(err,user) => {
        if(err){
            console.log(err);
        }
        else{
            for(let i = 0;i < user[0].tests.length;i++){
                if(user[0].tests[i].testname == tester){
                    score = user[0].tests[i].score;
                }
            }
            res.send(score.toString());
        }
    });
});

app.listen('3000', () => console.log('Listening on port 3000'));