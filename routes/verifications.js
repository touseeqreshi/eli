var express = require('express');
var router = express.Router();

//tools.js contains global functions
var tools = require('./tools')();

//A Router-level middleware check user's authentication before using it
router.use(function (req, res, next) {
  isAuthenticated(req, res, next);
}, function(req, res, next) {
	isVerified(req, res, next);
}, function(req, res, next) {
	isAdmin(req, res, next);
});

//get to main page
router.get('/', function(req, res) {
	connection.query("SELECT * FROM Count_unverified WHERE ID = 0", function(err, result) {
		if (err) throw err;
		//count total unverified record number
		var all = 0;
		for (var key in result[0]) {
			all += result[0][key];
		}

		renderScreen(req, res, 'verifications/index', {
			title: 'Verify',
			url: "/verifications",
			result: result[0],
			all: all
		});	
	});

});

//go to each different webform type verification page
router.get('/:webformType', function(req, res) {
	var webformType = req.params.webformType;
	var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.*, ?? AS ID FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN ?? ON Semesters.Semester_id = ?? WHERE ?? = FALSE ORDER BY Semester_info.Year DESC, Semester_info.Season DESC";
	connection.query("SELECT * FROM Count_unverified WHERE ID = 0", function(err, result) {
		if (err) throw err;

		var all = 0;
		for (var key in result[0]) {
			all += result[0][key];
		}

		TableName = webformType.substring(0, 1).toUpperCase() + webformType.substring(1);
		IndexName = webformType.substring(0, webformType.length - 1) + '_id';
		queryOption = [
		TableName + '.' + IndexName,
		TableName,
		TableName + '.Semester_id',
		TableName + '.IsVerified'
		];

		connection.query(query, queryOption, function(err, results) {
			if (err) throw err;

			renderScreen(req, res, 'verifications/genericVerification', {
				title: 'Unverified ' + TableName.substring(0, TableName.length -1) + ' List',
				rows: results,
				result: result[0],
				all: all,
				url: "/verifications",
				webformType: webformType
			});
		});
	});
});

//go to a unverified record with its ID and webform type
router.get('/:webformType/:ID', function(req, res) {
	var webformType = req.params.webformType;
	var ID = req.params.ID;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0, webformType.length - 1) + '_id';
	var title = '';
	switch (webformType) {
		case 'readings':
			title = 'Reading & Vocabulary';
			break;
		case 'writings':
			title = 'Writing & Grammar';
			break;
		case  'speaksings':
			title = 'Speaking & Listening';
			break;
		case 'toefl_preps':
			title = 'TOEFL Preparation';
			break;
		case 'extensive_listenings':
			title = 'Extensive Listening';
			break;
	}
	if (webformType == 'interviews') {
		var query = "SELECT Students.*, Semester_info.*, Interviews.* FROM Semesters INNER JOIN Students ON Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Interviews ON Semesters.Semester_id = Interviews.Semester_id WHERE Interviews.Interview_id = ?";

		connection.query(query, [ID], function(err, results) {
			if (err) throw err;

			renderScreen(req, res, 'verifications/interviews', {
				title: "Verify Interview Record",
				result: results[0],
				url: "/verifications"
			});
		});
	}
	else if ( webformType == 'timed_writings') {
		var query = "SELECT Students.*, Semester_info.*, Timed_writings.* FROM Semesters INNER JOIN Students ON Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Timed_writings ON Semesters.Semester_id = Timed_writings.Semester_id WHERE Timed_writings.Timed_writing_id = ?";

		connection.query(query, [req.params.ID], function(err, results) {
			if (err) throw err;

			renderScreen(req, res, 'verifications/timed_writings', {
				title: "Timed Writing Exam",
				result: results[0],
				url: "/verifications",
				webformType: 'timed_writings'
			});
		});
	}
	else if ( webformType == 'toefls' ) {
		var query = "SELECT Students.*, Semester_info.*, Toefls.* FROM Semesters INNER JOIN Students ON Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Toefls ON Semesters.Semester_id = Toefls.Semester_id WHERE Toefls.Toefl_id = ?";

		connection.query(query, [ID], function(err, results) {
			if (err) throw err;

			renderScreen(req, res, 'verifications/toefls', {
				title: "TOEFL",
				result: results[0],
				url: "/verifications",
				webformType: 'toefls'
			});
		});
	}
	else if ( webformType == 'recommendations') {
	var query = "SELECT Students.*, Semester_info.*, Recommendations.* FROM Semesters INNER JOIN Students ON Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Recommendations ON Semesters.Semester_id = Recommendations.Semester_id WHERE Recommendations.Recommendation_id = ?";

	connection.query(query, [ID], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'verifications/recommendations', {
			title: "Verify Instructor Recommendation",
			result: results[0],
			url: "/verifications"
		});
	});
	}
	else {
		var query = "SELECT Students.*, Semester_info.*, Semesters.Semester_id, ?? AS ID, ??, ??, ?? FROM Semesters INNER JOIN Students ON Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN ?? ON Semesters.Semester_id = ?? WHERE ?? = ?";

		var option = [
		TableName + '.' + IndexName,
		TableName + '.Score',
		TableName + '.IsVerified',
		TableName + '.Person_in_charge',
		TableName,
		TableName + '.Semester_id',
		TableName + '.' + IndexName,
		ID ]

		connection.query(query, option, function(err, results) {
			if (err) throw err;

			renderScreen(req, res, 'verifications/grades', {
				title: 'Verify ' + title + ' Record',
				result: results[0],
				url: "/verifications",
				webformType: webformType
			});
		});		
	}
});

