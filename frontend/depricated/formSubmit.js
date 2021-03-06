var noAnswers = 0;
var ansArr = [];

function createNewAnswer() {
  noAnswers += 1;

  var pretext = document.createElement("P");
  pretext.innerText = "Enter answer";
  pretext.id = "Pretext" + noAnswers;

  var input = document.createElement("input");
  input.id = "Answer" + noAnswers;
  input.placeholder = "answer";

  var removeBtn = document.createElement("BUTTON");
  removeBtn.id = "RemoveAnswer" + noAnswers;
  removeBtn.innerText = "Remove";

  var idNum = noAnswers;
  removeBtn.onclick = function(){
    if (ansArr.length != 1) {
      var index = ansArr.indexOf(idNum);
      ansArr.splice(index, 1);

      var lastPretext = document.getElementById("Pretext" + idNum);
      var lastAnswer = document.getElementById("Answer" + idNum);
      var lastButton = document.getElementById("RemoveAnswer" + idNum);
      var lastBreak = document.getElementById("Break" + idNum);

      lastPretext.remove();
      lastAnswer.remove();
      lastBreak.remove();
      lastButton.remove();
    } else{
      alert("Must have at least one answer");
    }
  }

  var br = document.createElement("BR");
  br.id = "Break" + noAnswers;

  element = document.getElementById("form1");
  element.appendChild(pretext);
  element.appendChild(input);
  element.appendChild(removeBtn);
  element.appendChild(br);

  ansArr.push(idNum);
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
  var errors = [];

  for (var i = 0; i < ansArr.length; i++) {
    tempAns = document.getElementById("Answer" + ansArr[i]);
    if(tempAns.value){
      answers.push(tempAns.value);
    }
  }

  if (answers.length == 0){
    errors.push("Enter an answer");
  }

  var userVal = username.value;

  if (!userVal){
    errors.push("Enter a username");
  }

  var questVal = question.value;

  if (!questVal){
    errors.push("Enter a question");
  }

  var multiBool = (multiChoice.checked ? 1 : 0);

  if (multiBool && answers.length <= 1){
    errors.push("Enter multiple answers for multiple choice");
  }

  if (errors.length == 0){
    alertStr = ("Posted the following to the API:\nUsername: " + userVal + "\nQuestion: " + questVal + "\nAnswer(s): " + answers + "\nMultiple choice?: " + multiBool)

    if (multiBool) {
      var ansTxt = generateNumberedStr(answers);
      var correct = prompt("Which is the correct answer:\n" + ansTxt);
      alertStr += "\nCorrect index: " + correct;
    }


    alert(alertStr); //TODO: replace with request code
  }else{
    alert(errors[0]);
  }
}


