'use strict';

const testData = {
  "0": {
    "Author": "TEST_USER_0", 
    "ID": 0, 
    "IsMultipleChoice": 0, 
    "Text": "2x -3 = 9 Find x"
  }, 
  "1": {
    "Author": "TEST_USER_0", 
    "ID": 1, 
    "IsMultipleChoice": 0, 
    "Text": "x/3 * 4 = 12 Find x"
  }, 
  "2": {
    "Author": "TEST_USER_0", 
    "ID": 2, 
    "IsMultipleChoice": 1, 
    "Text": "4x = 4 Find x", 
    "answers": {
      "0": {
        "AnsText": "1", 
        "ID": 2
      }, 
      "1": {
        "AnsText": "2", 
        "ID": 3
      }, 
      "2": {
        "AnsText": "0", 
        "ID": 4
      }
    }
  }
};


const getData = function(id) {
  let dict = testData[id];
  let str = '';
  str += dict["ID"] + ', ';
  str += dict["Author"] + ', ';
  str += dict["IsMultipleChoice"] + ', ';
  str += dict["Text"] + ', ';
  return str;
};

const x = React.createElement(
  'div',
  null,
    React.createElement(
    'h1',
    null,
    'Quiz'
    ), React.createElement(
    'h4',
    null,
    'that i made'
    ),
);

ReactDOM.render(x, document.getElementById('app'));

//questions
