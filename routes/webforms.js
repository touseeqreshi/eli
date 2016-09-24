var express = require('express');
var router = express.Router();

//tools.js contains global functions
var tools = require('./tools')();

//A router level middleware check user authentication first
router.use(function (req, res, next) {
  isAuthenticated(req, res, next);
}, function (req, res, next) {
	isVerified(req, res, next);
});

//choose a form to input
router.get('/', function(req, res, next) {
	var query = 'SELECT Semester_info.*, Semesters.Semester_id, Students.* FROM Students INNER JOIN Semesters ON Semesters.Student_id = Students.Student_id INNER JOIN Semester_info ON Semesters.Semester_info_id = Semester_info.Semester_info_id';
	connection.query(query, function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/index', {
			title: "Choose a student record",
			results: results,
			url: "/webforms",
			webformType: 'lists'
		});
	});
});

//list all semester records
router.get('/lists/:Semester_id', function(req, res, next) {
	req.session.returnTo = req.originalUrl;
	connection.query('SELECT Semester_info.*, Semesters.Semester_id, Students.* FROM Students INNER JOIN Semesters ON Semesters.Student_id = Students.Student_id INNER JOIN Semester_info ON Semesters.Semester_info_id = Semester_info.Semester_info_id WHERE Semesters.Semester_id = ?', [req.params.Semester_id], function(err, result) {
		renderScreen(req, res, 'webforms/list', {
			title: 'Webform List',
			result: result[0],
			url: "/webforms"
		});
	})

});

//another portal to go to webform input, by choosing webform type first
router.get('/:webformType', function(req, res, next) {
	var webformType = req.params.webformType;
	req.session.returnTo = req.originalUrl;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0,1).toUpperCase() + webformType.substring(1, webformType.length - 1) + '_id';
	connection.query('SELECT DISTINCT Semester_info.Semester_info_id, Semester_info.* FROM Semester_info INNER JOIN Semesters ON Semesters.Semester_info_id = Semester_info.Semester_info_id', function(err, semesters) {
		if (err) throw err;

		if (webformType == 'interviews') {
			var query = 'SELECT Students.*, Semesters.Semester_id, Semester_info.*, Final_interview.Count, Final_interview.Score FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Final_interview ON Semesters.Semester_id = Final_interview.Semester_id';

			connection.query(query, function(err, results) {
				if (err) throw err;

				renderScreen(req, res, 'webforms/interviews/index', {
					title: 'Choose a student record',
					webformType: 'interviews',
					results: results,
					url: '/webforms',
					semesters: semesters,
					webformType: webformType
				});
			});
		} else if (webformType == 'timed_writings') {
			var query = 'SELECT Students.*, Semester_info.*, Timed_writings.Timed_writing_id AS ID, Timed_writings.Score, Timed_writings.IsVerified, Semesters.Semester_id FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Timed_writings ON Timed_writings.Semester_id = Semesters.Semester_id';
			connection.query(query, function(err, results) {
				if (err) throw err;

				renderScreen(req, res, 'webforms/timed_writings/index', {
					title: "Choose a student record",
					rows: results,
					semesters: semesters,
					url: "/webforms",
					webformType: webformType
				});				
			});
		} else if (webformType == 'toefls' ) {
			var query = 'SELECT Students.*, Semester_info.*, Semesters.Semester_id, Toefls.Toefl_id AS ID, Toefls.Listening, Toefls.Reading, Toefls.Grammar, Toefls.IsVerified FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Toefls ON Toefls.Semester_id = Semesters.Semester_id';
			connection.query(query, function(err, results) {
				if (err) throw err;

				renderScreen(req, res, 'webforms/toefls/index', {
					title: "Choose a student record",
					rows: results,
					semesters: semesters,
					url: "/webforms",
					webformType: webformType
				});
			});

		} else if (webformType == 'recommendations') {
			var query = 'SELECT Students.*, Semester_info.*, Semesters.Semester_id, Final_Recommendation.Count, Final_Recommendation.Raw_score FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Final_Recommendation ON Final_Recommendation.Semester_id = Semesters.Semester_id';
			connection.query(query, function(err, results) {
				if (err) throw err;

				renderScreen(req, res, 'webforms/recommendations/index', {
					title: 'Choose a student record',
					webformType: webformType,					
					semesters: semesters,
					rows: results,
					url: '/webforms'
				});
			});
		}
		else {
			var query = 'SELECT Students.*, Semester_info.*, Semesters.Semester_id, ??, ?? , ?? AS ID FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN ?? ON Semesters.Semester_id = ??'

			var option = [TableName + '.Score', TableName + '.IsVerified', TableName + '.' + IndexName, TableName, TableName + '.Semester_id'];
			connection.query(query, option, function(err, results) {
				if (err) throw err;

				renderScreen(req, res, 'webforms/grades/index', {
					title: webformType.substring(0, webformType.length-1).toUpperCase(),
					webformType: webformType,					
					semesters: semesters,
					rows: results,
					url: '/webforms'				
				});
			});
		}
	})
});

