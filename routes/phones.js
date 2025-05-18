var express = require('express');
var router = express.Router();

var phones = [
   {id: 101, name: "Fight Club", year: 1999, rating: 8.1},
   {id: 102, name: "Inception", year: 2010, rating: 8.7},
   {id: 103, name: "The Dark Knight", year: 2008, rating: 9},
   {id: 104, name: "12 Angry Men", year: 1957, rating: 8.9}
];

//Routes will go here
module.exports = router;

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



router.get('/14', function(req, res) {
    res.render('phone_preview_page');
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