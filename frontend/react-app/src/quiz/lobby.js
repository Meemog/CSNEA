import React from 'react'

class Lobby extends React.Component {
  constructor(props){
    super(props)
    clearInterval()
    this.quizID = props.quizId;
    this.sessionCode = "Pending...";
    this.sessionId = null;
    this.usernames = []
    //setup session
    this.searchingDots()
    this.setupSession();
    this.dots = "";
    //start looking for players
    //this.searchInterval();
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  setupSession(){
    let sessionInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify( {'token': this.getCookie('token'), 'quizId': this.quizID} )
    }

    let sessionRequest = new Request(("http://127.0.0.1:5000/createSession"),sessionInit);
    const sessionPromise = fetch(sessionRequest);

    sessionPromise
      .then((response) => response.json())
      .then((data) => {
        console.log(`SessionId: ${data['sessionId']}`);
        this.sessionId = data['sessionId']
        this.sessionCode = data['sessionCode']
        this.setState( { state: this.state } )
        this.lookForPlayers()
      });
  }

  searchingDots(){
    setInterval(() => {
      this.dots += ".";
      if (this.dots.length > 3){
        this.dots = ""
      }
      this.setState( { state: this.state } )
    }, 800)
  }

  lookForPlayers(){
    console.log("Looking for players now")
    let searchInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
    }

    let searchRequest = new Request(("http://127.0.0.1:5000/getMembers"), searchInit);
    const searchPromise = fetch(searchRequest);
    searchPromise
      .then((response) => response.json())
      .then((data) =>{
        let usernames = data['Usernames']
        this.usernames = []
        for (let i=0; i < usernames.length; i++){
          this.usernames.push(<p>{usernames[i]}</p>)
        }
      })
    setInterval(() => {
      console.log("Looking for players now")
      let searchInit = { method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          },
        cache: 'default',
        mode: 'cors',
        body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
      }

      let searchRequest = new Request(("http://127.0.0.1:5000/getMembers"), searchInit);
      const searchPromise = fetch(searchRequest);
      searchPromise
        .then((response) => response.json())
        .then((data) =>{
          let usernames = data['Usernames']
          this.usernames = []
          for (let i=0; i < usernames.length; i++){
            this.usernames.push(<p>{usernames[i]}</p>)
          }
        })
    }, 10000)
  }

  startGame(){
    let startInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
    }

    let startRequest = new Request(("http://127.0.0.1:5000/startGame"), startInit);
    const startPromise = fetch(startRequest);

    startPromise
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
      })

  }

  render(){
    return (
      <div>
        <h1>Looking for players{this.dots}</h1>
        <span>
          <h2>Players:</h2>
          <div>
            {this.usernames}
          </div>
        </span>
        <span>
          <input type='button' value='Start' onClick={()=>{this.startGame()}}/>
        </span>
        <span>
          <h2>Code:</h2>
          <p>{this.sessionCode}</p>
        </span>
      </div>
    )
 }
}

export { Lobby }