//create a new record according to webform and a student record
router.get('/:webformType/create/:Semester_id', function(req, res, next) {
	var webformType = req.params.webformType;
	var Semester_id = req.params.Semester_id;
	var title = '';
	switch (webformType) {
		case 'readings':
			title = 'Reading & Vocabulary';
			break;
		case 'writings':
			title = 'Writing & Grammar';
			break;
		case  'speakßings':
			title = 'Speaking & Listening';
			break;
		case 'toefl_preps':
			title = 'TOEFL Preparation';
			break;
		case 'extensive_listenings':
			title = 'Extensive Listening';
			break;
	}
	if (webformType == 'interviews' || webformType ==  'timed_writings' || webformType == 'toefls' || webformType == 'recommendations') {
		next();
	}
	else {
		var query = 'SELECT Students.*, Semesters.Semester_id, Semester_info.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semesters.Semester_id = ?';
		connection.query(query, [Semester_id], function(err, results) {
			if (err) throw err;

			renderScreen(req, res, 'webforms/grades/create', {
				title: title,
				result: results[0],
				url: "/webforms",
				webformType: webformType
			});
		});
	}
});

router.post('/:webformType/create/:Semester_id', function(req, res, next) {
	var webformType = req.params.webformType;
	var Semester_id = req.params.Semester_id;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	if (webformType == 'interviews' || webformType ==  'timed_writings' || webformType == 'toefls' || webformType == 'recommendations') {
		next();
	} else {
		var query = "INSERT INTO ?? SET ?";
		var item = {
			Person_in_charge: req.body.Person_in_charge,
			Score: req.body.Score,
			IsVerified: false,
			Semester_id: req.params.Semester_id			
		};

		connection.query(query, [TableName, item], function(err, result) {
			if (err) throw err;

			Count_unverified_change(TableName, '+');

			res.redirect('/return');
		});
	}
});

//edit a webform record based on its id
router.get('/:webformType/edit/:ID', function(req, res, next) {
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
		case  'speakings':
			title = 'Speaking & Listening';
			break;
		case 'toefl_preps':
			title = 'TOEFL Preparation';
			break;
		case 'extensive_listenings':
			title = 'Extensive Listening';
			break;
	}
	if (webformType == 'interviews' || webformType ==  'timed_writings' || webformType == 'toefls' || webformType == 'recommendations') {
		next();
	}
	else {
		var query = "SELECT Semesters.Semester_id, Students.*, Semester_info.*, ?? AS ID, ??, ??, ?? FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN ?? ON Semesters.Semester_id = ?? WHERE ?? = ?";

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

			renderScreen(req, res, 'webforms/grades/edit', {
				title: title,
				result: results[0],
				url: "/webforms",
				webformType: webformType
			});
		});		
	}
});

router.post('/:webformType/edit/:ID', function(req, res, next) {
	var webformType = req.params.webformType;
	var ID = req.params.ID;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0,1).toUpperCase() + webformType.substring(1, webformType.length - 1) + '_id';
	if (webformType == 'interviews' || webformType ==  'timed_writings' || webformType == 'toefls' || webformType == 'recommendations') {
		next();
	} 
	else {
		var query = "UPDATE ?? SET ? WHERE ?? = ?";
		var obj = {
			Score: req.body.Score,
			Person_in_charge: req.body.Person_in_charge,
			IsVerified: 0
		};
		var option = [TableName, obj, IndexName, ID];

		connection.query('SELECT IsVerified FROM ?? WHERE ?? = ?', [TableName, TableName + '.' + IndexName, ID], function (err, result) {
			if (err) throw err;

			var IsVerified = result[0].IsVerified;
			
			if (IsVerified == '1') {
				Count_unverified_change(TableName, "+");
				//update final grade
				connection.query('SELECT Semester_id, Score FROM ?? WHERE ?? = ?', [TableName, IndexName, ID], function(err, result) {
					if (err) throw err;
					var Semester_id = result[0].Semester_id;
					var Score = null;

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
			}
		});

		connection.query(query, option, function(err, result) {
			if (err) throw err;

			res.redirect('/return');
		});
	}
});

//delete a record
router.get('/:webformType/delete/:ID', function(req, res, next) {
	var webformType = req.params.webformType;
	var ID = req.params.ID;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0, webformType.length - 1) + '_id';
	if (webformType == 'interviews' || webformType ==  'timed_writings' || webformType == 'toefls' || webformType == 'recommendations') {
		next();
	} 
	else {
		var query = "DELETE FROM ?? WHERE ?? = ?";
		var option = [TableName, IndexName, ID];
		connection.query('SELECT IsVerified FROM ?? WHERE ?? = ?', [TableName, TableName + '.' + IndexName, ID], function (err, result) {
			if (err) throw err;

			var IsVerified = result[0].IsVerified;
			
			//if it has not been verified, change Count_unverified table
			if (IsVerified == '0') {
				Count_unverified_change(webformType, "-");

				connection.query(query, option, function(err, result) {
					if (err) throw err;

					res.redirect('back');
				});
			}
			//if it has been verified, change the result in final grade and report
			else {
				//update final grade and exit report if delete a grade
				connection.query('SELECT Semester_id, Score FROM ?? WHERE ?? = ?', [TableName, IndexName, ID], function(err, result) {
					if (err) throw err;
					var Semester_id = result[0].Semester_id;
					var Score = null;

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
							if (result3.length != 0) {
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
								connection.query('INSERT INTO Exit_reports SET ? ON DUPLICATE KEY UPDATE Grades = ? , Result = ?', option, function(err, result) {
									if (err) throw err;
								});
							}
						});

						connection.query(query, option, function(err, result) {
							if (err) throw err;

							res.redirect('back');
						});
					});
				});
			}
		});
	}
});

