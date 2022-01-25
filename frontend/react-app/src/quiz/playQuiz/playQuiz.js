import React from 'react';

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
    this.content = (
        <div>
          <h1>Quiz</h1>
          <span>
            <p>Enter RoundID</p>
            <input type="text" id='roundid' />
          </span>
          <span>
            <input type="button" value="Get Questions" onClick={() => {this.renderForm(document.getElementById('roundid').value)}} />
          </span>
        </div>
      )
  }
  renderForm(id) {
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
        this.content = (
          <div>
            <h1>Quiz</h1>
            <QuestionForm data={data} roundId={id} />
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
