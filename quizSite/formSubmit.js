var noAnswers = 0;

function createNewAnswer() {
  var input = document.createElement("input");
  noAnswers += 1;
  input.id = "Answer" +noAnswers ;
  input.placeholder = "answer";

  element = document.getElementById("form1");
  element.appendChild(input);
}

function removeAnswer(){
  if (noAnswers != 1){
    var lastAnswer = document.getElementById("Answer" + (noAnswers -1));
    lastAnswer.remove();
    noAnswers -= 1;
  } else {
    alert("Must have at least one answer");
  }
}

function generateNumberedStr(input) {
  numbered = "";

  for (let i = 1; i <= input.length; i ++) {
    numbered += (i + ": " + input[i-1] + "\n")
  }
  return numbered
}

function submit() {
  var username = document.getElementById("Username");
  var question = document.getElementById("Question");
  var multiChoice = document.getElementById("multiChoice");
  var answers = [];

  for (let i = 1; i <= noAnswers; i++) {
    tempAns = document.getElementById("Answer" + i);
    answers.push(tempAns.value);
  }

  var userVal = username.value;
  var questVal = question.value;
  var multiBool = (multiChoice.value ? 1 : 0);

  alertStr = ("Posted the following to the API:\nUsername: " + userVal + "\nQuestion: " + questVal + "\nAnswer(s): " + answers + "\nMultiple choice?: " + multiBool)

  if (multiBool) {
    var ansTxt = generateNumberedStr(answers);
    var correct = prompt("Which is the correct answer:\n" + ansTxt);
    alertStr += "\nCorrect index: " + correct;
  }


  alert(alertStr); //TODO: replace with request code
}


