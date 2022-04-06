import React from 'react'

class RoundManager extends React.Component {
  constructor(props){
    super(props)
    this.sessionId = props['SessionId']
    this.currentRound = '-1'
    this.questions = <br />
    this.getQuestions()
    this.content = <br />
    this.waitingArea = (
      <div>
        <h1>Waiting for other players to finish</h1>
      </div>
    )
    this.numQuestions = 0
  }

  getAnswers(){
    for (let i=0; i<this.numQuestions; i++){
      let tempElement = document.getElementById(`question${i}`)
      console.log(tempElement.value)
    }
  }

  submit(){
    this.getAnswers()

  }

  getQuestions(){
    let roundInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
    }

    let roundRequest = new Request(("http://127.0.0.1:5000/currentRound"), roundInit);
    const roundPromise = fetch(roundRequest);

    roundPromise
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        this.currentRound = data.currentRound
        this.renderQuestions(data.questions)
      })
  }

  renderQuestions(questionObject){
    let renderedQuestions = []
    console.log(questionObject)
    let numQuestions = Object.keys(questionObject).length-1
    for (let i=0; i<numQuestions; i++){
      if (questionObject[i].IsMultipleChoice){
        renderedQuestions.push(this.renderMultiChoice(questionObject[i], i))
      }else{
        renderedQuestions.push(this.renderNormal(questionObject[i], i))
      }
    }
    this.numQuestions = numQuestions
    this.questions = <span>{renderedQuestions}</span>
    this.content = (
      <div>
        <h1>Quiz for session with id: {this.sessionId}</h1>
        {this.questions}
        <span>
          <input type="Button" value="Submit" onClick={() => {this.submit()}}/>
        </span>
      </div>
    )
    this.setState({ waiting: false })
  }

  renderNormal(question, id){
    let questionText = question.Text
    return(
      <span>
        <h2>{questionText}</h2>
        <input id={`question${id}`}/>
      </span>
    )
  }

  renderMultiChoice(question, id){
    let questionText = question.Text

    let answers = []
    for (let j=0; j<Object.keys(question.answers).length; j++){
      answers.push(
        <span>
          <input type="Radio" id={`answer${id}${j}`} name={`question${id}`} />
          <label>{question.answers[j].AnsText}</label>
        </span>
      )
    }

    return (
      <span>
        <h2>{questionText}</h2>
        {answers}
      </span>
    )
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  render(){
    return this.content
  }
}

export { RoundManager }
