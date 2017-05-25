// This route is related to user registration and authentication
// SignUp, LogIn & LogOut
const express = require('express');
const bcrypt = require('bcrypt');

// Line 7 & 10 Require bcrypt and the User model for use in our POST route.
const User = require('../models/user');

const router = express.Router();
const bcryptSalt = 10;

//---------------------------SignUp---------------------------------
router.get('/signup', (req, res, next) => {
  res.render('auth/signup', {
    errorMessage:''
  });
});

//Line:21 Define our POST route with the /signup URL. It can have the same URL
// because it uses a different HTTP verb (GET vs. POST).
router.post('/signup', (req, res, next) => {

  //Line:25-27 Makes a variables for the inputs submitted
  // by the form (stored in req.body).
  const nameInput = req.body.name;
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  //Line: 30 -35 we are checking for is if the email or password is blank.
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

// Lines 44-49: Check if there’s already a user with the submitted email.
    if (existingUser !== null) {
      res.render('auth/signup', {
        errorMessage: `The email ${emailInput} is already in use.`
      });
      return;
    }

//Line:53-54 Use the bcrypt methods genSaltSync() and hashSync()
// to encrypt the submitted password.
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashedPass = bcrypt.hashSync(passwordInput, salt);

//Line: 58- 64 Creates an instance of the User model with
// the correct properties (values from the form submission).
    const userSubmission = {
      name: nameInput,
      email: emailInput,
      password: hashedPass
    };

    const theUser = new User(userSubmission);

//Line:53 Call Mongoose’s save() model method to
// actually save the new user to the database.
    theUser.save((err) => {

      // Lines 71-76: Check for database errors when we save.
      if (err) {
        res.render('auth/signup', {
          errorMessage: 'Something went wrong. Try again later.'
        });
        return;
      }

//Line: 79 If everything goes as planned, redirect back to the home page.
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

//Line 104: Find the user by their email.
  User.findOne({ email: emailInput }, (err, theUser) => {
    if (err || theUser === null) {
      res.render('auth/login', {
        errorMessage: `There isn't an account with email ${emailInput}.`
      });
      return;
    }

// Line 113: Use the compareSync() method to verify the password.
    if (!bcrypt.compareSync(passwordInput, theUser.password)) {
      res.render('auth/login', {
        errorMessage: 'Invalid password.'
      });
      return;
    }

//Line 121: If everything works, save the user’s information in req.session.
    req.session.currentUser = theUser;
    res.redirect('/');
  });
});

// -------------------LogOut------------------------
router.get('/logout', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/');
    return;
  }

// Line 135: Call the req.session.destroy()
// to clear the session for log out.
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

// Line 142: Redirect to the home page when it’s done.
    res.redirect('/');
  });
});

module.exports = router;