router.post('/:webformType/:ID', function(req, res, next) {
	var webformType = req.params.webformType;
	var ID = req.params.ID;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0,1).toUpperCase() + webformType.substring(1, webformType.length - 1) + '_id';
	//if it is grades, in this function. otherwise jump to next
	if (webformType == 'interviews' || webformType ==  'timed_writings' || webformType == 'toefls' || webformType == 'recommendations') {
		next();
	} 
	else {
		var query = "UPDATE ?? SET ? WHERE ?? = ?";
		var obj = {
			Score: req.body.Score,
			Person_in_charge: req.body.Person_in_charge,
			IsVerified: 1
		};
		var option = [TableName, obj, IndexName, ID];

		Count_unverified_change(TableName, "-");

		connection.query(query, option, function(err, result) {
			if (err) throw err;
			//update final grade
			connection.query('SELECT Semester_id, Score FROM ?? WHERE ?? = ?', [TableName, IndexName, ID], function(err, result) {
				if (err) throw err;
				var Semester_id = result[0].Semester_id;
				var Score = result[0].Score;

				connection.query('SELECT * FROM Final_Grade WHERE Semester_id = ?', [Semester_id], function(err, results) {
					if (err) throw err;

					var grades = {
						'Readings': null,
						'Speaking': null,
						'Writings': null,
						'Toefl_preps': null,
						'Extensive_Listenings': null
					};

					if (results.length != 0) {
						grades = results[0]
					}

					var scores = Convert_Grades(TableName, Score, grades);

					scores[TableName] = Score;
					scores.Semester_id = Semester_id;

					connection.query('INSERT INTO Final_Grade SET ? ON DUPLICATE KEY UPDATE ?? = ?, Raw_grade = ? , Final_grade = ?', [scores, TableName, Score, scores.Raw_grade, scores.Final_grade], function(err, result) {
						if (err) throw err;
						
					});

					connection.query('SELECT * FROM Exit_reports WHERE Semester_id = ?', [Semester_id], function(err, result3) {
						if (result3.length == 0) {
							var option = [
							{
								Semester_id: Semester_id,
								Grades: scores.Final_grade,
								Result: scores.Final_grade
							},
							scores.Final_grade,
							scores.Final_grade
							];
						} else {
							var Result = result3[0].Teacher_recommendation + result3[0].Timed_writing + result3[0].Interview + result3[0].Toefl + scores.Final_grade;
							var option = [
							{
								Semester_id: Semester_id,
								Grades: scores.Final_grade,
								Result: Result
							},
							scores.Final_grade,
							Result
							];
						}
						
						connection.query('INSERT INTO Exit_reports SET ? ON DUPLICATE KEY UPDATE Grades = ? , Result = ?', option, function(err, result) {
							if (err) throw err;
						});
					})
				});
			});

			res.redirect('/verifications/' + webformType);
		});
	}
});

