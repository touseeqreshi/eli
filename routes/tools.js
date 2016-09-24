var express = require('express');
var router = express.Router();

//export global functions
module.exports = function() {
	//middleware: check whether current client has logged in the system. If not, jump to login page.
	this.isAuthenticated = function(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			req.session.error_message = "Please login first to use the system.";
			req.session.returnTo = req.originalUrl;
			res.redirect('/login');
		}
	};

	//middleware: check whether the user has been verified. If not, jump back to homepage.
	this.isVerified = function(req, res, next) {
		var user = req.user[0];
		if (user.isVerified == '1') {
			next();
		} else {
			req.session.error_message = "Please wait for administrator verifying your account, or contact administrator right now.";
			res.redirect('/');
		}
	}

	//middleware: check whether the user is admin. if not, reject the request and go back to orginal screen.
	this.isAdmin = function(req, res, next) {
		var user = req.user[0];
		if ((user.User_group == 'admin' ) || (user.User_group == 'super_user' )) {
			next();
		} else {
			req.session.error_message = "Sorry. Only administrator is allowed to access this funciton.";
			res.redirect('/');
		}
	}

	//function to generate a random password
	this.makePassword = function(number) {
		var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < number; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

	//group user info passing, messages display and screen render together
	this.renderScreen = function(req, res, view, options) {
/*		var options = {
			title: 'Home',
			url: '/'
		}*/
		//if user has logged in, assign req.user[0] to variable user
		if (req.isAuthenticated()) {
			options.user = req.user[0];
			if (req.user[0].User_group == 'interviewer') {
				options.isInterviewer = true;
			}
		}
		//if previous page has passed a meesage in session, render it.
		if (req.session.hasOwnProperty('okay_message')) {
			options.okay_message = req.session.okay_message;
			delete req.session.okay_message;
		}
		//if previous page has passed an error meesage in session, render it.
		if (req.session.hasOwnProperty('error_message')) {
			options.error_message = req.session.error_message;
			delete req.session.error_message;
		}
		//stop from displaying whole student id
		if (options.hasOwnProperty('rows')) {
			if (options.rows.length != 0 ) {
				for (var i in options.rows) {
					if (options.rows[i].hasOwnProperty('Student_number')) {
						options.rows[i].Student_number = 'F****' + options.rows[i].Student_number.substring(5, 9)
					}				
				}
			}
		}
		if (options.hasOwnProperty('results')) {
			if (options.results.length != 0) {
				for (var i in options.results) {
					if (options.results[i].hasOwnProperty('Student_number')) {
						options.results[i].Student_number = 'F****' + options.results[i].Student_number.substring(5, 9);
					}
				}				
			}
		}
		if (options.hasOwnProperty('result')) {
			for (var i in options.result) {
				if (options.result.hasOwnProperty('Student_number')) {
					options.result.Student_number = 'F****' + options.result.Student_number.substring(5, 9);
				}				
			} 				
		}
		if (options.hasOwnProperty('students')) {
			for (var i in options.students) {
				if (options.students[i].hasOwnProperty('Student_number')) {
					options.students[i].Student_number = 'F****' + options.students[i].Student_number.substring(5, 9);
				}				
			}
		}
		if (options.hasOwnProperty('student')) {
			if (options.student.hasOwnProperty('Student_number')) {
				options.student.Student_number = 'F****' + options.student.Student_number.substring(5, 9);
			}				
		}
		res.render(view, options)
	}

	//statistic table
/*	CREATE TABLE Count_unverified (
	ID int NOT NULL AUTO_INCREMENT,
	Interviews int DEFAULT 0,
	Timed_writings int DEFAULT 0,
	Toefls int DEFAULT 0,
	Readings int DEFAULT 0,
	Speakings int DEFAULT 0,
	Writings int DEFAULT 0,
	Toefl_preps int DEFAULT 0,
	Extensive_listenings int DEFAULT 0,
	Recommendations int DEFAULT 0,
	PRIMARY KEY (ID)
	);*/

	//function to change unverified statistic table
	this.Count_unverified_change = function(TableName, option) {
		var query = 'UPDATE Count_unverified SET ' + TableName + '=' +  TableName + option + '1 WHERE ID = 0';
		connection.query(query, function(err, result) {
			if (err) throw err;
		});
	}

	//Interview convertion formula
	this.Convert_Score_Interviews = function(Recommendations) {
		var sum = 0;
		for (var i in Recommendations) {
			sum += Recommendations[i].Recommendation;
		}
		sum = Math.ceil(sum /Recommendations.length * 3);
		var score = 0;
		switch (sum) {
	    case 1:
	        score = 2;
	        break;
	    case 2:
	        score = 2
	        break;
	    case 3:
	        score = 3;
	        break;
	    case 4:
	        score = 5;
	        break;
	    case 5:
	        score = 8;
	        break;
	    case 6:
	        score = 10;
	        break;
	    case 7:
	    	score = 13;
	    	break;
	    case 8:
	    	score = 17;
	    	break;
	    case 9:
	    	score = 20;
	    	break;
	    default:
	    	score = 0;
		}
		return score;
	}

	//code for update interview and final interview table
	this.Update_Result_Interview = function(Semester_id) {
		//update score in final_interviews and Exit_report
		connection.query('SELECT Recommendation FROM Interviews WHERE Semester_id = ? AND IsVerified = 1', [Semester_id], function(err, Recommendations) {

			var score = 0;

			if (Recommendations.length != 0) {
				score = Convert_Score_Interviews(Recommendations);;
			}

			connection.query('UPDATE Final_interview SET ? WHERE Semester_id = ?', [{Score: score}, Semester_id], function(err, result) {
			});

			connection.query('SELECT * FROM Exit_reports WHERE Semester_id = ?', [Semester_id], function(err, result3) {
				if (result3.length == 0) {
					var option = [
					{Semester_id: Semester_id,Interview: score,Result: score},
					score, score
					];
				} else {
					var Result = result3[0].Teacher_recommendation + result3[0].Timed_writing + result3[0].Grades + result3[0].Toefl + score;
					var option = [
					{Semester_id: Semester_id,Interview: score,Result: Result},
					score, Result
					];
				}
				connection.query('INSERT INTO Exit_reports SET ? ON DUPLICATE KEY UPDATE Interview = ?, Result = ?', option, function(err, result) {
					if (err) throw err;
				});					
			});
		});
	}

	//update score in recommendation and final recommendation table
	this.Update_Result_Recommendation = function(Semester_id) {
		connection.query('SELECT Recommendation_level FROM Recommendations WHERE Semester_id = ? AND IsVerified = 1', [Semester_id], function(err, results) {

			var RawScore = 0;
			for (var i in results) {
				RawScore += results[i].Recommendation_level;
			}

			RawScore = RawScore/results.length;

			var convertedScore = Convert_Sore_Recommendation(RawScore);

			var option = [{Semester_id: Semester_id,
				Raw_score: RawScore,
				Final_score: convertedScore
			}, RawScore, convertedScore];
			connection.query('INSERT INTO Final_Recommendation SET ? ON DUPLICATE KEY UPDATE Raw_score = ?, Final_score = ?', option, function(err, result) {
				if (err) throw err;

			});

			connection.query('SELECT * FROM Exit_reports WHERE Semester_id = ?', [Semester_id], function(err, result2) {
				if (result2.length == 0) {
					option = [{Semester_id: Semester_id, Teacher_recommendation: convertedScore, Result: convertedScore}, convertedScore, convertedScore];
				} else {
					var Result = result2[0].Interview + result2[0].Timed_writing + result2[0].Grades + result2[0].Toefl + convertedScore;
					option = [{Semester_id: Semester_id, Teacher_recommendation: convertedScore, Result: Result}, convertedScore, Result];
				}
				connection.query('INSERT INTO Exit_reports SET ? ON DUPLICATE KEY UPDATE Teacher_recommendation = ?, Result = ?', option, function(err, result) {
					if (err) throw err;
				})
			});
		});
	}

	//convert from 4.0 grade to exit criteria score
	this.Convert_Grades = function(TableName, Score, grades) {
		var Raw_grade = 0;
		var count = 0;

		grades[TableName] = Score;

		if (grades['Readings'] != null) {
			count += 2;
			Raw_grade += 2 * parseFloat(grades['Readings']);
		}
		if (grades['Speakings'] != null) {
			count += 2;
			Raw_grade += 2 * parseFloat(grades['Speakings']);
		}
		if (grades['Writings'] != null) {
			count += 2;
			Raw_grade += 2 * parseFloat(grades['Writings']);
		}
		if (grades['Toefl_preps'] != null) {
			count += 1;
			Raw_grade += parseFloat(grades['Toefl_preps']);
		}
		if (grades['Extensive_listenings'] != null) {
			count += 1;
			Raw_grade += parseFloat(grades['Extensive_listenings']);
		}
		if (count == 0)
		{
			Raw_grade = 0;
		} else {
			Raw_grade = Raw_grade / count;			
		}

		var ranges = [0, 0.80, 0.96, 1.10, 1.30, 1.50, 1.70, 1.80, 2.00, 2.10, 2.20, 2.50, 2.70, 2.80, 3.00, 3.10, 3.50, 3.70, 3.80, 3.90, 4.00];

		var Final_grade = 20;
		for (var i = 1; i <= 20; i++)
		{
			if (Raw_grade >= ranges[i - 1] && Raw_grade < ranges[i]) {
				Final_grade = i - 1;
				break;
			}			
		}

		return {
			Raw_grade: Raw_grade,
			Final_grade: Final_grade
		};
	}
	//convert timed writing raw score
	this.Convert_Score_TWE = function(RawScore) {
		var Final_score = 20;
		var ranges = [0.0, 1.0, 2.0, 3.0, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
		var score = [0, 3,4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
		for (var i = 1; i < ranges.length; i ++) {
			if (RawScore >= ranges[i - 1] && RawScore < ranges[i]) {
				Final_score = score[i - 1];
				break;
			}
		}
		return Final_score;
	}
	//convert toefl score
	this.Convert_Score_Toefl = function(Degree, item) {
		var convertedScore = 20;
		var RawScore = Math.ceil((parseInt(item.Listening) + parseInt(item.Reading) + parseInt(item.Grammar)) * 10 / 3);
		var ranges=[];
		var score=[];
		if (Degree == 'undergraduate') {
			ranges = [0, 453, 457, 460, 463, 467, 470, 473, 477, 480, 483, 487, 490, 493, 497, 500];
			score = [0, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20];
		}
		else {
			ranges = [0, 480, 483, 490, 493, 497, 500, 503, 510, 513, 517, 520, 523, 530, 533, 537, 540, 547, 550];
			score = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		}
		for (var i = 1; i < ranges.length; i++) {
			if (RawScore >= ranges[i - 1] && RawScore < ranges[i]) {
				convertedScore = score[i - 1];
				break;
			}
		}
		return convertedScore;
	}
	//convert recommendation score
	this.Convert_Sore_Recommendation = function(RawScore) {
		var convertedScore = 20;
		var ranges = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

		var score = [0, 5, 7, 10, 12, 14, 16, 17, 18, 20];


		for (var i = 1; i < ranges.length; i++) {

			if (RawScore >= ranges[i - 1] && RawScore < ranges[i]) {

				convertedScore = score[i - 1];
				break;
			}
		}
		return convertedScore;
	}


};