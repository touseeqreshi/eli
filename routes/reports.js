var express = require('express');
var router = express.Router();

//tools.js contains global functions
var tools = require('./tools')();

//A Router-level middleware check user's authentication before using it
router.use(function (req, res, next) {
  isAuthenticated(req, res, next);
});

//A router-level middleware check user if he is a verified user
router.use(function (req, res, next) {
	isVerified(req, res, next);
});

//check if he is a administrator, otherwise, reject request
router.use(function (req, res, next) {
	isAdmin(req, res, next);
});

//retrieve all records in exit report table
router.get('/', function(req, res) {
	connection.query('SELECT Exit_reports.*, Students.*, Semester_info.* FROM Exit_reports INNER JOIN Semesters ON Exit_reports.Semester_id = Semesters.Semester_id INNER JOIN Students on Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id', function(err, results) {
		connection.query('SELECT DISTINCT Semester_info.Semester_info_id, Semester_info.* FROM Semester_info INNER JOIN Semesters ON Semesters.Semester_info_id = Semester_info.Semester_info_id', function(err, semesters) {
			if (err) throw err;

			renderScreen(req, res, 'reports/exit_report', {
				title: 'Exit Report List',
				url: '/reports',
				semesters: semesters,
				rows: results
			});			
		});
	});
});

//get to choose a specific group of student in one semester
router.get('/semester/:Semester_info_id', function(req, res) {
	var Semester_info_id = req.params.Semester_info_id;
	var query1 = 'SELECT * FROM Semester_info WHERE Semester_info_id = ?';
	connection.query(query1, [Semester_info_id], function(err, thisSemester) {
		if (err) throw err;
		connection.query('SELECT Exit_reports.*, Students.*, Semester_info.* FROM Exit_reports INNER JOIN Semesters ON Exit_reports.Semester_id = Semesters.Semester_id INNER JOIN Students on Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semester_info.Semester_info_id = ?',[Semester_info_id], function(err, results) {
			connection.query('SELECT DISTINCT Semester_info.Semester_info_id, Semester_info.* FROM Semester_info INNER JOIN Semesters ON Semesters.Semester_info_id = Semester_info.Semester_info_id', function(err, semesters) {
				if (err) throw err;

				renderScreen(req, res, 'reports/exit_report_semester', {
					title: 'Exit Report List',
					url: '/reports',
					semesters: semesters,
					thisSemester: thisSemester[0],
					rows: results
				});			
			});
		});
	});
});


//get individual exit report
router.get('/individual/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	connection.query('SELECT * FROM Semesters WHERE Semesters.Semester_id = ?', [Semester_id], function(err, student_id_result) {
		var Student_id = student_id_result[0].Student_id;
		connection.query('SELECT * FROM Toefls INNER JOIN Semesters ON Toefls.Semester_id = Semesters.Semester_id INNER JOIN Students ON Students.Student_id = Semesters.Student_id WHERE Students.Student_id = ?', [Student_id], function(err, Toefls_result) {
			if (Toefls_result.length != 0)
			{
				var toefl = Toefls_result[0];
				var tempTotal = 0;
				for (var i in Toefls_result) {
					curTotal = Toefls_result[i].Listening + Toefls_result[i].Reading + Toefls_result[i].Grammar;
					if (curTotal > tempTotal) {
						tempTotal = curTotal;
						toefl = Toefls_result[i];
					}
				}				
			} else {
				var toefl = {Grammar: 0, Listening: 0, Reading: 0}
			}

			var query = 'SELECT * FROM Semester_info AS si INNER JOIN Semesters AS se ON si.Semester_info_id = se.Semester_info_id INNER JOIN Students AS s ON se.Student_id = s.Student_id LEFT JOIN Exit_reports ON Exit_reports.Semester_id = se.Semester_id WHERE se.Semester_id = ?'
			connection.query(query , [req.params.Semester_id], function(err, result) {
				renderScreen(req, res,'reports/individual', {
					result: result[0],
					toefl: toefl,
					title: 'Individual Report',
					url: '/reports'
				});
			});
		})
	});


});