//if it is grades or toefl,
//if records not exsit, go to edit page
//otherwise go to create page
router.get('/:webformType/:Semester_id', function(req, res, next) {
	var webformType = req.params.webformType;
	var Semester_id = req.params.Semester_id;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0,1).toUpperCase() + webformType.substring(1, webformType.length - 1) + '_id';
	if ((webformType == 'interviews') || (webformType == 'recommendations')) {
		next();
	} else {
		connection.query('SELECT * FROM ?? WHERE ?? = ?', [TableName, TableName+'.Semester_id', Semester_id], function(err, results) {
			var result = results[0];
			if (err) throw err;

			if (result.length ==0) {
				res.redirect('/webforms/' + webformType + '/create/' + Semester_id);
			}
			else {
				res.redirect('/webforms/' + webformType + '/edit/' + result[IndexName]);
			}
		});
	}
});

//if it is interview, timed writing, or recommendation, directly go to semester page
router.get('/:webformType/semester/:Semester_info_id', function(req, res) {
	var webformType = req.params.webformType;
	var Semester_info_id = req.params.Semester_info_id;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0,1).toUpperCase() + webformType.substring(1, webformType.length - 1) + '_id';
	req.session.returnTo = req.originalUrl;


	var query1 = 'SELECT * FROM Semester_info WHERE Semester_info_id = ?';
	connection.query(query1, [Semester_info_id], function(err, thisSemester) {
		if (err) throw err;
		connection.query('SELECT DISTINCT Semester_info.Semester_info_id, Semester_info.* FROM Semester_info INNER JOIN Semesters ON Semesters.Semester_info_id = Semester_info.Semester_info_id', function(err, semesters) {
			if (err) throw err;

			if (webformType == 'timed_writings') {
				var query2 = 'SELECT Students.*, Semester_info.*, Timed_writings.Timed_writing_id AS ID, Timed_writings.Score, Timed_writings.IsVerified, Semesters.Semester_id FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Timed_writings ON Timed_writings.Semester_id = Semesters.Semester_id WHERE Semester_info.Semester_info_id = ?';
				connection.query(query2, [Semester_info_id], function(err, results) {
					if (err) throw err;


					connection.query('SELECT COUNT(*) AS Number FROM Semesters LEFT JOIN Timed_writings ON Timed_writings.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_info_id = ? AND Timed_writings.Score IS null', [Semester_info_id], function(err, result) {
						if (err) throw err;

						renderScreen(req, res, 'webforms/timed_writings/semester_all', {
							title: webformType.substring(0, webformType.length-1).toUpperCase(),
							rows: results,
							semesters: semesters,
							thisSemester: thisSemester[0],
							number: result[0].Number,
							url: "/webforms",
							webformType: webformType
						});						
					});			
				});		
			}
			else if (webformType == 'interviews') {
				var query2 = 'SELECT Students.*, Semesters.Semester_id, Semester_info.*, Final_interview.Count, Final_interview.Score FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Final_interview ON Semesters.Semester_id = Final_interview.Semester_id WHERE Semester_info.Semester_info_id = ?';
				connection.query(query2, [Semester_info_id], function(err, results) {
					if (err) throw err;


					renderScreen(req, res, 'webforms/interviews/semester_all', {
						title: webformType.substring(0, webformType.length-1).toUpperCase(),
						rows: results,
						semesters: semesters,
						thisSemester: thisSemester[0],
						url: "/webforms",
						webformType: webformType
					});
				});
			}
			else if (webformType == 'recommendations') {
				var query2 = 'SELECT Students.*, Semester_info.*, Semesters.Semester_id, Final_Recommendation.Count, Final_Recommendation.Raw_score FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Final_Recommendation ON Final_Recommendation.Semester_id = Semesters.Semester_id WHERE Semester_info.Semester_info_id = ?';
				connection.query(query2, [Semester_info_id], function(err, results) {
					if (err) throw err;

					renderScreen(req, res, 'webforms/recommendations/semester_all', {
						title: webformType.substring(0, webformType.length-1).toUpperCase(),
						rows: results,
						semesters: semesters,
						thisSemester: thisSemester[0],
						url: "/webforms",
						webformType: webformType
					});
				});
			}
			else if (webformType == 'toefls') {
				var query2 = 'SELECT Students.*, Semester_info.*, Semesters.Semester_id, Toefls.Toefl_id AS ID, Toefls.Listening, Toefls.Reading, Toefls.Grammar, Toefls.IsVerified FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Toefls ON Toefls.Semester_id = Semesters.Semester_id WHERE Semester_info.Semester_info_id = ?';
				connection.query(query2, [Semester_info_id], function(err, results) {
					if (err) throw err;

					connection.query('SELECT COUNT(*) AS Number FROM Semesters LEFT JOIN Toefls ON Toefls.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_info_id = ? AND (Toefls.Listening IS null OR Toefls.Reading IS null OR Toefls.Grammar IS null)', [Semester_info_id], function(err, result) {
						if (err) throw err;

						renderScreen(req, res, 'webforms/toefls/semester_all', {
							title: webformType.substring(0, webformType.length-1).toUpperCase(),
							rows: results,
							semesters: semesters,
							thisSemester: thisSemester[0],
							number: result[0].Number,
							url: "/webforms",
							webformType: webformType
						});						
					});			
				});				

			}
			else {
				var query = 'SELECT Students.*, Semester_info.*, Semesters.Semester_id, ??, ?? , ?? AS ID FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN ?? ON Semesters.Semester_id = ?? WHERE Semester_info.Semester_info_id = ?'

				var option = [TableName + '.Score', TableName + '.IsVerified', TableName + '.' + IndexName, TableName, TableName + '.Semester_id', Semester_info_id];
				connection.query(query, option, function(err, results) {
					if (err) throw err;



					connection.query('SELECT COUNT(*) AS Number FROM Semesters LEFT JOIN ?? ON ?? = Semesters.Semester_id WHERE Semesters.Semester_info_id = ? AND ?? IS NULL', [TableName, TableName+'.Semester_id', Semester_info_id, TableName + '.Score'], function(err, result) {
						if (err) throw err;

						renderScreen(req, res, 'webforms/grades/semester_all', {
							title: webformType.substring(0, webformType.length-1).toUpperCase(),
							rows: results,
							semesters: semesters,
							thisSemester: thisSemester[0],
							number: result[0].Number,
							url: "/webforms",
							webformType: webformType				
						});						
					});
				});
			}
		});
	});
});

