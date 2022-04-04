import React from 'react'

class RoundManager extends React.Component {
  constructor(props){
    super(props)
    this.sessionId = props['SessionId']
  }


  getNextRound(){
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
      .then((data) => console.log(data))
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  render(){
    return (
      <div>
        <h1>Quiz for session with id: {this.sessionId}</h1>
        <span>
          <input type="button" value="Get Next Round" onClick={() => {this.getNextRound()}}/>
        </span>
      </div>
    )
  }
}

export { RoundManager }
