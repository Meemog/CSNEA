import React from 'react'
import { RoundManager } from '../playQuiz/roundManager.js'

class JoinLobby extends React.Component {
  constructor(props){
    super(props)
    clearInterval()
    this.sessionCode = "Pending...";
    this.sessionId = props.sessionId;
    this.usernames = []
    this.titleText = "Looking for players"
    this.isActive = true;
    //setup session
    this.getCode()
    this.searchingDots()
    this.lookForPlayers()
    //start looking for players
    //this.searchInterval();
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  getCode(){
    let codeInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify({'token': this.getCookie('token'), "sessionId": this.sessionId})
    }

    let codeRequest = new Request(("http://127.0.0.1:5000/getSessionCode"), codeInit);
    const codePromise = fetch(codeRequest);

    codePromise
      .then((response) => response.json())
      .then((data) => {
        this.sessionCode = data['code']
      })
  }


  searchingDots(){
    let dots = ""
    setInterval(() => {
      dots += ".";
      if (dots.length > 3){
        dots = ""
      }
      this.titleText = "Looking for players" + dots;
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
          if (data['StartTime']){
            const currentDate = new Date();
            const timestamp = currentDate.getTime()/1000;
            console.log(timestamp)
            console.log(data['StartTime'])
            const timeToStart = data['StartTime'] - timestamp

            console.log(`Game starts in: ${timeToStart}`)
            this.wait(timeToStart - 5)
          }
          let usernames = data['Usernames']
          this.usernames = []
          for (let i=0; i < usernames.length; i++){
            this.usernames.push(<p>{usernames[i]}</p>)
          }
        })
    }, 5000)
  }

  clearAllIntervals(){
    const interval_id = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
  }

  wait(waitTime){
    this.clearAllIntervals()
    this.titleText = "Starting Soon"
    this.setState( { state: this.state } )
    setTimeout(() => {this.countdown()}, Math.floor(waitTime * 1000))
  }

  countdown(){
    let numTimes = 5
    let loop = setInterval(() => {
      console.log(numTimes);
      this.titleText = `Starting in: ${numTimes}`
      this.setState( { state: this.state } )
      numTimes -= 1;
      if (numTimes === -1){
        window.clearInterval(loop)
        this.content = <RoundManager SessionId={this.sessionId} />
        this.isActive = false;
        this.setState( { state: this.state } )
      }
    }, 1000)
  }

  render(){
    if (this.isActive){
      this.content = (
      <div>
        <h1>{this.titleText}</h1>
        <span>
          <h2>Players:</h2>
          <div>
            {this.usernames}
          </div>
        </span>
        <span>
          <h2>Code:</h2>
          <p>{this.sessionCode}</p>
        </span>
      </div>
    )}

    return this.content
  }
}

export { JoinLobby }