//get all waiting for filled student list of a specific class of student
router.get('/:webformType/semester/:Semester_info_id/unfinished', function(req, res) {
	var webformType = req.params.webformType;
	var Semester_info_id = req.params.Semester_info_id;
	var TableName = webformType.substring(0,1).toUpperCase() + webformType.slice(1);
	var IndexName = webformType.substring(0,1).toUpperCase() + webformType.substring(1, webformType.length - 1) + '_id';
	req.session.returnTo = req.originalUrl;

	connection.query('SELECT DISTINCT Semester_info.Semester_info_id, Semester_info.* FROM Semester_info INNER JOIN Semesters ON Semesters.Semester_info_id = Semester_info.Semester_info_id', function(err, semesters) {
		if (err) throw err;

		var query1 = 'SELECT * FROM Semester_info WHERE Semester_info_id = ?';
		connection.query(query1, [Semester_info_id], function(err, thisSemester) {
			if (err) throw err;

			if (webformType == 'timed_writings') {
				var query2 = 'SELECT Students.*, Semester_info.*, Timed_writings.Timed_writing_id AS ID, Timed_writings.Score, Timed_writings.IsVerified, Semesters.Semester_id FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Timed_writings ON Timed_writings.Semester_id = Semesters.Semester_id WHERE Semester_info.Semester_info_id = ? AND Timed_writings.Score IS null';
				connection.query(query2, [Semester_info_id], function(err, results) {
					if (err) throw err;

					connection.query('SELECT COUNT(*) AS Number FROM Semesters LEFT JOIN Timed_writings ON Timed_writings.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_info_id = ? AND Timed_writings.Score IS null', [Semester_info_id], function(err, result) {
						if (err) throw err;

						renderScreen(req, res, 'webforms/timed_writings/semester_unfinished', {
							title: webformType.substring(0, webformType.length-1).toUpperCase(),
							rows: results,
							semesters: semesters,
							thisSemester: thisSemester[0],
							number: result[0].Number,
							url: "/webforms",
							webformType: webformType
						});						
					});			
				});		
			}
			else if (webformType == 'toefls') {
				var query2 = 'SELECT Students.*, Semester_info.*, Toefls.Toefl_id AS ID, Toefls.Listening, Toefls.Reading, Toefls.Grammar, Toefls.IsVerified, Semesters.Semester_id FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN Toefls ON Toefls.Semester_id = Semesters.Semester_id WHERE Semester_info.Semester_info_id = ? AND (Toefls.Listening IS null OR Toefls.Reading IS null OR Toefls.Grammar IS null)';
				connection.query(query2, [Semester_info_id], function(err, results) {
					if (err) throw err;

					connection.query('SELECT COUNT(*) AS Number FROM Semesters LEFT JOIN Toefls ON Toefls.Semester_id = Semesters.Semester_id WHERE Semesters.Semester_info_id = ? AND (Toefls.Listening IS null OR Toefls.Reading IS null OR Toefls.Grammar IS null)', [Semester_info_id], function(err, result) {
						if (err) throw err;

						renderScreen(req, res, 'webforms/toefls/semester_unfinished', {
							title: webformType.substring(0, webformType.length-1).toUpperCase(),
							rows: results,
							semesters: semesters,
							thisSemester: thisSemester[0],
							number: result[0].Number,
							url: "/webforms",
							webformType: webformType
						});						
					});			
				});
			}
			else if (webformType == 'readings' || webformType == 'writings' || webformType == 'speakings' || webformType == 'toefl_preps' || webformType == 'extensive_listenings') {
				var query = 'SELECT Students.*, Semester_info.*, Semesters.Semester_id, ??, ?? , ?? AS ID FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id LEFT JOIN ?? ON Semesters.Semester_id = ?? WHERE Semester_info.Semester_info_id = ? AND ?? IS NULL'

				var option = [TableName + '.Score', TableName + '.IsVerified', TableName + '.' + IndexName, TableName, TableName + '.Semester_id', Semester_info_id, TableName + '.Score'];
				connection.query(query, option, function(err, results) {
					if (err) throw err;

					connection.query('SELECT COUNT(*) AS Number FROM Semesters LEFT JOIN ?? ON ?? = Semesters.Semester_id WHERE Semesters.Semester_info_id = ? AND ?? IS NULL', [TableName, TableName+'.Semester_id', Semester_info_id, TableName + '.Score'], function(err, result) {
						if (err) throw err;

						renderScreen(req, res, 'webforms/grades/semester_unfinished', {
							title: webformType.substring(0, webformType.length-1).toUpperCase(),
							rows: results,
							semesters: semesters,
							thisSemester: thisSemester[0],
							number: result[0].Number,
							url: "/webforms",
							webformType: webformType				
						});						
					});
				});
			}
		});
	});
});

