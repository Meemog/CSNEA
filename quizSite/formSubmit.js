var numAnswers = 1;


function submit() {
  var username = document.getElementById("Username");
  var question = document.getElementById("Question");
  var answer = document.getElementById("Answer");

  var userVal = username.value;
  username.value = '';
  var questVal = question.value;
  question.value = '';
  var ansVal = answer.value;
  answer.value = '';

  alert("Posted the following to the API:\nUsername: " + userVal + "\nQuestion: " + questVal + "\nAnswer: " + ansVal);
}


