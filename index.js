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

function logout(req,res,next) {
    if(req.isAuthenticated()){
        loggedIn = true;
    }
    else{
        loggedIn = false;
    }
    return next();
}

function samePassword(req,res,next){
    if(req.body.password == req.body.password2)
    {
        return next();
    }
    res.redirect('/register');
}




var loggedIn = false;
var testSchema = [];



// var testModel = mongoose.model("usertest",testSchema);

var current = new Test({
    name : "",
    questions : []
});

var testss = [];

var userarray = [];
var testarray = [];
var scorearray = [];







//Index page route

app.get('/', logout, (req,res) => {
    res.render('index',{loggedIn : loggedIn});
});

//Login route
app.get('/login',logout, (req,res) => {
    if(loggedIn == true)
    {
        res.redirect('/home');
    }
    else{
        res.render('login',{loggedIn : loggedIn});
    }
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
app.get('/register',logout, (req,res) => {
    if(loggedIn == true)
    {
        res.redirect('/home');
    }
    else{
        res.render('register',{loggedIn : loggedIn});
    }
    
});

app.post('/register',samePassword, (req,res) => {
    req.body.username;
    req.body.password;
    User.register(new User({
        realname : req.body.realname,
        username : req.body.username,
        type : req.body.type,
        gender : req.body.gender,
        roll : req.body.roll,
        college : req.body.college,
        email : req.body.email
    }), req.body.password , function(err,user) {
        if(err){
            console.log(err);
            res.redirect('register');
        }
        passport.authenticate('local')(req,res,function() {
            res.redirect('/');
        });
    });
});

//Home route

app.get('/home' ,logout,isLoggedIn,function(req,res,next) {
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
    res.render('home',{realname:req.user.realname,tests : testss,testSchema : y,type : req.user.type,loggedIn : loggedIn});
});


//Profile route
app.get('/profile',logout,isLoggedIn,(req,res) => {
    // console.log(req.user);
    res.render('profile',{
        realname : req.user.realname,
        name : req.user.username,
        email : req.user.email,
        college : req.user.college,
        roll : req.user.roll,
        gender : req.user.gender,
        loggedIn : loggedIn
    });
    
});

//Edit profile route
app.get('/editprofile',logout,isLoggedIn,(req,res) => {
    res.render('editprofile',{
        realname : req.user.realname,
        email : req.user.email,
        college : req.user.college,
        roll : req.user.roll,
        gender : req.user.gender,
        loggedIn : loggedIn
    });
});

app.post('/editprofile',isLoggedIn,(req,res) => {
    // console.log(req);
    User.updateOne({
        username:req.user.username},{
            realname : req.body.realname,
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

app.get('/create',logout,isLoggedIn,(req,res) => {
    res.render('create',{loggedIn : loggedIn});
});

app.post('/create',isLoggedIn,(req,res) => {
    let t = 0;
    let a = false;
    if(req.body.hour)
    {
        t = (parseInt(req.body.hour,10)*60);
        a = true;
    }
    if(req.body.min && a == true){
        t = t + parseInt(req.body.min,10)
    }
    t = t*60000;
    var newTest = new Test({
        name : req.body.testname,
        time : t,
        current : t
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

app.get('/create/:num',logout,isLoggedIn,(req,res) => {
    res.render('createQ',{qnumber : req.params.num,loggedIn : loggedIn});
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

app.get('/test/:num',logout,function(req,res,next) {
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
        res.render('test',{test:testss[num],loggedIn : loggedIn,type : req.user.type});
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
        Test.update({name:req.body.testname},
            {current : req.body.time},
            (err,test) => {
                if(err){
                    console.log(err);
                }
                else
                {

                }
            });
        res.redirect('/home');
});

//update timer
app.get('/timer',isLoggedIn,(req,res) => {
    var time = req.query.time;
    var name = req.query.namee;
    // console.log(name);
    Test.update({name:name},
        { current : time },
        (err,test) => {
        if(err){
            console.log(err);
        }
        else{
            //  console.log(test);
            res.send(time.toString());
        }
    })
});

//Scorecard route
app.get('/scorecard',logout,isLoggedIn,(req,res) => {
    res.render('scorecard',{realname:req.user.realname,loggedIn : loggedIn});
});


app.get('/scorecard/a',logout,(req,res) => {
    var tester = req.query.test;
    // console.log(tester);
    var score = -1;
    User.find({username:req.user.username},(err,user) => {
        if(err){
            console.log(err);
        }
        else{
            // console.log(user);
            for(let i = 0;i < user[0].tests.length;i++){
                if(user[0].tests[i].testname == tester){
                    score = user[0].tests[i].score;
                }
            }
            res.send(score.toString());
        }
    });
});

//Setter scorecard
app.get('/scorecards',logout,isLoggedIn,function(req,res,next) {
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
(req,res) => {
    res.render('scorecards',{realname:req.user.realname,loggedIn : loggedIn,tests:testss});
});

app.get('/scorecards/:num',logout,isLoggedIn,function(req,res,next) {
    User.find({type:"student"},(err,user) => {
        if(err){
            console.log(err);
        }
        else{
            var i;
            for(i = 0;i < user.length;i++)
            {
                let test = user[i].tests;
                for(var j = 0;j< test.length;j++)
                {
                    if(test[j].testname == req.params.num)
                    {
                        userarray.push(user[i].realname);
                        scorearray.push(test[j].score);
                    }
                }
            }
            // console.log(userarray);
            // console.log(scorearray);
        }
        next();
    });
},(req,res) => {
    console.log(userarray);
    res.render('testscorecards',{realname:req.user.realname,loggedIn : loggedIn,tests:testss,userarray:userarray,scorearray:scorearray});
    userarray = [];
    scorearray = [];
});

app.listen('3000', () => console.log('Listening on port 3000'));