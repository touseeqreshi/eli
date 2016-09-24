var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

var api_key = 'key-cab7a7d36a235e99a4321b91f553263c';
var domain = 'sandboxcced55001fb74d878f9619f7737e995c.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

//tools.js contains global functions
var tools = require('./tools.js')();

/* GET home page. */
router.get('/', function(req, res) {
    renderScreen(req, res, 'index', {
        title: 'Home',
        url: '/'
    });
});

//test if server is working
router.get('/test/', function(req, res) {
    res.send('test')
});

//User sign up view
router.get('/sign_up', function(req, res) {
    renderScreen(req, res, 'sign_up', {
        title: 'Sign Up',
        url: null
    })
});

//sign up new user put into database
router.post('/sign_up', function(req, res) {
    if (req.body.password != req.body.re_password) {
        req.session.error_message = "Passwords doese not match! Please complete sign up again."
        res.redirect('/sign_up');
    } else {
        bcrypt.hash(req.body.password, null, null, function(err, hash) {
            if (err) throw err;

            var user = {
                Username: req.body.username,
                Password: hash,
                email: req.body.email,
                User_group: req.body.user_group,
                isVerified: false,
            };

            connection.query('INSERT INTO Users SET ?', user, function(err, result) {
                if (err) {
                    req.session.error_message = "Sign up failed.";
                    res.redirect('/sign_up');
                } else {
                    req.session.okay_message = "Sign Up Successfully. You can login now, but you need to wait for account verification by system administrator."
                    res.redirect('/login');
                }
            });
        });
    }
});

//return button
router.get('/return', function(req, res) {
    var returnUrl = '/';
    //if there is a returnTo field in session, goto returnTo
    if ((req.session.hasOwnProperty('returnTo')) && (req.session.returnTo != null)) {
        returnUrl = req.session.returnTo;
        delete req.session.returnTo
    }
    res.redirect(returnUrl);
});

//render reset password page
router.get('/reset_password', function(req, res) {
    renderScreen(req, res, 'reset_password', {
        title: 'Reset Password'
    });
});

router.post('/reset_password', function(req, res) {
    var email = req.body.email;
    //email address cannot be empty, otherwise go back
    if (email == null) {
        req.session.error_message = 'You cannot use an empty string as Email Address.';
        res.redirect('back');
    } else {
        //check if email address is in the database, otherwise, go back
        connection.query('SELECT * FROM Users WHERE email = ?', [req.body.email], function(err, result) {
            if (err) throw err;

            if (result.length == 0) {
                req.session.error_message = "There is no registered user using this E-mail address. Please try again.";
                res.redirect('back');
            } else {
                //generate a random 6 characters password
                var new_passwrod = makePassword(6);
                //send a notification email using mailgun
                var data = {
                  from: 'ELI-CUW administrator <admin@elicuw>',
                  to: result[0].email,
                  subject: 'ELI-CUW password reset',
                  text: 'Your account in ELI-CUW has reset. Your account name is ' + result[0].Username + '. Your new password is ' + new_passwrod + '. Please login and change this new password as soon as possible.'
                };
                mailgun.messages().send(data, function (error, body) {
                    if (error) throw error;
                });
                //encrypt new password and save in database
                bcrypt.hash(new_passwrod, null, null, function(err, hash) {
                    connection.query('UPDATE Users SET password = ? WHERE UserID = ?', [hash, result[0].UserID], function(err, result) {
                        if (err) throw err;

                        req.session.okay_message = 'Your password has reset successfully. Please check your mailbox and try login.';
                        res.redirect('/');
                    })
                })
            }
        });        
    }
});


module.exports = router;
