var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
app.use(express.static('iphone_imgs'));
app.use(express.static('other_images'));
app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json()); // for JSON bodies
app.use(express.urlencoded({ extended: true })); 

//Require the Router we defined in phones.js
var phones = require('./routes/phones.js');

//Use the Router on the sub route /phones
app.use('/phones', phones);


app.use(function(req, res, next){
    console.log("A new request received at " + Date.now());
    
    // This function call is very important. It tells that more processing is
    // required for the current request and is in the next middleware
    // function route handler.
    next();
 });



app.get('/', function(req, res){
    res.render('first_view', {
        name: "OMAR", 
        url:"http://www.tutorialspoint.com"
     });
    
});


// app.get('/iphone14', function(req, res){
//    res.render('phone_preview_page.pug', {
//        name: "OMAR", 
//        url:"http://www.tutorialspoint.com"
//     });
   
// });

// app.get('/iphone', function(req, res){
      
// });

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

app.post('/', function(req, res){
   console.log(req.body);
   res.send("recieved your request!");
});

app.listen(3000);