import React from 'react';
import { Link } from 'react-router-dom'

class QuestionForm extends React.Component {
  constructor(props) {
    super(props);
    this.generateQuestion = this.generateQuestion.bind(this);
    this.generateForm = this.generateForm.bind(this);
    this.getAnswers = this.getAnswers.bind(this);
    this.questions = []
    this.answers = {'answers': {}}
    this.content = (
      <div>
        {this.generateForm()}
      </div>
    );
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
    let ansInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      body: JSON.stringify(ansDict)
    }

    let ansRequest = new Request(("http://127.0.0.1:5000/checkAnswers/" + this.props.roundId), ansInit);
    const ansPromise = fetch(ansRequest);

    ansPromise
      .then((response) => response.json())
      .then((data) => {
        const elements = []
        let index = 0
        for (const [key, value] of Object.entries(data)) {
          let toAdd = ("Question " + (parseInt(key) + 1).toString() + ": " + (value['correct'] ? "Correct" : "Incorrect"))
          elements.push(<p key={index}>{toAdd}</p>)
          index += 1;
        }
        this.content = <div>{elements}</div>
        this.setState( { state: this.state } )
      });


  }

  render() {
    return this.content
  }
}

class QuestionPage extends React.Component {
  constructor(props) {
    super(props);
    this.content = <div />
    this.rounds = this.props.rounds
    this.roundNum = 0
    this.renderForm(this.rounds[this.roundNum])
  }

  renderForm(id) {
    this.roundNum += 1
    let button = <div />
    if (this.roundNum < this.rounds.length){
      button = (
        <span>
          <input type="Button" value="Next Round" onClick={() => {this.renderForm(this.rounds[this.roundNum])}} />
        </span>
      )
    } else{
      button = (
        <span>
          <button><Link to="/">Done</Link></button>
        </span>
      )
    }
    let myHeaders = new Headers();
    let myInit = { method: 'GET',
      headers: myHeaders,
      mode: 'cors',
      cache: 'default'
    };

    let myRequest = new Request(("http://127.0.0.1:5000/questions/" + id), myInit);

    const fetchPromise = fetch(myRequest);

    fetchPromise
      .then((response) => response.json())
      .then(data => {
        this.content = <div />
        this.setState( { state: this.state } )
        this.content = (
          <div>
            <h1>Round {this.roundNum}</h1>
            <span>
              <QuestionForm data={data} roundId={id} />
            </span>
            {button}
          </div>
        )
        this.setState( { state: this.state } )
      })
  }

  render() {
    return this.content;
  }
}

export { QuestionPage }