router.get('/interviews/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var userQuery = 'SELECT Students.*, Semesters.Semester_id, Semester_info.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semesters.Semester_id = ?';
	var interviewQuery = 'SELECT * FROM Interviews WHERE Semester_id = ?';

	connection.query(userQuery, [Semester_id], function (err, student) {
		if (err) throw err;

		connection.query(interviewQuery, [Semester_id], function (err, interviews) {
			if (err) throw err;

			renderScreen(req, res, 'webforms/interviews/list', {
				title: "Interview Record List",
				student: student[0],
				rows: interviews,
				url: '/webforms'
			});
		});
	});
});

router.get('/interviews/create/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var queryNumber = 'SELECT COUNT(*) AS Number FROM Interviews WHERE Semester_id = ?';
	connection.query(queryNumber, [Semester_id], function(err, count) {
		if (err) throw err;

		if (count[0].Number >= 2) {
			req.session.error_message = 'Cannot create more than two Interview records.';
			res.redirect('back');
		}
		else {
			var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semesters.Semester_id = ?";
			connection.query(query, [Semester_id], function(err, result) {
				if (err) throw err;

				renderScreen(req, res, 'webforms/interviews/create', {
					title: "Create Interview Record",
					result: result[0],
					url: "/webforms"
				});
			});
		}
	});
});

//save records to database
router.post('/interviews/create/:Semester_id', function(req, res) {
	var query = "INSERT INTO Interviews SET ?";
	var semester = {
		Person_in_charge: req.body.Person_in_charge,
		Pronunciation: req.body.Pronunciation,
		Fluency: req.body.Fluency,
		Vocabulary: req.body.Vocabulary,
		Circumlocution: req.body.Circumlocution,
		Comprehension: req.body.Comprehension,
		Repetition: req.body.Repetition,
		Comments: req.body.Comments,
		Recommendation: req.body.Recommendation,
		IsVerified: false,
		Semester_id: req.params.Semester_id
	};

	connection.query(query, semester, function(err, result) {
		if (err) throw err;

		//increase Statistic of interview record in Count_unverified table
		Count_unverified_change('Interviews', '+');

		//increase interview record number in final_interview table
		var set_final_interview = {
			Semester_id : req.params.Semester_id,
			Count: 1
		};
		connection.query('INSERT INTO Final_interview SET ? ON DUPLICATE KEY UPDATE Count = Count + 1', [set_final_interview], function(err, result) {
			if (err) throw err;
		});


		res.redirect('/webforms/interviews/' + req.params.Semester_id);
	});
});


