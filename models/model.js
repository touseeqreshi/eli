var express = require('express');
var router = express.Router();

//define semester class
/*
CREATE TABLE Semesters (
Semester_id int NOT NULL AUTO_INCREMENT,
Semester_info_id int,
Student_id int,
PRIMARY KEY (Semester_id),
FOREIGN KEY (Semester_info_id) REFERENCES Semester_info(Semester_info_id),
FOREIGN KEY (Student_id) REFERENCES Students(Student_id)
);
*/

//define Semester Info class
/*
CREATE TABLE Semester_info (
Semester_info_id int NOT NULL AUTO_INCREMENT,
Year int(4),
Season varchar(10),
Term varchar(10),
Level varchar(10),
Section varchar(10),
PRIMARY KEY (Semester_info_id)
);
*/

//define student class
/*
CREATE TABLE Students(
Student_id int NOT NULL UNIQUE AUTO_INCREMENT,
Student_number varchar(9) UNIQUE,
First_name varchar(100),
Last_name varchar(100),
Major varchar(100),
PRIMARY KEY Student_id
);
*/

//Final_interview: contains final score of the interview and all interview_id
/*
CREATE TABLE Final_interview (
Final_interview_id int NOT NULL AUTO_INCREMENT,
Semester_id int UNIQUE,
Count int DEFAULT 0,
Score varchar(5),
PRIMARY KEY (Final_interview_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
);
*/

//intervbiew: Each item is related to a semester item by Semester_id
//define interview class
/*
Interview_id int NOT NULL AUTO_INCREMENT,
Pronunciation int,
Fluency int,
Comprehension int,
Repetition int,
Comments varchar(400),
Recommendation int,
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Interview_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
*/

//grade - reading
//define Readings class
/*
Reading_id int NOT NULL AUTO_INCREMENT,
Reading_score varchar(5),
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Reading_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
*/

//grade-speaking
//define speaking class
/*
Speaking_id int NOT NULL AUTO_INCREMENT,
Speaking_score varchar(5),
IsVerified bool,
Semester_id int,
PRIMARY KEY (Speaking_id),
Person_in_charge varchar(255),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
*/


//grade - writing
//define writing class
/*
Writing_id int NOT NULL AUTO_INCREMENT,
Writing_score varchar(5),
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Writing_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
*/


//grade - toofl prep
//define Toefl_preps class
/*
CREATE TABLE Toefl_prep(
Toefl_prep_id int NOT NULL UNIQUE AUTO_INCREMENT,
Toefl_prep_score varchar(5),
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Toefl_prep_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
);
*/


//grade extensive listening
//define Extensive_listenings class
/*
CREATE TABLE Extensive_listenings(
Extensive_listening_id int NOT NULL UNIQUE AUTO_INCREMENT,
Extensive_listening_score varchar(5),
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Extensive_listening_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
);
*/


// toefl
//define toefl class
/*
Toefl_id int NOT NULL AUTO_INCREMENT,
Listening int,
Reading int,
Grammar int,
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Toefl_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
*/

//recommendation
//define recommendation class
/*
CREATE TABLE Recommendations(
Recommendation_id int NOT NULL AUTO_INCREMENT,
Attendence varchar(10),
Completion varchar(10),
Participation varchar(20),
Attitude varchar(20),
Recommendation_level int,
Comments varchar(255),
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Recommendation_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
);
*/

//timed writing
//define timed_writing class
/*
Timed_writing_id int NOT NULL AUTO_INCREMENT,
Score varchar(5),
IsVerified bool,
Semester_id int,
Person_in_charge varchar(255),
PRIMARY KEY (Timed_writing_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
*/

//exit criteria report
/*
Exit_report_id int NOT NULL AUTO_INCREMENT,
Semester_id int UNIQUE,
Teacher_recommendation int,
Timed_writing int,
Grades int,
Interview int,
Toefl int,
Result int,
PRIMARY KEY (Exit_report_id),
FOREIGN KEY (Semester_id) REFERENCES Semesters(Semester_id)
*/

module.exports = router;