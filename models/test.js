var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    question : String,
    op1 : String,
    op2 : String,
    op3 : String,
    op4 : String,
    ans : String
});

//var Question = mongoose.model("Question",questionSchema);

var testSchema = new mongoose.Schema({
    name : String,
    questions : [questionSchema]
});

var Test = mongoose.model("Test",testSchema);

// var newTest = new Test({
//     name : "Physics"
// });

// newTest.questions.push({
//     question : "What is the size of Earth?",
//     op1 : "A",
//     op2 : "B",
//     op3 : "C",
//     op4 : "D",
//     ans : "A"
// });

// newTest.save((err,test) => {
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log(test);
//     }
// });

// Test.findOne({name : "Physics"}, (err,test) => {
//     if(err){
//         console.log(err);
//     }
//     else{
//         test.questions.push({
//             question : "What is the size of Mars?",
//             op1 : "A",
//             op2 : "B",
//             op3 : "C",
//             op4 : "D",
//             ans : "A"
//         });
//         test.save((err,test) => {
//             if(err){
//                 console.log(err);
//             }
//             else{
//                 console.log(test);
//             }
//         });
//     }
// });

module.exports = Test;