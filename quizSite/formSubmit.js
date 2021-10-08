var noAnswers = 0;

function createNewAnswer() { //adds a new answer input box
  var input = document.createElement("input");
  noAnswers += 1;
  input.id = "Answer" +noAnswers ;
  input.placeholder = "answer";

  element = document.getElementById("form1");
  element.appendChild(input);
}

function removeAnswer(){ //removes the last answer input box
  if (noAnswers != 1){
    var lastAnswer = document.getElementById("Answer" + (noAnswers -1));
    lastAnswer.remove();
    noAnswers -= 1;
  } else {
    alert("Must have at least one answer");
  }
}

function generateNumberedStr(input) { //generates a numbered list from an array
  numbered = "";

  for (let i = 1; i <= input.length; i ++) {
    numbered += (i + ": " + input[i-1] + "\n")
  }
  return numbered
}

function submit() { //looks at the data in the input fields and submits it to the api
  var username = document.getElementById("Username"); //TODO: replace with the user currently logged in
  var question = document.getElementById("Question");
  var multiChoice = document.getElementById("multiChoice");
  var answers = [];

  for (let i = 1; i <= noAnswers; i++) { //gets all the answers
    tempAns = document.getElementById("Answer" + i);
    answers.push(tempAns.value);
  }

  var userVal = username.value;
  var questVal = question.value;
  var multiBool = (multiChoice.value ? 1 : 0); //turns JS bool value into a more universal 1 or 0

  alertStr = ("Posted the following to the API:\nUsername: " + userVal + "\nQuestion: " + questVal + "\nAnswer(s): " + answers + "\nMultiple choice?: " + multiBool)

  if (multiBool) { //prompts the user to say the correct answer
    var ansTxt = generateNumberedStr(answers);
    var correct = prompt("Which is the correct answer:\n" + ansTxt);
    alertStr += "\nCorrect index: " + correct;
  }


  alert(alertStr); //TODO: replace with request code
}