router.get('/interviews/edit/:Interview_id', function(req, res) {
	var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.*, Interviews.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Interviews ON Semesters.Semester_id = Interviews.Semester_id WHERE Interviews.Interview_id = ?";

	connection.query(query, [req.params.Interview_id], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/interviews/edit', {
			title: "Edit Interview Record",
			result: results[0],
			url: "/webforms"
		});
	});
});

//update the existed record
router.post('/interviews/edit/:Interview_id', function(req, res) {
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
		IsVerified: false,
	};

	connection.query("SELECT * FROM Interviews WHERE Interview_id = ?", [Interview_id], function(err, result) {
		var Semester_id = result[0].Semester_id;
		var IsVerified = result[0].IsVerified;

		connection.query("UPDATE Interviews SET ? WHERE Interview_id = ?", [interview, Interview_id], function(err, result2) {
			if (err) throw err;

			if (IsVerified == '1') {
				Count_unverified_change('Interviews', '+');
				Update_Result_Interview(Semester_id);
			}

			res.redirect('/webforms/interviews/' + Semester_id);
		});		
	});
});

//delete an exited record based on Semester_id
router.get('/interviews/delete/:Interview_id', function(req, res) {
	connection.query('SELECT * FROM Interviews WHERE Interview_id = ?', [req.params.Interview_id], function(err, result) {
		if (err) throw err;

		var Semester_id = result[0].Semester_id;
		var IsVerified = result[0].IsVerified;

		connection.query("DELETE FROM Interviews WHERE Interview_id = ?", [req.params.Interview_id], function(err, result) {
			if (err) throw err;

				//decrease Statistic of interview record in Count_unverified table
				if (IsVerified == 0) {
					Count_unverified_change('Interviews', '-');					
				}

				Update_Result_Interview(Semester_id);


				//decrease count in final interview table
				connection.query('UPDATE Final_interview SET Count = Count - 1 WHERE Semester_id = ?', [Semester_id], function(err, result) {
					if (err) throw err;
				});

			});
		res.redirect('back')
	});
});


//crate toefl record
router.get('/toefls/create/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semesters.Semester_id = ?"
	connection.query(query, [Semester_id], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/toefls/create', {
			title: "TOEFL",
			result: results[0],
			url: "/webforms",
			webformType: 'toefls'
		});
	});
});

router.post('/toefls/create/:Semester_id', function(req, res) {
	var query = "INSERT INTO Toefls SET ?";
	var toefl = {
		Person_in_charge: req.body.Person_in_charge,
		Grammar: req.body.Grammar,
		Listening: req.body.Listening,
		Reading: req.body.Reading,
		Test_Date: req.body.Test_Date,
		IsVerified: false,
		Semester_id: req.params.Semester_id
	};

	connection.query(query, toefl, function(err, result) {
		if (err) throw err;

		Count_unverified_change('Toefls', '+');

		res.redirect('/return');
	});
});

//edit toefl record
router.get('/toefls/edit/:ID', function(req, res) {
	var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.*, Toefls.Toefl_id AS ID, Toefls.Listening, Toefls.Reading, Toefls.Grammar, Toefls.IsVerified, Toefls.Person_in_charge, Toefls.Test_Date FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Toefls ON Semesters.Semester_id = Toefls.Semester_id WHERE Toefls.Toefl_id = ?";

	connection.query(query, [req.params.ID], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/toefls/edit', {
			title: "TOEFL",
			result: results[0],
			url: "/webforms",
			webformType: 'toefls'
		});
	});
});

router.post('/toefls/edit/:ID', function(req, res) {
	var query = "UPDATE Toefls SET ? WHERE Toefl_id = ?"
	var ID =  req.params.ID;
	var toefl = {
		Person_in_charge: req.body.Person_in_charge,
		Grammar: req.body.Grammar,
		Listening: req.body.Listening,
		Reading: req.body.Reading,
		Test_Date: req.body.Test_Date,
		IsVerified: false
	};

	connection.query("SELECT IsVerified, Semester_id FROM Toefls WHERE Toefl_id = ?", [ID], function(err, result) {
		if (err) throw err;

		var IsVerified = result[0].IsVerified;

		var Semester_id = result[0].Semester_id;

		if (IsVerified == '1') {
			Count_unverified_change('Toefls', '+');

			connection.query("SELECT * FROM Exit_reports INNER JOIN Semesters ON Exit_reports.Semester_id = Semesters.Semester_id INNER JOIN Students ON Semesters.Student_id = Students.Student_id WHERE Exit_reports.Semester_id = ?", [Semester_id], function(err, result2) {
				var Degree = result2.Degree;
				var convertedScore = 0;
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
			});
		}

		connection.query(query, [toefl, ID], function(err, result) {
			if (err) throw err;

			res.redirect('/return')
		});
	});


});

