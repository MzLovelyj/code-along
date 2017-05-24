// This route is related to user registration and authentication
// SignUp & LogIn
const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');

// Line6 & 10 Require bcrypt and the User model for use in our POST route.
const User = require('../models/user');

const bcryptSalt = 10;


router.get('/signup', (req, res, next) => {
  res.render('auth/signup', {
    errorMessage:''
  });
});

//Line:22 Define our POST route with the /signup URL. It can have the same URL
// because it uses a different HTTP verb (GET vs. POST).
router.post('/signup', (req, res, next) => {

  //Line:27-29 Makes a variables for the inputs submitted
  // by the form (stored in req.body).
  const nameInput = req.body.name;
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  //Line: 32 -37 we are checking for is if the email or password is blank.
  if (emailInput === '' || passwordInput === '') {
    res.render('auth/signup', {
      errorMessage: 'Enter both email and password to sign up.'
    });
    return;
  }

  User.findOne({ email: emailInput }, '_id', (err, existingUser) => {
    if (err) {
      next(err);
      return;
    }

// Lines 46-51: Check if there’s already a user with the submitted email.
    if (existingUser !== null) {
      res.render('auth/signup', {
        errorMessage: `The email ${emailInput} is already in use.`
      });
      return;
    }

//Line:55-56 Use the bcrypt methods genSaltSync() and hashSync()
// to encrypt the submitted password.
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashedPass = bcrypt.hashSync(passwordInput, salt);

//Line: 60- 66 Creates an instance of the User model with
// the correct properties (values from the form submission).
    const userSubmission = {
      name: nameInput,
      email: emailInput,
      password: hashedPass
    };

    const theUser = new User(userSubmission);

// Call Mongoose’s save() model method to
// actually save the new user to the database.
    theUser.save((err) => {

      // Lines 73-78: Check for database errors when we save.
      if (err) {
        res.render('auth/signup', {
          errorMessage: 'Something went wrong. Try again later.'
        });
        return;
      }

//Line: 81 If everything goes as planned, redirect back to the home page.
      res.redirect('/');
    });
  });
});
//End of registration

// -------------------LogIn------------------------
router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    errorMessage: ''
  });
});

router.post('/login', (req, res, next) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput === '') {
    res.render('auth/login', {
      errorMessage: 'Enter both email and password to log in.'
    });
    return;
  }

//Line 105: Find the user by their email.
  User.findOne({ email: emailInput }, (err, theUser) => {
    if (err || theUser === null) {
      res.render('auth/login', {
        errorMessage: `There isn't an account with email ${emailInput}.`
      });
      return;
    }

// Line 114: Use the compareSync() method to verify the password.
    if (!bcrypt.compareSync(passwordInput, theUser.password)) {
      res.render('auth/login', {
        errorMessage: 'Invalid password.'
      });
      return;
    }

//Line 122: If everything works, save the user’s information in req.session.
    req.session.currentUser = theUser;
    res.redirect('/');
  });
});


module.exports = router;
