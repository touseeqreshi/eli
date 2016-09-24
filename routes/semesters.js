var express = require('express');
var router = express.Router();

//tools.js contains global functions
var tools = require('./tools')();

//A router-level middleware check authentication before using any functions
router.use(function (req, res, next) {
	//if not login, go back to login screen
  isAuthenticated(req, res, next);
}, function(req, res, next) {
	//if not verified, reject
	isVerified(req, res, next)
},function(req, res, next) {
	//if not admin, reject
	isAdmin(req, res, next)
});


//get all existed semester record related to a student_id
router.get('/get/:Student_id',  function(req, res, next) {
	connection.query("SELECT * FROM Students WHERE Student_id = ?", [req.params.Student_id], function(err, student) {
		if (err) throw err;

		connection.query("SELECT Semesters.Semester_id, Semester_info.Year, Semester_info.Season, Semester_info.Term, Semester_info.Level, Semester_info.Section FROM Students LEFT JOIN Semesters ON Students.Student_id = Semesters.Student_id LEFT JOIN Semester_info ON Semesters.Semester_info_id = Semester_info.Semester_info_id WHERE Students.Student_id = ? ORDER BY Year", [req.params.Student_id], function(err, results) {
			if (err) throw err;

			renderScreen(req, res, 'semesters/get', {
				title: 'Student Semester',
				student: student[0],
				results: results,
				url: '/students'
			})
		});
	});
});

//create a semester item related to a student_id
router.get('/create/:Student_id', function(req, res, next) {
	connection.query("SELECT * FROM Students WHERE Student_id = ?", [req.params.Student_id], function(err, students) {
		if (err) throw err;

		renderScreen(req, res, 'semesters/create', {
			title: 'Create Student Semester Information',
			student: students[0],
			url: '/students'
		});
	});
});

router.post('/create/:Student_id', function(req, res) {
	var Year = req.body.Year;
	var Season = req.body.Season;
	var Term = req.body.Term;
	var Level = req.body.Level;
	var Section = req.body.Section;
	var Student_id = req.params.Student_id;
	connection.query("SELECT * FROM Semester_info WHERE Year = ? AND Season = ? AND Term = ? AND Level = ? AND Section = ?", [Year, Season, Term, Level, Section], function(err, result) {
		if (err) throw err;
		console.log(result);

		if (result.length == 0) {
			var option = {
				Year: Year,
				Season: Season,
				Term: Term,
				Level: Level,
				Section: Section
			};
			connection.query("INSERT INTO Semester_info SET ?", [option], function(err, result) {
				if (err) throw err;

				var Semester_info_id = result.insertId;
				var option2 = {Student_id: Student_id, Semester_info_id: result.insertId};
				connection.query("INSERT INTO Semesters SET ?", [option2], function(err, result) {
					if (err) throw err;

					res.redirect('/semesters/get/' + Student_id);
				})
			});
		} else {
			var Semester_info_id = result[0].Semester_info_id;
			var option2 = {Student_id: Student_id, Semester_info_id: Semester_info_id};
			connection.query("INSERT INTO Semesters SET ?", [option2], function(err, result) {
				if (err) throw err;

				res.redirect('/semesters/get/' + Student_id);
			});
		}
	});
});

//edit one semester record
router.get('/edit/:Student_id/:Semester_id', function(req, res) {
	connection.query("SELECT * FROM Students WHERE Student_id = ?", [req.params.Student_id], function(err, students) {
		if (err) throw err;

		connection.query("SELECT * FROM Semesters INNER JOIN Semester_info ON Semesters.Semester_info_id = Semester_info.Semester_info_id WHERE Semester_id = ?", [req.params.Semester_id], function(err, result) {
			if (err) throw err;

			renderScreen(req, res, 'semesters/edit', {
				title: 'Student Semester',
				student: students[0],
				result: result[0],
				url: '/students'
			})
		});
	});
});

router.post('/edit/:Student_id/:Semester_id', function(req, res) {
	var Year = req.body.Year;
	var Season = req.body.Season;
	var Term = req.body.Term;
	var Level = req.body.Level;
	var Section = req.body.Section;
	var Student_id = req.params.Student_id;
	var Semester_id = req.params.Semester_id;
	connection.query("SELECT * FROM Semester_info WHERE Year = ? AND Season = ? AND Term = ? AND Level = ? AND Section = ?", [Year, Season, Term, Level, Section], function(err, result) {
		if (err) throw err;

		if (result.length == 0) {
			var option = {
				Year: Year,
				Season: Season,
				Term: Term,
				Level: Level,
				Section: Section
			};
			connection.query("INSERT INTO Semester_info SET ?", [option], function(err, result) {
				if (err) throw err;

				var Semester_info_id = result.insertId;
				var option2 = {Student_id: Student_id, Semester_info_id: Semester_info_id};
				connection.query("UPDATE Semesters SET ? WHERE Semester_id = ?", [option2, Semester_id], function(err, result) {
					if (err) throw err;

				})
			});
		} else {
			var Semester_info_id = result[0].Semester_info_id;
			var option2 = {Student_id: Student_id, Semester_info_id: Semester_info_id};
			connection.query("UPDATE Semesters SET ? WHERE Semester_id = ?", [option2, Semester_id], function(err, result) {
				if (err) throw err;
			})
		}
		res.redirect('/semesters/get/' + Student_id);		
	});
});

//delete a semester item
router.get('/delete/:Student_id/:Semester_id', function(req, res) {
	connection.query("DELETE FROM Semesters WHERE Semester_id = ?", [req.params.Semester_id], function(err, result) {
		if (err) throw err;

		res.redirect('/semesters/get/' + req.params.Student_id);
	});
});

module.exports = router;