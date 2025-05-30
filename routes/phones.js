var express = require('express');
const fs = require('fs').promises;

var router = express.Router();

var phones = [
   {iphone_id: "iphone_14", Stock: 100},
   {iphone_id: "iphone_13", Stock: 10},
   {iphone_id: "iphone_14_pro", Stock: 20},
];

//Routes will go here
module.exports = router;



router.get('/stock/check', (req, res) => {
    const iphone_id= req.query.iphone_id;
    const quantity = (phones.find(p => p.iphone_id === iphone_id)).Stock;
    res.status(301).json({quantity,iphone_id});
});


// API endpoint to serve iphone14.json
router.get('/api/iphone', async (req, res) => {
    const iphone_id= req.query.iphone_id;
    try {
        const rawData = await fs.readFile('./iphone_imgs/'+iphone_id+'.json', 'utf-8');
        const jsonData = JSON.parse(rawData);
        res.json(jsonData);
    } catch (error) {
        console.error('Error reading JSON file:', error.message);
        res.status(500).json({ error: 'Failed to retrieve iPhone data' });
    }
});


router.post('/stock', async (req, res) => {
    const { stockApi } = req.body;
    console.log(req.body);
    //SSRF here LINK Is user suppplied
    //stockApi: 'http://localhost:3000/phones/stock/check?iphone_id=iphone_14'
    // var stockApi_test = 'http://localhost:8000/api/users/user?id=10'
    //SSRF test data http://localhost:8000/api/users/user?id=10
    var response = await fetch(stockApi); 
    const data = await response.json(); // assuming it returns { quantity: number }
    res.json(data);
    
  });






// To retrieve the JSON file from the API in a browser, 
// use the fetch API. This example loads the JSON and displays the features in an HTML page.
// Render Pug template with fetched data
// Note Iphone id is the unique file name

router.get('/', async (req, res) => {
    stock_value = '??????'
    const iphone_id= req.query.iphone_id;

    const response = await fetch('http://localhost:3000/phones/api/iphone?iphone_id='+iphone_id);
    const data = await response.json();
    console.log(data);
    res.render('phone_preview_page' , {
            IMG_LOCATION:data['image'],
            name: data['name'], 
            f1: data.features[0].f1,
            f2:data.features[0].f2,
            f3:data.features[0].f3,
            f4:data.features[0].f4,
            f5:data.features[0].f5,
            f6:data.features[0].f6,
            f7:data.features[0].f7,
            f8:data.features[0].f8,
            f9:data.features[0].f9,
            f10:data.features[0].f10,
            f11:data.features[0].f11,
            f12:data.features[0].f12,
            stockApi:'http://localhost:3000/phones/stock/check?iphone_id='+iphone_id,
            stock_value_placeholder:stock_value,
        });
});



router.get('/:id', function(req, res) {
    const id = req.params.id;

    if (!/^\d{3,}$/.test(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    const currPhone = phones.filter(phone => phone.id == id);

    if (currPhone.length === 1) {
        res.json(currPhone[0]);
    } else {
        res.status(404).json({ message: "Not Found" });
    }
});





// router.get('/14', function(req, res) {
//     return res.status(400).json({ message: "Invalid ID format" });
// });



router.post('/', function(req, res){
    //Check if all fields are provided and are valid:
    if (
        !req.body.name ||
        !req.body.year || !/^[0-9]{4}$/.test(req.body.year.toString()) ||
        !req.body.rating || !/^[0-9]\.[0-9]$/.test(req.body.rating.toString())
      ) {
        res.status(400).json({ message: "Bad Request" });}
    
    else {
       var newId = phones[phones.length-1].id+1;
       phones.push({
          id: newId,
          name: req.body.name,
          year: req.body.year,
          rating: req.body.rating
       });
       res.json({message: "New phone created.", location: "/phones/" + newId});
    }
});





// var express = require("express");
// var router = express.Router();
 
// const http = require("http");
 
// var phones = [
//     { id: 101, name: "Fight Club", year: 1999, rating: 8.1 },
//     { id: 102, name: "Inception", year: 2010, rating: 8.7 },
//     { id: 103, name: "The Dark Knight", year: 2008, rating: 9 },
//     { id: 104, name: "12 Angry Men", year: 1957, rating: 8.9 },
// ];
 
// //Routes will go here
// module.exports = router;
 
// router.get("/14", function (req, res) {
//     res.render("phone_preview_page");
// });
 
// router.get("/:endpoint", function (req, res) {
//     const endpoint = req.params.endpoint;
 
//     const options = {
//         host: "127.0.0.1",
//         port: 8000,
//         path: endpoint,
//         method: "GET",
//     };
 
//     // Send request to API
//     const apiReq = http.request(options, (res) => {
//         console.log(`${options.host} : ${res.statusCode}`);
//         res.setEncoding("utf8");
 
//         res.on("data", (chunk) => {
//             output += chunk;
//         });
//     });
// });
 
// router.post("/", function (req, res) {
//     //Check if all fields are provided and are valid:
//     if (!req.body.name || !req.body.year || !/^[0-9]{4}$/.test(req.body.year.toString()) || !req.body.rating || !/^[0-9]\.[0-9]$/.test(req.body.rating.toString())) {
//         res.status(400).json({ message: "Bad Request" });
//     } else {
//         var newId = phones[phones.length - 1].id + 1;
//         phones.push({
//             id: newId,
//             name: req.body.name,
//             year: req.body.year,
//             rating: req.body.rating,
//         });
//         res.json({ message: "New phone created.", location: "/phones/" + newId });
//     }
// });