//get grades report of one student
router.get('/grades/:Semester_id', function(req, res) {
	var query = 'SELECT * FROM Semesters INNER JOIN Students ON Semesters.Student_id = Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Final_Grade ON Final_Grade.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_id = ?';
	connection.query(query, [req.params.Semester_id], function(err, result) {
		if (err) throw err;
		if (result.length == 0) {
			req.session.error_message = 'There is no fitting verified Grading record right now.';
			res.redirect('back');
		} else {
			renderScreen(req, res, 'reports/grades', {
				result: result[0],
				title: 'Grades',
				url: '/reports'
			})			
		}
	});
});

//get interview report of one student
router.get('/interviews/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var query1 = 'SELECT * FROM Semesters INNER JOIN Students ON Semesters.Student_id = Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Final_interview ON Final_interview.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_id = ?';
	var query2 = 'SELECT * FROM Interviews WHERE Semester_id = ?';
	connection.query(query1, [Semester_id], function(err, semester) {
		if (err) throw err;
		if (semester.length == 0) {
			req.session.error_message = 'There is no fitting verified Interview record right now.';
			res.redirect('back');			
		} else {
			connection.query(query2, [Semester_id], function(err, results) {
				if (err) throw err;

				renderScreen(req, res, 'reports/interviews', {
					semester: semester[0],
					results: results,
					title: 'Interviews',
					url: '/reports'
				});
			});
		}	
	});
});


//get recommendation report of one student
router.get('/recommendations/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var query1 = 'SELECT * FROM Semesters INNER JOIN Students ON Semesters.Student_id = Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Final_Recommendation ON Final_Recommendation.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_id = ?';
	var query2 = 'SELECT * FROM Recommendations WHERE Semester_id = ?';
	connection.query(query1, [Semester_id], function(err, semester) {
		if (err) throw err;
		
		if (semester.length == 0) {
			req.session.error_message = 'There is no fitting verified Recommendation record right now.';
			res.redirect('back');			
		} else {
			connection.query(query2, [Semester_id], function(err, results) {
				if (err) throw err;

				renderScreen(req, res, 'reports/recommendations', {
					result: semester[0],
					results: results,
					title: 'Recommendations',
					url: '/reports'
				});
			});
		}
	});
});

//get timed writing exam report of one student
router.get('/timed_writings/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var query = 'SELECT * FROM Semesters INNER JOIN Students ON Semesters.Student_id = Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Timed_writings ON Timed_writings.Semester_id = Semesters.Semester_id INNER JOIN Exit_reports ON Exit_reports.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_id = ?';
	connection.query(query, [Semester_id], function(err, result) {
		if (err) throw err;

		if (result.length == 0) {
			req.session.error_message = 'There is no fitting verified Timed Writing Exam record right now.';
			res.redirect('back');
		} else {
			renderScreen(req, res, 'reports/timed_writings', {
				result: result[0],
				title: 'Timed Writing Exam',
				url: '/reports'
			});
		}
	});
});

//get toefl report of one student
router.get('/toefls/:Semester_id', function(req, res) {
var Semester_id = req.params.Semester_id;
/*	connection.query('SELECT * FROM Toefls WHERE Toefls.Semester_id = ?', [Semester_id], function(err, result) {
		if (result.length == 0) {
			req.session.error_message = 'There is no fitting verified Toefl Score for this student right now.';
		}
	})*/
	connection.query('SELECT * FROM Semesters INNER JOIN Students ON Semesters.Student_id = Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Exit_reports ON Exit_reports.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_id = ?', [Semester_id], function(err, semester) {
		if (err) throw err;

		if (semester.length == 0) {
			req.session.error_message = 'There is no fitting verified Toefl Score right now.';
			res.redirect('back');
		} else {
			connection.query('SELECT * FROM Toefls INNER JOIN Semesters ON Toefls.Semester_id = Semesters.Semester_id WHERE Semesters.Student_id = ? ORDER BY (Toefls.Listening + Toefls.Reading + Toefls.Grammar) DESC', [semester[0].Student_id], function(err, results) {
				if (err) throw err;

				if (results.length == 0) {
					req.session.error_message = 'There is no fitting verified Toefl Score right now.';
					res.redirect('back');
				} else {
					renderScreen(req, res, 'reports/toefls', {
						result: semester[0],
						results: results,
						title: 'TOEFL',
						url: '/reports'
					});					
				}
			});
		}
	});
});

module.exports = router;