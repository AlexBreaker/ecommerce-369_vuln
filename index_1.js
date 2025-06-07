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
var srv_auth = require('./routes/srv_auth.js');

app.use('/phones', phones);
app.use('/srv_auth', srv_auth);

// const connectToDatabase = require("./369_api/dbManager");


// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/yourDBName', {
//    useNewUrlParser: true,
//    useUnifiedTopology: true
//  }).then(() => console.log('MongoDB connected'))
//    .catch(err => console.log(err));

   


app.use(function(req, res, next){
    console.log("A new request received at " + Date.now());
    
    // This function call is very important. It tells that more processing is
    // required for the current request and is in the next middleware
    // function route handler.
    next();
 });



app.get('/', function(req, res){
    res.render('first_view', {
        name: "Iphone Store", 
        url:"/"
     });

});

app.get('/robots.txt', (req, res) => {
   res.type('text/plain');
   res.send(`User-agent: *
Disallow: /internal/
Disallow: /backup/
Disallow: /dev/
Disallow: /admin/
Disallow:/api/help/`);
});
 

app.post('/', function(req, res){
   var newProduct = new Product({
      name: "omar",
      price: 1200,
      description: "omar",
      imageUrl: "omar"
   });
   newProduct.save(function(err, Product){
      if(err)
         res.render('show_message', {message: "Database error", type: "error"});
      else
         res.render('show_message', {
            message: "New person added", type: "success", person: personInfo});
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

app.get('/offers', async function(req, res) {

      const apiUrl = 'http://localhost:8000/api/offer_promo_season/latest';
      const response = await fetch(apiUrl, {
            method: 'GET', // Or simply omit, as GET is the default
            headers: {
                  'Content-Type': 'application/json'
            }
      });
      const data = await response.json();

      //SSTI
      const fs = require('fs');

      // Step 1: Read the file
      let content = fs.readFileSync('./views/promo_page_template_dont_touch.pug', 'utf-8');
      
      // Step 2: Replace the placeholder
      let replaced = content.replace('{placeholder}', data.promoCode.promocode);
      
      // Step 3: Write it back or log it
      fs.writeFileSync('./views/promo_page.pug', replaced); // or console.log(replaced);
      
   res.render('promo_page');
}); 





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