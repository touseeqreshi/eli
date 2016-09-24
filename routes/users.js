var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

//tools.js contains global functions
var tools = require('./tools')();

//A Router-level middleware check user's authentication before using it
router.use(function (req, res, next) {
	isAuthenticated(req, res, next);
});

router.get('/', function(req, res) {
	res.send('/users')
});

/* GET users listing. */
router.get('/userlist', isVerified, isAdmin, function(req, res) {
	var query1 = "SELECT * FROM Users";
	var query2 = "SELECT COUNT(*) AS NumberOfUser FROM Users WHERE isVerified = 0";

	connection.query(query1, function(err, results) {
		if (err) throw err;

		connection.query(query2, function(err, count) {
			if (err) throw err;

			renderScreen(req, res, 'users/userlist', {
				title: 'User List',
				users: results,
				count: count[0].NumberOfUser
			});  		
		});
	});
});

//get all unverified users
router.get('/unverifiedUsers', isVerified, isAdmin, function(req, res) {
	var query = "SELECT * FROM Users WHERE isVerified = 0";
	connection.query(query, function (err, results) {
		if (err) throw err;

		renderScreen(req, res, 'users/unverifiedUsers', {
			title: 'unverified User List',
			users: results
		});
	});
});

//change a user between unverified status and verified status
router.get('/changeStatus/:userid/:isVerified', isVerified, isAdmin, function(req, res) {
	var query = "UPDATE Users SET isVerified = ? WHERE UserID = ?";
	var changedStatus = (req.params.isVerified == 1) ? '0' : '1';
	connection.query(query, [changedStatus, req.params.userid], function(err, result) {
		if (err) throw err;

		res.redirect('back');
	})
});

//delete a user
router.get('/delete/:userid', isVerified, isAdmin, function(req, res) {
	var query = "DELETE FROM Users WHERE UserID = ?";
	connection.query(query, [req.params.userid], function(err, result) {
		if (err) throw err;

		res.redirect('back');

	});
});

//get student account page
router.get('/:userid', function(req, res) {
	renderScreen(req, res, 'users/user', {
		title: 'User Account',
		userid: req.params.userid
	});
});

//change username
router.get('/change_username/:userid', function(req, res) {
	connection.query('SELECT * FROM Users WHERE UserID = ?', [req.params.userid], function(err, result) {
		if (err) throw err;

		renderScreen(req, res, 'users/change_username', {
			title: 'Change Username',
			userid: req.params.userid,
			user: result[0]
		});		
	});
});

router.post('/change_username/:userid', function(req, res) {
	connection.query('UPDATE Users SET ? WHERE UserID = ?', [{Username: req.body.Username}, req.params.userid], function(err, result) {
		if (err) throw err;

		req.session.okay_message='Your have changed your username successfully.'

		res.redirect('/users/' + req.params.userid);
	})
})

router.get('/change_password/:userid', function(req, res) {
	renderScreen(req, res, 'users/change_password', {
		title: 'Change Password',
		userid: req.params.userid
	});
});

//change password
router.post('/change_password/:userid', function(req, res) {
	var userid = req.params.userid;
	connection.query('SELECT * FROM Users WHERE UserID = ?', [userid], function(err, result) {
		if (err) throw err;

		//compare encrypted password with input
		bcrypt.compare(req.body.o_password, result[0].Password, function(err, result) {
			if (err) throw err;

			if (!result) {
				req.session.error_message = 'Unable to change password. Your original password is not correct!';
				res.redirect('back');
			}
			else if (!req.body.password1) {
				req.session.error_message = 'Unable to change password. Your new password cannot be empty!';
				res.redirect('back');
			}
			else if (req.body.password1 != req.body.password2) {
				req.session.error_message = 'Unable to change password. Your new passwords do not match!';
				res.redirect('back');
			}
			else {
				bcrypt.hash(req.body.password1, null, null, function(err, hash) {
					
					connection.query('UPDATE Users SET Password = ? WHERE UserID = ?', [hash, userid], function(err, result) {
						if (err) throw err;

						req.session.okay_message = 'You have changed your password successfully!';

						res.redirect('/users/' + req.params.userid);
					})
				});
			}
		})
	});
});

//change user group and/or email
router.get('/change_user_group_email/:userid', function(req, res) {
	connection.query('SELECT * FROM Users WHERE UserID = ?', [req.params.userid], function(err, result) {
		if (err) throw err;

		renderScreen(req, res, 'users/change_user_group', {
			title: 'Change Password',
			userid: req.params.userid,
			result: result[0]
		});
	});
});

router.post('/change_user_group_email/:userid', function(req, res) {
	var userid = req.params.userid;
	var email = req.body.email;
	var user_group = req.body.user_group;
	if (email == '') {
		req.session.error_message = 'Email address cannot be empty.'
		res.redirect('back');
	} else {
		var option = [
		{
			email: email,
			User_group: user_group,
			//after such change, has to be verified again
			isVerified: 0
		}, userid
		];
		connection.query('UPDATE Users SET ? WHERE UserID = ?', option, function(err, result) {
			if (err) throw err;

			req.session.okay_message = 'You have changed your profile information successfully. You have to wait for administrator to verify your account before using the system.';
			res.redirect('/users/' + req.params.userid);
		});		
	}
});

module.exports = router;
