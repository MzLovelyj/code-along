// routes/laundry.js-Become a Launderer
const express = require('express');

const User = require('../models/user');
const LaundryPickup = require('../models/laundry-pickup');

const router = express.Router();

// Lines 11-15: If there’s a user in the session (logged in),
// continue with the routes by calling next() and returning.
router.use((req, res, next) => {
  if (req.session.currentUser) {
    next();
    return;
  }

// Line 19: If there’s no user in the session (anonymous),
// redirect the browser to the log in page.
res.redirect('/login');
});

router.get('/dashboard', (req, res, next) => {
  //Lines 26-32: Change the query based on whether or not you are a launderer.
  // If the user is a launderer, find laundry pickups that they will launder.
  // Otherwise, show laundry pickups that they ordered.
  let query;

  if (req.session.currentUser.isLaunderer) {
    query = { launderer: req.session.currentUser._id };
  } else {
    query = { user: req.session.currentUser._id };
  }

//Lines 36-41: Call several Mongoose methods to create a more complicated query, 
// culminating with a call to the exec() method to provide our callback.
  LaundryPickup
    .find(query)
    .populate('user', 'name')
    .populate('launderer', 'name')
    .sort('pickupDate')
    .exec((err, pickupDocs) => {
      if (err) {
        next(err);
        return;
      }

      res.render('laundry/dashboard', {
        pickups: pickupDocs
      });
    });
});

router.post('/launderers', (req, res, next) => {
  // Line 50: Gets the user’s _id from the session.
  const userId = req.session.currentUser._id;

  // Lines 54-57: Prepare the updated information with the fee
  // from the form and isLaunderer hardcoded to true.
  const laundererInfo = {
    fee: req.body.fee,
    isLaunderer: true
  };

//Line: 61 Call Mongoose’s
// findByIdAndUpdate() method to perfom the updates.
  User.findByIdAndUpdate(userId, laundererInfo, { new: true }, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

//Line 36: Update the user’s information in the session.
// This works in concert with line 20’s { new: true } option
 // to get the updated user information in the callback.
    req.session.currentUser = theUser;

// Line: 73 Redirect back to the dashboard.
    res.redirect('/dashboard');
  });
});

//Find a Launderer
router.get('/launderers', (req, res, next) => {

  // Line: 81 Query users whose isLaunderer property is true.
  User.find({ isLaunderer: true }, (err, launderersList) => {
    if (err) {
      next(err);
      return;
    }

// Lines 88-90: Render the views/laundry/launderers.ejs template.
    res.render('laundry/launderers', {

      //Line: 89 Pass in the results of the query (launderersList)
      // as the local variable launderers.
      launderers: launderersList
    });
  });
});

router.get('/launderers/:id', (req, res, next) => {
  //Line:98 Grab the id URL parameter.
  const laundererId = req.params.id;

//Lines 103: Call Mongoose’s
// findById() method to retrieve the launderer’s details.
  User.findById(laundererId, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

// Lines 110-112: Render the views/laundry/launderer-profile.ejs template.
    res.render('laundry/launderer-profile', {
      //Lines 113: Pass in the launderer’s profile information
      // (theUser) as the local variable theLaunderer.
      theLaunderer: theUser
    });
  });
});


router.post('/laundry-pickups', (req, res, next) => {
  // Lines 122-128: Create an instance of the
  // LaundryPickup model with the correct properties.
  const pickupInfo = {
    pickupDate: req.body.pickupDate,
    launderer: req.body.laundererId,
    //Line 126: Grab the user _id from the session again.
    user: req.session.currentUser._id
  };

  const thePickup = new LaundryPickup(pickupInfo);

//Line 133: Call Mongoose’s save()
// model method to actually save the pickup to the database.
  thePickup.save((err) => {
    if (err) {
      next(err);
      return;
    }

//Line 141: If everything goes as planned,
// redirect back to the dashboard.
    res.redirect('/dashboard');
  });
});


module.exports = router;
