const express = require('express');
const app = express();

var myLogger = (req, res, next) => {
    console.log('LOGGED')
    next()
  }
  
  app.use(myLogger);

app.get('/', (req,res) => {
    res.send('Hello World');
    console.log('Hello World');
});


app.listen('3000', () => console.log('Listening on port 3000'));