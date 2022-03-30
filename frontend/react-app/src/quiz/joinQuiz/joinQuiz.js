import React from 'react'
import {JoinLobby} from './joinLobby.js'

class JoinForm extends React.Component {
  constructor(){
    super()
    this.content = (
      <div>
        <h1>Enter Code:</h1>
        <input id="Code" style={{textTransform:'uppercase'}}/>
        <input type="Button" value="Submit" readOnly onClick={() => {this.submit()}} />
      </div>
    )
  }


  submit(){
    let code = document.getElementById("Code").value;
    console.log(`Submitted ${code}`);

    let quizInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token'), 'code': code})
    }


    let quizRequest = new Request((`http://127.0.0.1:5000/joinSession`), quizInit);
    const quizPromise = fetch(quizRequest);

    quizPromise
      .then((response) => response.json())
      .then((data) => {
        if (data['authorised']){
          this.content = <JoinLobby sessionId={data['sessionId']} />
          this.setState( { state: this.state } )
        }else{
          alert("Please log in");
        }
      }
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

export { JoinForm }
