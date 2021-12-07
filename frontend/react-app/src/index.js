import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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

class QuestionForm extends React.Component {
  constructor(props) {
    super(props);
    this.generateQuestion = this.generateQuestion.bind(this);
  }

  generateQuestion(id) {
    const question =
      <label>
        {this.props.data[id]["Text"]}
        <br />
        <input type="text" />
        <br />
      </label>
    return question
  }
  generateForm() {
    let questions = [];
    for (let key in this.props.data){
      questions.push(this.generateQuestion([key]));
    }
    const x = <form>
      {questions}
      <input type="submit" value="Submit" />
      </form>

    return x

  }

  render() {
    return (
      this.generateForm()
    );
  }
}

let myHeaders = new Headers();
let myInit = { method: 'GET',
  headers: myHeaders,
  mode: 'cors',
  cache: 'default'
};
let myRequest = new Request("http://127.0.0.1:5000/questions/0", myInit);

const fetchPromise = fetch(myRequest);

fetchPromise
  .then((response) => response.json())
  .then(data => console.log(data));

console.log('first');

//ReactDOM.render(<QuestionForm data={testData}/>, document.getElementById("root"))
