import React from 'react';
import { Link } from 'react-router-dom'

class QuestionPage extends React.Component {
  constructor(props) {
    super(props);
    this.content = <div />
    this.rounds = this.props.rounds
    this.roundNum = 0
    this.renderForm(this.rounds[this.roundNum])
    this.hasSubmitted = false;
  }

  initialise(data, id) {
    this.generateQuestion = this.generateQuestion.bind(this);
    this.data = data;
    this.id = id;
    this.generateForm = this.generateForm.bind(this);
    this.getAnswers = this.getAnswers.bind(this);
    this.questions = []
    this.answers = {'answers': {}}
    this.questionContent = (
      <div>
        {this.generateForm()}
      </div>
    );
  }

  generateQuestion(id, index) {
    const question =
      <label key={index}>
        {this.data[id]["Text"]}
        <br />
        <input type="text" id={("textInput" + index.toString())}/>
        <br />
      </label>
    return question
  }
  generateForm() {
    let i = 0;
    let toRender = [];
    for (let key in this.data){
      this.questions.push([this.generateQuestion([key], i), this.data[key]['ID']]);
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

    let ansRequest = new Request(("http://127.0.0.1:5000/checkAnswers/" + this.id), ansInit);
    const ansPromise = fetch(ansRequest);

    ansPromise
      .then((response) => response.json())
      .then((data) => {
        console.log('test');
        const elements = []
        let index = 0
        for (const [key, value] of Object.entries(data)) {
          let toAdd = ("Question " + (parseInt(key) + 1).toString() + ": " + (value['correct'] ? "Correct" : "Incorrect"))
          elements.push(<p key={index}>{toAdd}</p>)
          index += 1;
        }
        this.questionContent = <div>{elements}</div>
        this.content = [
            <h1>Round {this.roundNum}</h1>,
            <span>{this.questionContent}</span>
        ];
        this.setButton();
        this.setState( { state: this.state } )
      });
  }

  nextRoundBtn(){
    this.renderForm(this.rounds[this.roundNum])
  }

  setButton(){
    if (this.roundNum < this.rounds.length){
      this.button = (
        <span>
          <input type="Button" value="Next Round" onClick={() => {this.nextRoundBtn()}} />
        </span>
      )
    } else{
      this.button = (
        <span>
          <button><Link to="/">Done</Link></button>
        </span>
      )
    }
  }

  renderForm(id) {
    this.roundNum += 1
    this.button = <div />
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
        this.initialise(data, id)
        console.log(this.questionContent)
        this.content = [
            <h1>Round {this.roundNum}</h1>,
            <span>
              {this.questionContent}
            </span>
        ]
        this.setState( { state: this.state } )
      })
  }

  render() {
    return (
      <div>
        {this.content}
        {this.button}
      </div>
    )
  }
}

export { QuestionPage }
