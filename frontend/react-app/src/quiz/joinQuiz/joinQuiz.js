import React from 'react'
import { QuestionPage } from './playQuiz.js'

class JoinPage extends React.Component {
  constructor(props) {
    super(props);
    this.rounds = []
    this.state = {
      data: false
    }
    this.baseContent = (
      <div>
        <h1>Join Quiz</h1>
        <span>
          <p>Enter Quiz ID</p>
          <input id="quizid" />
          <input type="button" value="Submit" onClick={() => {this.submit()}}/>
        </span>
      </div>
    )
    this.content = this.baseContent
  }

  submit(){
    let quizId = document.getElementById("quizid").value;
    let actions = []

    if (!/^([1-9][0-9]*)$/.test(quizId) && quizId !== "0"){
      actions.push("Enter a valid number for the id")
    }

    if (actions.length === 0){
      this.getRounds(quizId)
    }else{
      let actionStr = '';
      for (let i=0; i<actions.length; i++){
        actionStr += `\n- ${actions[i]}`
      }
      alert(`You need to complete the following action(s):${actionStr}`)
    }
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  getRounds(quizID){
    let quizInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token')})
    }


    let quizRequest = new Request((`http://127.0.0.1:5000/round/${quizID}`), quizInit);
    const quizPromise = fetch(quizRequest);

    quizPromise
      .then((response) => response.json())
      .then((data ) => {
        if (data['authorised']){
        let rounds = data['rounds'];
        this.rounds = rounds;
        console.log(this.rounds)
        this.setState( {data: true} )
        } else{
          alert('Please Log In')
        }
      })
  }

  render(){
    if (!this.state.data){
      return (this.content)
    } else{
      return (<QuestionPage rounds={this.rounds}/>)
    }
  }
}

export { JoinPage }
