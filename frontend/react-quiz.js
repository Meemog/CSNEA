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

const x = React.createElement(
  'div',
  null,
    React.createElement(
    'h1',
    null,
    'Quiz'
    )
  );

const createQuestionForm = (id) => {
  const getQuestion = (id) =>{
    const question = React.createElement(
      'h4',
      null,
      testData[id]['Text']);
    return question
  }

  const getAuthor = (id) =>{
    const author = React.createElement(
      'h5',
      null,
      ('Question By: '+ testData[id]['Author']));
    return author
  }

  const inputBox = React.createElement(
    'input',


  const questionForm = React.createElement(
    'div',
    null,
    getQuestion(id), getAuthor(id), 
  )

}



ReactDOM.render(x, document.getElementById('app'));

//questions
