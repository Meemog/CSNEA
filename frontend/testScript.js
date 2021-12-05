function doAlert() {
  alert("Placeholder text");
}

function changeTest() {
  document.getElementById("test").innerHTML = document.getElementById("test").innerHTML + " test";
}

function textColour() {
  var text = document.getElementById("test");
  const colours = ["red", "orange", "yellow", "green", "blue", "purple", "black"];

  text.style.color = colours[Math.floor(Math.random() * 7)];
}

function delText() {
  var text = document.getElementById("test");
  text.innerHTML = "text: ";
}

function submit() {
  var field = document.getElementById("textField");
  var text = document.getElementById("test");
  text.innerHTML = text.innerHTML + field.value;
}
