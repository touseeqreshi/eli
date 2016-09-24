var express = require('express');
var router = express.Router();

//tools.js contains global functions
var tools = require('./tools')();

//A Router-level middleware check user's authentication before using it
router.use(function (req, res, next) {
	//if not logged in, go back to login screen
  isAuthenticated(req, res, next);
}, function(req, res, next) {
	//if not verified, reject
	isVerified(req, res, next)
}, function(req, res, next) {
	//if not verified, reject
	isAdmin(req, res, next) 
});



/* GET home page. */
router.get('/', function(req, res, next) {
	connection.query('SELECT * FROM Students', function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'students/index', {
			title: 'Student List',
			results: results,
			url: '/students',			
		});
	});
});

//Create a new student profile
router.get('/create', function(req, res, next) {
	renderScreen(req, res, 'students/create', {
		title: 'Create Student Profile',
		url: '/students'
	});
});

//Receive a student profile
router.post('/create', function(req, res) {
	var student = {
		Student_number: 'F' + req.body.Student_number,
		First_name: req.body.First_name,
		Last_name: req.body.Last_name,
		Major: req.body.Major,
		Degree: req.body.Degree
	};

	connection.query('INSERT INTO Students SET ?', student, function(err, result) {
		if (err) throw err;

		res.redirect('/students');
	})
});

//Directly add a semester record to a student by picking a student in the list
router.get('/add_semester', function(req, res, next) {
	connection.query('SELECT * FROM Students', function(err, results) {
		if (err) throw err;
		
		renderScreen(req, res, 'students/add_semester', {
			title: 'Student List',
			results: results,
			url: "/students"
		});
	});
});

//Update a student profile
router.get('/edit/:Student_id', function(req, res, next) {
	var Student_id = req.params.Student_id;

	connection.query('SELECT * FROM Students WHERE Student_id = "' + Student_id + '"', function(err, student) {
		if (err) throw err;

		renderScreen(req, res, 'students/edit', {
			title: 'Edit Student File',
			edit: student[0],
			url: "/students"
		});
	});
});

router.post('/edit/:Student_id', function(req, res) {
	var Student_id = req.params.Student_id;
	var student = {
		Student_number: 'F' + req.body.Student_number,
		First_name: req.body.First_name,
		Last_name: req.body.Last_name,
		Major: req.body.Major,
		Degree: req.body.Degree
	};

	connection.query('UPDATE Students SET ? WHERE Student_id = ?', [student, Student_id], function(err, result) {
		if (err) throw err;

		res.redirect('/students');
	});
});

//Delete a student profile
router.get('/delete/:Student_id', function(req, res, next) {
	var Student_id = req.params.Student_id;

	connection.query('DELETE FROM Students WHERE Student_id = ?', [Student_id], function(err, result) {
		if(err) throw err;

		res.redirect('/students');
	});
});

module.exports = router;