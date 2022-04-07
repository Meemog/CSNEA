import React from 'react'

class RoundManager extends React.Component {
  constructor(props){
    super(props)
    this.sessionId = props['SessionId']
    this.currentRound = '-1'
    this.questions = <br />
    this.questionDict = {} //TODO: make this work
    this.getQuestions()
    this.content = <br />
    this.waitingArea = (
      <div>
        <h1>Waiting for other players to finish</h1>
      </div>
    )
    this.numQuestions = 0
  }

  getValueFromRadio(name){
    let btns = document.getElementsByName(name);
    let answer = ''
    for (let i=0; i<btns.length; i++){
      if (btns[i].checked){
        answer = btns[i].value;
      }
    }
    return answer
  }

  getAnswers(){
    console.log(this.questionDict);
    let numQuestions = Object.keys(this.questionDict).length
    let userAnsArr = {}
    for (let i=0; i<numQuestions; i++){
      if (this.questionDict[i].multiChoice){
        userAnsArr[i] = this.getValueFromRadio(this.questionDict[i].id)
      }else{
        userAnsArr[i] = document.getElementById(this.questionDict[i].id).value
      }
    }
    return userAnsArr
  }

  submit(){
    let answers = this.getAnswers()

    let submitInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({
        "token": this.getCookie('token'),
        "sessionId": this.sessionId,
        "roundSessionId":this.currentRound,
        "answers": answers
      })
    }

    let submitRequest = new Request(("http://127.0.0.1:5000/submitAnswers"), submitInit);
    const submitPromise = fetch(submitRequest);

    submitPromise
      .then((response) => {
        this.content = this.waitingArea
        this.setState({state: this.state})
        this.startSearchingForScore()
      })
  }

  startSearchingForScore(){
    setInterval(() => {
      console.log("Checking score")
      let checkInit = { method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          },
        cache: 'default',
        mode: 'cors',
        body: JSON.stringify({
          "token": this.getCookie('token'),
          "sessionId": this.sessionId,
          "roundSessionId":this.currentRound,
        })
      }

      let checkRequest = new Request(("http://127.0.0.1:5000/checkAnswers"), checkInit);
      let checkResponse = fetch(checkRequest);

      checkResponse
        .then((cResponse) => cResponse.json())
        .then((cData) => {
          if (cData['ended']){

            let hostInit = { method: 'POST',
              headers: {
                'Content-Type': 'text/plain',
                },
              cache: 'default',
              mode: 'cors',
              body: JSON.stringify({
                "token": this.getCookie('token'),
                "sessionId": this.sessionId,
                "roundSessionId":this.currentRound,
              })
            }

            let hostRequest = new Request(("http://127.0.0.1:5000/checkIfHost"), hostInit);
            let hostResponse = fetch(hostRequest);
            hostResponse
              .then((response) => response.json())
              .then((data) => {
                let nextRoundButton = <br />
                if (data['creator']){
                  nextRoundButton = (
                    <span>
                      <input type="Button" value="start next round" onClick={() => {this.startNextRound()}}/>
                    </span>
                  )
                }
                this.clearAllIntervals()
                this.content = (
                  <div>
                    <h1>Scores:</h1>
                    <span>
                      <p>Your total score:</p>
                      {cData['totalScore']}
                      <p>Your score this round</p>
                      {cData['score']}
                    </span>
                    <span>
                      <p>Highest score so far:</p>
                      {cData['topUser']}: {cData['topScore']}
                    </span>
                    {nextRoundButton}
                  </div>
                )
                this.setState({state: this.state})
                this.checkIfNextRoundStarted()
              })
          }
        })
    }, 5000
    )
  }

  checkIfNextRoundStarted(){
    setInterval(() => {
      console.log("Checking to see if the next round has started")
      let isNextRoundInit = { method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          },
        cache: 'default',
        mode: 'cors',
        body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
      }

      let isNextRoundRequest = new Request(("http://127.0.0.1:5000/nextRoundStarted"), isNextRoundInit);
      let isNextRoundPromise = fetch(isNextRoundRequest);

      isNextRoundPromise
        .then((response) => response.json())
        .then((data) => {
          if(data['gameOver']){
            this.processGameOver()
          }else{
            if(data['started']){
              const currentDate = new Date();
              const timestamp = currentDate.getTime()/1000;
              console.log(timestamp)
              console.log(data['time'])
              const timeToStart = data['time'] - timestamp
              console.log(`Next round starts in: ${timeToStart}`)
              this.wait(timeToStart - 5)
            }else{
              console.log('not started')
            }
          }
        })
    }, 5000)
  }

  processGameOver(){
    this.clearAllIntervals()

    let scoreInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
    }

    let scoreRequest = new Request(("http://127.0.0.1:5000/getScores"), scoreInit);
    let scorePromise = fetch(scoreRequest);

    scorePromise
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        let scores = []
        for (const [key] of Object.keys(data)){
          scores.push(
            <p>{data[key].username}: {data[key].score}</p>
          )
        }
        this.content = (
          <div>
            <h1>Scores</h1>
            <span>
              {scores}
            </span>
          </div>
        )
        this.setState({state: this.state})
      })
  }

  wait(waitTime){
    this.clearAllIntervals()
    console.log(waitTime * 1000)
    setTimeout(() => {this.countdown()}, Math.floor(waitTime * 1000))
  }

  countdown(){
    let numTimes = 5
    let loop = setInterval(() => {
      console.log(numTimes);
      let titleText = `Next round in: ${numTimes}`
      this.content = (
        <div>
          <h1>{titleText}</h1>
        </div>
      )
      this.setState( { state: this.state } )
      numTimes -= 1;
      if (numTimes === -1){
        window.clearInterval(loop)
        this.getQuestions()
      }
    }, 1000)
  }

  startNextRound(){
    this.content = (
      <div>
        <h1>Starting next round</h1>
      </div>
    )
    this.setState({state: this.state});
    let nextRoundInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
    }

    let nextRoundRequest = new Request(("http://127.0.0.1:5000/startNextRound"), nextRoundInit);
    fetch(nextRoundRequest);
  }

  clearAllIntervals(){
    const interval_id = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
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
        this.currentRound = data.currentround
        this.renderQuestions(data.questions)
      })
  }

  renderQuestions(questionObject){
    let renderedQuestions = []
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
    this.questionDict[id] = {"multiChoice": 0, "id":`question${id}`}
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
    this.questionDict[id] = {"multiChoice": 1, "id":`question${id}`}
    for (let j=0; j<Object.keys(question.answers).length; j++){
      answers.push(
        <span>
          <input type="Radio" name={`question${id}`} value={question.answers[j].AnsText}/>
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