//delete toefl record
router.get('/toefls/delete/:ID', function(req, res) {
    var ID = req.params.ID;
	connection.query("SELECT IsVerified, Semester_id FROM Toefls WHERE Toefl_id = ?", [ID], function(err, result) {
		if (err) throw err;
		var IsVerified = result[0].IsVerified;

		var Semester_id = result[0].Semester_id;

		if (IsVerified == '0') {
			Count_unverified_change('Toefls', '-');
		}
		else {
			connection.query("SELECT * FROM Exit_reports INNER JOIN Semesters ON Exit_reports.Semester_id = Semesters.Semester_id INNER JOIN Students ON Semesters.Student_id = Students.Student_id WHERE Exit_reports.Semester_id = ?", [Semester_id], function(err, result2) {
				var Degree = result2.Degree;
				var convertedScore = 0;
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
			});
		}

		connection.query("DELETE FROM Toefls WHERE Toefl_id = ?", [ID], function(err, result) {
				if (err) throw err;		
		});

		res.redirect('back')
	});
});

//list all recommendations to a student
router.get('/recommendations/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var userQuery = 'SELECT Students.*, Semesters.Semester_id, Semester_info.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semesters.Semester_id = ?';
	var recommendationQuery = 'SELECT * FROM Recommendations WHERE Semester_id = ?';

	connection.query(userQuery, [Semester_id], function (err, student) {
		if (err) throw err;

		connection.query(recommendationQuery, [Semester_id], function (err, results) {
			if (err) throw err;

			renderScreen(req, res, 'webforms/recommendations/list', {
				title: "Instructor Recommendation Record List",
				student: student[0],
				rows: results,
				url: '/webforms'
			});
		});
	});
});

//create recommendation record
router.get('/recommendations/create/:Semester_id', function(req, res) {
	var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semesters.Semester_id = ?"
	connection.query(query, [req.params.Semester_id], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/recommendations/create', {
			title: "Create Instructor Recommendation Record",
			result: results[0],
			url: "/webforms"
		});
	});
});

router.post('/recommendations/create/:Semester_id', function(req, res) {
	var query = "INSERT INTO Recommendations SET ?";
	var recommendation = {
		Person_in_charge: req.body.Person_in_charge,
		Attendence: req.body.Attendence + '%',
		Completion: req.body.Completion + '%',
		Participation: req.body.Participation,
		Attitude: req.body.Attitude,
		Recommendation_level: req.body.Recommendation_level,
		Comments: req.body.Comments,
		IsVerified: false,
		Semester_id: req.params.Semester_id
	};

	connection.query(query, recommendation, function(err, result) {
		if (err) throw err;

		//increase Statistic of interview record in Count_unverified table
		Count_unverified_change('Recommendations', '+');

		//increase interview record number in final_interview table
		var set = {
			Semester_id : req.params.Semester_id,
			Count: 1
		};
		connection.query('INSERT INTO Final_Recommendation SET ? ON DUPLICATE KEY UPDATE Count = Count + 1', [set], function(err, result) {
			if (err) throw err;
		});

		res.redirect('/webforms/recommendations/' + req.params.Semester_id);
	});
});

//edit recommendation record
router.get('/recommendations/edit/:Recommendation_id', function(req, res) {
	var ID = req.params.Recommendation_id;
	var query = "SELECT * FROM Semesters INNER JOIN Students ON Semesters.Student_id=Students.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Recommendations ON Semesters.Semester_id = Recommendations.Semester_id WHERE Recommendations.Recommendation_id = ?";

	connection.query(query, [ID], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/recommendations/edit', {
			title: "Edit Instructor Recommendation",
			result: results[0],
			url: "/webforms"
		});
	});
});

router.post('/recommendations/edit/:Recommendation_id', function(req, res) {
	var ID = req.params.Recommendation_id;
	var query = "UPDATE Recommendations SET ? WHERE Recommendation_id = ?"
	var recommendation = {
		Person_in_charge: req.body.Person_in_charge,
		Attendence: req.body.Attendence + '%',
		Completion: req.body.Completion + '%',
		Participation: req.body.Participation,
		Attitude: req.body.Attitude,
		Recommendation_level: req.body.Recommendation_level,
		Comments: req.body.Comments,
		IsVerified: false
	};
	connection.query("SELECT * FROM Recommendations WHERE Recommendation_id = ?", [ID], function(err, result) {
		var Semester_id = result[0].Semester_id;
		var IsVerified = result[0].IsVerified;

		connection.query(query, [recommendation, ID], function(err, result) {
			if (err) throw err;

			if (IsVerified == '1') {
				Count_unverified_change('Recommendations', '+');

				Update_Result_Recommendation(Semester_id);
			}			

			res.redirect('/webforms/recommendations/' + Semester_id);
		});
	});
});

