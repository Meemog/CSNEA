import React from 'react'
import {JoinLobby} from './joinLobby.js'

class JoinForm extends React.Component {
  constructor(){
    super()
    this.content = (
      <div>
        <h1>Enter Code:</h1>
        <span>
          <input id="Code" style={{textTransform:'uppercase'}}/>
          <input type="Button" value="Submit" readOnly onClick={() => {this.submit()}} />
        </span>
      </div>
    )
  }

  getData(){
    let lobbyCode = document.getElementById("Code").value;

    if (!/^([A-Za-z]{8})$/.test(lobbyCode)){
      return([0, "Enter an 8 letter code"])
    }else{
      return[1, lobbyCode]
    }
  }

  submit(){
    let code = this.getData()

    if (code[0]){
      code = code[1]

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
            if (data['sessionId']){
              this.content = <JoinLobby sessionId={data['sessionId']} />
              this.setState( { state: this.state } )
            }else{
              alert("Incorrect code")
            }
          }else{
            alert("Please log in");
          }
        }
        )
    }else{
      alert(`Please complete the following action(s):\n${code[1]}`);
    }
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
