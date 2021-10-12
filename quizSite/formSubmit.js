var noAnswers = 0;

function createNewAnswer() {
  noAnswers += 1;

  var pretext = document.createElement("P");
  pretext.innerText = "Enter an answer";
  pretext.id = "Pretext" + noAnswers;

  var input = document.createElement("input");
  input.id = "Answer" + noAnswers;
  input.placeholder = "answer";

  var removeBtn = document.createElement("BUTTON");
  removeBtn.id = "RemoveAnswer" + noAnswers;
  var idNum = noAnswers;
  removeBtn.onclick = function(){
    var lastPretext = document.getElementById("Pretext" + idNum);
    var lastAnswer = document.getElementById("Answer" + idNum);
    var lastBreak = document.getElementById("Break" + idNum); //TODO: remove button as well
    lastPretext.remove();
    lastAnswer.remove();
    lastBreak.remove();
  }

  var br = document.createElement("BR");
  br.id = "Break" + noAnswers;

  element = document.getElementById("form1");
  element.appendChild(pretext);
  element.appendChild(input);
  element.appendChild(removeBtn);
  element.appendChild(br);
}

function removeAnswer(){
  if (noAnswers != 1){
    var lastPretext = document.getElementById("Pretext" + (noAnswers -1));
    var lastAnswer = document.getElementById("Answer" + (noAnswers -1));
    var lastBreak = document.getElementById("Break" + (noAnswers -1));
    lastPretext.remove();
    lastAnswer.remove();
    lastBreak.remove();
    noAnswers -= 1;
    alert(noAnswers);
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


