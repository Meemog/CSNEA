import React from 'react'
import { Lobby } from './lobby.js'

class QuizSession extends React.Component {

  constructor(props){
    super(props);
    this.content = (
      <div>
        <h1>Create Session</h1>
        <span>
          <p>QuizID</p>
          <input id='QuizID'/>
        </span>
        <span>
          <input type='button' value='submit' onClick={() => {this.submit()}}/>
        </span>
      </div>
    )
  }

  getData(){
    let actions = []

    let quizId = document.getElementById("QuizID").value
    if (!/^([0-9]+)$/.test(quizId)){
      actions.push("Enter a valid ID")
    }

    if (actions.length > 0){
      return [actions, false]
    }else{
      return [quizId, true]
    }
  }

  submit(){
    let data = this.getData();
    if (data[1]){
      console.log("session has quizID:" + data[0])
      this.goToLobby(data[0])
    }else{
      let toAlert = "you need to complete the following actions:\n";
      toAlert += data[0];
      alert(toAlert);
    }
  }

  goToLobby(id){
    let usernameInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token')})
    }

    let usernameRequest = new Request(("http://127.0.0.1:5000/getUsername"), usernameInit);
    const usernamePromise = fetch(usernameRequest);

    usernamePromise
      .then((response) => response.json())
      .then((data) => {
        if (data['validToken']){
          this.content = <Lobby quizId={id} />
          this.setState( { state: this.state } )
        }else{
          alert("Please log in");
        }
      })
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

export {QuizSession}