//delete recommendation record
router.get('/recommendations/delete/:Recommendation_id', function(req, res) {
	var ID = req.params.Recommendation_id;
	connection.query("SELECT * FROM Recommendations WHERE Recommendation_id = ?", [ID], function(err, result) {
		var Semester_id = result[0].Semester_id;
		var IsVerified = result[0].IsVerified;

		if (IsVerified == '0') {
			Count_unverified_change('recommendations', '-');

		} else {
			connection.query('UPDATE Final_Recommendation SET Count = Count - 1 WHERE Semester_id = ?', Semester_id, function(err, result) {
				if (err) throw err; 
			});
		}

		connection.query("DELETE FROM Recommendations WHERE Recommendation_id = ?", [req.params.Recommendation_id], function(err, result) {
			if (err) throw err;

			Update_Result_Recommendation(Semester_id);

			res.redirect('/webforms/recommendations/' + Semester_id);
		});
	});
});

router.get('/timed_writings/create/:Semester_id', function(req, res) {
	var Semester_id = req.params.Semester_id;
	var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.* FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id WHERE Semesters.Semester_id = ?"
	connection.query(query, [Semester_id], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/timed_writings/create', {
			title: "Timed Writing Exam",
			result: results[0],
			url: "/webforms",
			webformType: 'timed_writings'
		});
	});
});

router.post('/timed_writings/create/:Semester_id', function(req, res) {
	var query = "INSERT INTO Timed_writings SET ?";
	var timed_writing = {
		Score: req.body.Score,
		Person_in_charge: req.body.Person_in_charge,
		IsVerified: false,
		Semester_id: req.params.Semester_id
	};

	connection.query(query, timed_writing, function(err, result) {
		if (err) throw err;

		Count_unverified_change('Timed_writings', '+');

		res.redirect('/return');
	});
});

router.get('/timed_writings/edit/:ID', function(req, res) {
	var query = "SELECT Students.*, Semesters.Semester_id, Semester_info.*, Timed_writings.Timed_writing_id AS ID, Timed_writings.Score, Timed_writings.Person_in_charge, Timed_writings.IsVerified FROM Students INNER JOIN Semesters ON Students.Student_id = Semesters.Student_id INNER JOIN Semester_info ON Semester_info.Semester_info_id = Semesters.Semester_info_id INNER JOIN Timed_writings ON Semesters.Semester_id = Timed_writings.Semester_id WHERE Timed_writings.Timed_writing_id = ?";

	connection.query(query, [req.params.ID], function(err, results) {
		if (err) throw err;

		renderScreen(req, res, 'webforms/timed_writings/edit', {
			title: "Timed Writing Exam",
			result: results[0],
			url: "/webforms",
			webformType: 'timed_writings'
		});
	});
});

router.post('/timed_writings/edit/:ID', function(req, res) {
	var query = "UPDATE Timed_writings SET ? WHERE Timed_writing_id = ?"
	var timed_writing = {
		Score: req.body.Score,
		Person_in_charge: req.body.Person_in_charge,
		IsVerified: false
	};
	connection.query('SELECT Semester_id, IsVerified FROM Timed_writings WHERE Timed_writing_id = ?', [req.params.ID], function(err, result) {
		if (err) throw err;

		var IsVerified = result[0].IsVerified;

		var Semester_id = result[0].Semester_id;

		if (IsVerified == '1') {
			Count_unverified_change('Timed_writings', '+');

			connection.query('SELECT * FROM Exit_reports WHERE Semester_id = ?', [Semester_id], function(err, result2) {
				var score = 0;
				var Result = result2[0].Teacher_recommendation + result2[0].Interview + result2[0].Grades + result2[0].Toefl + score;
				connection.query('UPDATE Exit_reports SET ? WHERE Semester_id = ?', [{Timed_writing: score, Result: Result}, Semester_id], function(err, result) {
					if (err) throw err;
				})
			});
		}
		connection.query(query, [timed_writing, req.params.ID], function(err, result) {
			if (err) throw err;

			res.redirect('/return')
		});		
	});
});

router.get('/timed_writings/delete/:ID', function(req, res) {
	connection.query('SELECT Semester_id, IsVerified FROM Timed_writings WHERE Timed_writing_id = ?', [req.params.ID], function(err, result) {
		if (err) throw err;

		var IsVerified = result[0].IsVerified;

		var Semester_id = result[0].Semester_id;

		if (IsVerified == '0') {
			Count_unverified_change('Timed_writings', '-');
		}
		else {
			connection.query('SELECT * FROM Exit_reports WHERE Semester_id = ?', [Semester_id], function(err, result2) {
				var score = 0;
				var Result = result2[0].Teacher_recommendation + result2[0].Interview + result2[0].Grades + result2[0].Toefl + score;
				connection.query('UPDATE Exit_reports SET ? WHERE Semester_id = ?', [{Timed_writing: score, Result: Result}, Semester_id], function(err, result) {
					if (err) throw err;
				})
			});
		}

		connection.query("DELETE FROM Timed_writings WHERE Timed_writing_id = ?", [req.params.ID], function(err, result) {
			if (err) throw err;

			res.redirect('/webforms/timed_writings/')
		});

	});

});

module.exports = router;