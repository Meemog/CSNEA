var noAnswers = 0;

function createNewAnswer() {
  var input = document.createElement("input");
  input.id = "Answer" +noAnswers ;
  input.placeholder = "answer";
  noAnswers += 1;

  element = document.getElementById("form1");
  element.appendChild(input);
}

function removeAnswer(){
  if (noAnswers != 0){
    var lastAnswer = document.getElementById("Answer" + (noAnswers -1));
    lastAnswer.placeholder = "removed";
    noAnswers -= 1;
  } else {
    alert("Must have at least one answer");
  }
}

function submit() {
  var username = document.getElementById("Username");
  var question = document.getElementById("Question");
  var answer = document.getElementById("Answer0");

  var userVal = username.value;
  username.value = '';
  var questVal = question.value;
  question.value = '';
  var ansVal = answer.value;
  answer.value = '';

  alert("Posted the following to the API:\nUsername: " + userVal + "\nQuestion: " + questVal + "\nAnswer: " + ansVal);
}


