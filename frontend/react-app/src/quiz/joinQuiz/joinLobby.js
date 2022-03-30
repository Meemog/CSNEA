import React from 'react'

class JoinLobby extends React.Component {
  constructor(props){
    super(props)
    clearInterval()
    this.sessionCode = "Pending...";
    this.sessionId = props.sessionId;
    this.usernames = []
    //setup session
    this.searchingDots()
    this.dots = "";
    this.lookForPlayers()
    //start looking for players
    //this.searchInterval();
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
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
          <h2>Code:</h2>
          <p>{this.sessionCode}</p>
        </span>
      </div>
    )
 }
}

export { JoinLobby }
