//confirmation alert
$('.confirmation').on('click', function () {
    return confirm('Are you sure?');
});

//sign up password client side validation check
function checkPass()
{
  //Store the password field objects into variables ...
  var pass1 = document.getElementById('password');
  var pass2 = document.getElementById('re_password');
  //Store the Confimation Message Object ...
  var message = document.getElementById('confirmMessage');
  //Set the colors we will be using ...
  var goodColor = "#66cc66";
  var badColor = "#ff6666";
  //Compare the values in the password field 
  //and the confirmation field
  if((pass1.value == pass2.value) && (pass1.value != null) && (pass2.value!=null)){
      //The passwords match. 
      //Set the color to the good color and inform
      //the user that they have entered the correct password 
      pass2.style.backgroundColor = goodColor;
      message.style.color = goodColor;
      message.innerHTML = "Passwords Match!"
  }else{
      //The passwords do not match.
      //Set the color to the bad color and
      //notify the user.
      pass2.style.backgroundColor = badColor;
      message.style.color = badColor;
      message.innerHTML = "Passwords Do Not Match!"
  }
}

//sign up webpage validation check
$("#sign_up").submit(function( event ) {
	var err = $('.err')
  //username must not be empty
	if ($('#username').val().length==0) {
		err.prepend($('<div role="alert" class="alert alert-danger"><span aria-hidden="true" class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span>  Username cannot be empty!</div>'));
		event.preventDefault();
		//email cannot be empty
	} else if ($('#email').val().length==0) {
		err.prepend($('<div role="alert" class="alert alert-danger"><span aria-hidden="true" class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span>  E-mail cannot be empty!</div>'));
		event.preventDefault();
    //password cannot be empty
	} else if ($('#password').val().length==0) {
		err.prepend($('<div role="alert" class="alert alert-danger"><span aria-hidden="true" class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span>  Password cannot be emty!</div>'));
		event.preventDefault();
    //password must match
	} else if ($('#password').val() != $('#re_password').val()) {
		err.prepend($('<div role="alert" class="alert alert-danger"><span aria-hidden="true" class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span>  Passwords do not match!</div>'));
		event.preventDefault();
	} else {
		return;
	}
})

//student number validation check.
$('#Student_number').keypress(function(e) {
  var Student_number = $('#Student_number');
  var message = $('#checkID');

  var digits = [];
  for (i = 48; i < 58; i++) {
    digits.push(i);
  }

  var k = e.which;
  //length must be 8
  if (Student_number.val().length < 7) {
    message.css('color', "red");
    message.text('This is a incorrect student ID. It is must be 8 digits.');
  } else {
    message.css('color', "green");
    message.text('Correct!');
  }
  
  //all char must be number
  if (digits.indexOf(k) < 0) {
    e.preventDefault();
  }
})

//pass date-time object into input box, convert date into acceptable string
$('#Test_Date').val(function(){
  var hidden_date = $('#hidden_date').val();
  var date = new Date(hidden_date);
  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var year = date.getFullYear();
  return year + '-' + month + '-' + day;
})

//change username validation
$('#change_username').submit(function(event) {
  var err = $('.err');
  //username cannot be empty
  if ($('#username').val().length==0) {
    err.prepend($('<div role="alert" class="alert alert-danger"><span aria-hidden="true" class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span>  Username cannot be empty!</div>'));
    event.preventDefault();
  } else {
    return;
  }
})

//validation for create recommendation form
$('#create_recommendation').submit(function(event) {
  var selected = $("#required input[type='radio']:checked");
  if (!selected.val()) {
    event.preventDefault();
    alert('You have to pick up a score for required field at option "Recommendation Of Subsequent Student"');
  }
})

//validation for create interview form
$('#create_interview').submit(function(event) {
  var selected = $("#required input[type='radio']:checked");
  if (!selected.val()) {
    event.preventDefault();
    alert('You have to pick up a score for required field at option "Final Interview Recommendation"');
  }
})