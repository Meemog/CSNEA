import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class QuestionForm extends React.Component {
  constructor(props) {
    super(props);
    this.generateQuestion = this.generateQuestion.bind(this);
    this.generateForm = this.generateForm.bind(this);
    this.getAnswers = this.getAnswers.bind(this);
    this.questions = []
    this.answers = {'answers': {}}
  }

  generateQuestion(id, index) {
    const question =
      <label key={index}>
        {this.props.data[id]["Text"]}
        <br />
        <input type="text" id={("textInput" + index.toString())}/>
        <br />
      </label>
    return question
  }
  generateForm() {
    let i = 0;
    let toRender = [];
    for (let key in this.props.data){
      this.questions.push([this.generateQuestion([key], i), this.props.data[key]['ID']]);
      toRender.push(this.generateQuestion([key], i))
      i += 1;
    }
    const x = <form>
      {toRender}
      <input type="button" value="Submit" onClick={() => {this.getAnswers()}}/>
      </form>

    return x
  }
  getAnswers() {
    for (let j=0; j < this.questions.length; j++){
      this.answers['answers'][this.questions[j][1]] = (document.getElementById('textInput' + j.toString()).value);
    }
    this.submitAnswers(this.answers);
  }

  submitAnswers(ansDict) {
    let ansHeaders = new Headers();
    ansHeaders.set('Content-Type', 'application/json');
    let ansInit = { method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
      mode: 'no-cors',
      cache: 'default',
      body: JSON.stringify(ansDict)
    }

    let ansRequest = new Request(("http://127.0.0.1:5000/checkAnswers/" + this.props.roundId), ansInit);
    const ansPromise = fetch(ansRequest);

    ansPromise
      .then((response) => response)
      .then((data) => console.log(data));


  }

  render() {
    return (
      <div>
        {this.generateForm()}
      </div>
    );
  }
}

const heading = <h1>Quiz</h1>

let myHeaders = new Headers();
let myInit = { method: 'GET',
  headers: myHeaders,
  mode: 'cors',
  cache: 'default'
};

const renderForm = (id) => {
  let myRequest = new Request(("http://127.0.0.1:5000/questions/" + id), myInit);

  const fetchPromise = fetch(myRequest);

  fetchPromise
    .then((response) => response.json())
    .then(data => ReactDOM.render(<QuestionForm data={data} roundId={id} />, document.getElementById("body")));
}

ReactDOM.render(
  <div>
    {heading}
    <div id='body'>
      <p>Enter RoundID</p>
      <input type="text" id='roundid' />
      <input type="button" value="Get Questions" onClick={() => {renderForm(document.getElementById('roundid').value)}} />
    </div>
  </div>,
  document.getElementById('root'));
