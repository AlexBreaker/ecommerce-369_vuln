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




router.get('/admin',  ensureAuth, async (req, res) => {
  let promoCodes = [];
  const promoApiUrl = 'http://localhost:8000/api/offer_promo_season/all'; // <-- Your API endpoint
    try {
      const apiRes = await fetch(promoApiUrl);
      if (!apiRes.ok) {
          // If the API call itself returns an error status (e.g., 404, 500)
          const errorData = await apiRes.json(); // Try to parse error message from API
          throw new Error(`API Error: ${apiRes.status} ${apiRes.statusText} - ${errorData.message || ''}`);
      }
      const data = await apiRes.json();
      promoCodes = data.promoSeasons || []; // Assuming your API returns { promoSeasons: [...] }
  } catch (fetchErr) {
      console.error("Admin route - Error fetching promo codes via API:", fetchErr);
      pageError = "Failed to load promo codes (API error). Check server logs.";
      // It's crucial to check if your /api/offer_promo_season/all route is running
      // and correctly returning data, otherwise this fetch will fail.
  }


  res.render('admin_page', {
    user: req.session.user,
    msg: req.session.user.email, // Or a more generic welcome message
    promoCodes: promoCodes
  });

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


router.post('/createPromoSeason', async (req, res) => {
  // Extract data from the request body received by this route
  const { promocode, season, description } = req.body;

  // --- Basic Server-Side Validation (before calling the internal API) ---
  if (!promocode || !season) {
      // If essential fields are missing from the client's request to this route
      return res.json({
          statusCode: 400,
          message: "Missing mandatory fields (promocode, season) for creation."
      });
  }

  // --- Call the actual internal API endpoint using fetch ---
  const internalApiUrl = 'http://localhost:8000/api/offer_promo_season/createPromoSeason';

  try {
      const apiRes = await fetch(internalApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Forward the received data to the internal API
          body: JSON.stringify({ promocode, season, description })
      });

      const data = await apiRes.json(); // Parse the JSON response from the internal API

      // Based on the internal API's response, send back a response to the client
      if (data.statusCode === 201) {
          // Success: Promo code created by the internal API
          return res.json({
              statusCode: 201,
              message: "Promo season created successfully via API.",
              promocode: data.promocode // Include the promocode returned by the API
          });
      } else if (data.statusCode === 409) {
          // Conflict: Promo code already exists (as handled by the internal API)
          return res.json({
              statusCode: 409,
              message: data.message || "Promo code already exists via API."
          });
      } else {
          // Handle other potential errors from the internal API
          return res.json({
              statusCode: data.statusCode || 500,
              message: data.message || "Failed to create promo season via API. Unknown error."
          });
      }

  } catch (err) {
      // Handle network errors or issues with the fetch call itself
      console.error("Error contacting internal promo season creation API:", err);
      return res.json({
          statusCode: 500,
          message: "Server error when attempting to create promo season."
      });
  }
});

router.post('/delete-promo-code-proxy', async (req, res) => {
  // 1. Extract data from the request body sent by the frontend
  const { promocode } = req.body;

  // 2. Basic Server-Side Validation
  if (!promocode) {
      return res.json({
          statusCode: 400,
          message: "Missing mandatory 'promocode' field for deletion."
      });
  }

  // 3. Define the URL of your actual API endpoint for deleting promo codes
  // This is the endpoint you created previously, which interacts with MongoDB.
  const actualApiUrl = 'http://localhost:8000/api/offer_promo_season/deletePromoSeason';

  try {
      // 4. Use fetch to send a POST request to your actual API endpoint
      const apiRes = await fetch(actualApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send the promocode to be deleted to the actual API
          body: JSON.stringify({ promocode })
      });

      // 5. Parse the JSON response from the actual API endpoint
      const data = await apiRes.json();

      // 6. Respond to the frontend based on the actual API's response
      if (data.statusCode === 200) {
          // Success: Promo code deleted by the actual API
          return res.json({
              statusCode: 200,
              message: "Promo code deleted successfully.",
              deletedPromocode: promocode // Confirm which promo code was deleted
          });
      } else if (data.statusCode === 404) {
          // Not Found: Promo code not found by the actual API
          return res.json({
              statusCode: 404,
              message: data.message || "Promo code not found for deletion."
          });
      } else {
          // Handle other potential errors from the actual API (e.g., 500)
          return res.json({
              statusCode: data.statusCode || 500,
              message: data.message || "Failed to delete promo code due to an internal API error."
          });
      }

  } catch (err) {
      // 7. Handle network errors or issues with the `fetch` call itself
      console.error("Error contacting internal promo season deletion API:", err);
      return res.json({
          statusCode: 500,
          message: "Server error when attempting to delete promo code."
      });
  }
});




// router.post('/selectPromoSeason', async (req, res) => {
//   // 1. Extract data from the request body sent by the frontend
//   const { promocode } = req.body;

// });



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