router.post('/interviews/:Interview_id', function(req, res) {
	var Interview_id = req.params.Interview_id;
	var interview = {
		Person_in_charge: req.body.Person_in_charge,
		Pronunciation: req.body.Pronunciation,
		Fluency: req.body.Fluency,
		Vocabulary: req.body.Vocabulary,
		Circumlocution: req.body.Circumlocution,
		Comprehension: req.body.Comprehension,
		Repetition: req.body.Repetition,
		Comments: req.body.Comments,
		Recommendation: req.body.Recommendation,
		IsVerified: true
	};

	connection.query("SELECT * FROM Interviews WHERE Interview_id = ?", [Interview_id], function(err, result) {
		var Semester_id = result[0].Semester_id;
		connection.query("UPDATE Interviews SET ? WHERE Interview_id = ?", [interview, Interview_id], function(err, result2) {
			if (err) throw err;

			//change unverified list
			Count_unverified_change('Interviews', '-');

			Update_Result_Interview(Semester_id);

			res.redirect('/verifications/interviews/');
		});		
	});
})

router.post('/timed_writings/:ID', function(req, res) {
	var ID = req.params.ID;
	var item = {
		Person_in_charge: req.body.Person_in_charge,
		Score: req.body.Score,
		IsVerified: 1
	};

	connection.query('SELECT Semester_id FROM Timed_writings WHERE Timed_writing_id = ?', [ID], function(err, result) {
		var Semester_id = result[0].Semester_id;

		var convertedScore = Convert_Score_TWE(req.body.Score);

		connection.query("SELECT * FROM Exit_reports WHERE Semester_id = ?", [Semester_id], function(err, result2) {
			if (result2.length == 0) {
				connection.query("INSERT INTO Exit_reports SET ?", [{Semester_id: Semester_id, Timed_writing: convertedScore, Result: convertedScore}], function(err, result) {
					if (err) throw err;
				})
			}
			else {
				var Result = result2[0].Teacher_recommendation + result2[0].Interview + result2[0].Grades + result2[0].Toefl + convertedScore;
				connection.query("UPDATE Exit_reports SET ? WHERE Semester_id = ?", [{Timed_writing: convertedScore, Result: Result}, Semester_id], function(err, result) {
					if (err) throw err;
				})
			}
		});
	});

	connection.query("UPDATE Timed_writings SET ? WHERE Timed_writing_id = ?", [item, ID], function(err, result) {
		if (err) throw err;

		Count_unverified_change('Timed_writings', '-');

		res.redirect('/verifications/timed_writings');
	});

});

router.post('/interviews/:Interview_id', function(req, res) {
	var Interview_id = req.params.Interview_id;
	var interview = {
		Person_in_charge: req.body.Person_in_charge,
		Pronunciation: req.body.Pronunciation,
		Fluency: req.body.Fluency,
		Comprehension: req.body.Comprehension,
		Repetition: req.body.Repetition,
		Comments: req.body.Comments,
		Recommendation: req.body.Recommendation,
		IsVerified: true
	};

	connection.query("SELECT * FROM Interviews WHERE Interview_id = ?", [Interview_id], function(err, result) {
		var Semester_id = result[0].Semester_id;
		connection.query("UPDATE Interviews SET ? WHERE Interview_id = ?", [interview, Interview_id], function(err, result2) {
			if (err) throw err;

			//change unverified list
			Count_unverified_change('Interviews', '-');

			Update_Result_Interview(Semester_id);

			res.redirect('/verifications/interviews/');
		});		
	});
})

