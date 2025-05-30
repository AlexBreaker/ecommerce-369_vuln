var express = require('express');

var session = require('express-session');





// console.log(fetch);
var router = express.Router();

//Routes will go here
module.exports = router;


router.use(session({
      secret: 'your_secret_key',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false } // set to true if using HTTPS
}));
 

function ensureAuth(req, res, next) {
   if (req.session.user) {
     next();
   } else {
     res.redirect('/srv_auth/login');
   }
 }


router.get('/signup', function(req, res){
   res.render('signup');
});

// router.post('/signup', function(req, res){
//    if(!req.body.id || !req.body.password){
//       res.status("400");
//       res.send("Invalid details!");
//    } else {
//       Users.filter(function(user){
//          if(user.id === req.body.id){
//             res.render('signup', {
//                message: "User Already Exists! Login or choose another user id"});
//          }
//       });
//       var newUser = {id: req.body.id, password: req.body.password};
//       Users.push(newUser);
//       req.session.user = newUser;
//       res.redirect('/protected_page');
//    }
// });


// function checkSignIn(req, res, next){
//    if(req.session.user){
//       next();     //If session exists, proceed to page
//    } else {
//       var err = new Error("Not logged in!");
//       console.log(req.session.user);
//       next(err);  //Error, trying to access unauthorized page!
//    }
// }


// router.get('/admin', function(req, res){
//    res.render('admin_page', {id: req.session.user.id})
// });

router.get('/admin', ensureAuth, (req, res) => {
   res.render('admin_page', { user: req.session.user  , msg : req.session.user.email });
});


router.get('/login', function(req, res){
   res.render('login');
});

router.post('/signup', async function(req, res){
   const { username_input , email_input , password_input  , confirmpassword_input } = req.body;

   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

	
	if (confirmpassword_input !== password_input) {
		return res.status(400).json({
		  statusCode: 400,
		  message: "Password and confirm password do not match.",
		});
	};
	
	
	if (!emailRegex.test(email_input)) {
		return res.status(400).json({
		  statusCode: 400,
		  message: "Invalid email format.",
		});
	};
	

	if (!usernameRegex.test(username_input)) {
		return res.status(400).json({
		  statusCode: 400,
		  message: "Invalid username. Only letters, numbers, underscores are allowed (3-20 characters).",
		});
	}

   // SSRF
   try {
      const apiRes = await fetch('http://localhost:8000/api/db_auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username_input , email_input, password_input })
      });
      const data = await apiRes.json();
  
      if (data.statusCode === 200) {
         res.render('signup', { message: data.message });
      } else {
        // signup failed maybe cuz user exist
        res.render('signup', { message: data.message });
      }
      
    } catch (err) {
      console.error("Error contacting API:", err);
      res.render('login', { message: "Server error. Try again later." });
    }  


});



router.post('/login', async function(req, res){
   const { email_input , password_input } = req.body;

	if (!password_input || !email_input) {
      res.render('login', {message: "Invalid credentials!"});
	}


   //SSRF
   try {
      const apiRes = await fetch('http://localhost:8000/api/db_auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_input, password_input })
      });
      const data = await apiRes.json();
  
      if (data.statusCode === 200) {
         req.session.user = {
            email: email_input
         };
         return res.redirect('/srv_auth/admin');


      } else {
        // Login failed - show error
        res.render('login', { message: "Login failed." });
      }
      
    } catch (err) {
      console.error("Error contacting API:", err);
      res.render('login', { message: "Server error. Try again later." });
    }  

});

router.get('/logout', (req, res) => {
   req.session.destroy(err => {
     if (err) {
       console.error("Error destroying session:", err);
       return res.status(500).send("Error logging out.");
     }
 
     // Optional: clear the cookie if needed
     res.clearCookie('connect.sid'); // Default session cookie name
     res.redirect('/srv_auth/login');
   });
 });

 
// router.use('/protected_page', function(err, req, res, next){
// console.log(err);
//    //User should be authenticated! Redirect him to log in.
//    res.redirect('/login');
// });
