var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var testSchema = new mongoose.Schema({
    testname : String,
    score : Number,
    taken : Boolean
});


var UserSchema = new mongoose.Schema({
    realname : String,
    username : String,
    password : String,
    tests : [testSchema],
    type : String,
    gender : String,
    roll : String,
    college : String,
    email : String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);