router.post('/recommendations/:Recommendation_id', function(req, res) {
	var ID = req.params.Recommendation_id;
	var item = {
		Person_in_charge: req.body.Person_in_charge,
		Attendence: req.body.Attendence + '%',
		Completion: req.body.Completion + '%',
		Participation: req.body.Participation,
		Attitude: req.body.Attitude,
		Recommendation_level: req.body.Recommendation_level,
		Comments: req.body.Comments,
		IsVerified: true
	};

	connection.query("SELECT * FROM Recommendations WHERE Recommendation_id = ?", [ID], function(err, result) {
		if (err) throw err;

		var Semester_id = result[0].Semester_id;

		connection.query('UPDATE Recommendations SET ? WHERE Recommendation_id = ?', [item, ID], function(err, result){
			if (err) throw err;

			Count_unverified_change('Recommendations', '-');

			Update_Result_Recommendation(Semester_id);

			res.redirect('/verifications/recommendations/')
		});
	});
});

router.post('/toefls/:ID', function(req, res) {
	var ID = req.params.ID;
	var item = {
		Person_in_charge: req.body.Person_in_charge,
		Listening: req.body.Listening,
		Reading: req.body.Reading,
		Grammar: req.body.Grammar,
		Test_Date: req.body.Test_Date,
		IsVerified: 1
	};

	connection.query('SELECT Toefls.Semester_id AS Semester_id, Students.Student_id AS Student_id FROM Toefls INNER JOIN Semesters ON Toefls.Semester_id = Semesters.Semester_id INNER JOIN Students ON Semesters.Student_id = Students.Student_id WHERE Toefl_id = ?', [ID], function(err, result) {
		if (err) throw err;

		var Semester_id = result[0].Semester_id;
		var Student_id = result[0].Student_id;

		connection.query('SELECT Toefls.Listening, Toefls.Reading, Toefls.Grammar, Students.Degree FROM Toefls INNER JOIN Semesters ON Semesters.Semester_id = Toefls.Semester_id INNER JOIN Students ON Students.Student_id = Semesters.Student_id WHERE Students.Student_id = ?', [Student_id], function(err, result1) {
			if (err) throw err;

			var Max_score = 0;
			for (var i in result1) {
				var temp = Convert_Score_Toefl(result1[i].Degree, result1[i]);
				if (temp > Max_score) {
					Max_score = temp;
				}
			}

			connection.query("SELECT * FROM Exit_reports INNER JOIN Semesters ON Exit_reports.Semester_id = Semesters.Semester_id INNER JOIN Students ON Semesters.Student_id = Students.Student_id WHERE Exit_reports.Semester_id = ?", [Semester_id], function(err, result2) {
				var Degree = result2.Degree;
				var convertedScore = Convert_Score_Toefl(Degree, item);
				if (Max_score > convertedScore) {
					convertedScore = Max_score;
				}

				if (result2.length == 0) {
					connection.query("INSERT INTO Exit_reports SET ?", [{Semester_id: Semester_id, Toefl: convertedScore, Result: convertedScore}], function(err, result) {
						if (err) throw err;
					})
				}
				else {
					var Result = result2[0].Teacher_recommendation + result2[0].Interview + result2[0].Grades + result2[0].Timed_writing + convertedScore;
					connection.query("UPDATE Exit_reports SET ? WHERE Semester_id = ?", [{Toefl: convertedScore, Result: Result}, Semester_id], function(err, result) {
						if (err) throw err;
					})
				}
				connection.query("SELECT * FROM Exit_reports INNER JOIN Semesters ON Exit_reports.Semester_id = Semesters.Semester_id INNER JOIN Students ON Semesters.Student_id = Students.Student_id WHERE Students.Student_id = ?", [Student_id], function(err, result3) {
					if (err) throw err;
					for (var i in result3) {
						var currentScore = result3[i].Toefl;
						var Result = result3[i].Teacher_recommendation + result3[i].Interview + result3[i].Grades + result3[i].Timed_writing + convertedScore;
						if (convertedScore > currentScore) {
							var options = {
								Toefl: convertedScore,
								Result: Result
							};
							connection.query("UPDATE Exit_reports SET ? WHERE Semester_id = ?", [options, result3[i].Semester_id], function(err, result) {
								if (err) throw err;
							});
						}
					}
				});
			});
		});
	});

	connection.query("UPDATE Toefls SET ? WHERE Toefl_id = ?", [item, ID], function(err, result) {
		if (err) throw err;

		Count_unverified_change('Toefls', '-');

		res.redirect('/verifications/toefls');
	});

});

module.exports = router;