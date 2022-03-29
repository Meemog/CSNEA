import React from 'react';
import { Link } from 'react-router-dom'

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    let loggedIn = this.checkIfLoggedIn();

    if (loggedIn){
      this.username = <p>Invalid Token</p>
    }else{
      this.username = (
        <span>
          <Link to="/login">Login</Link>
        </span>
      )
    }
  }

  checkIfLoggedIn(){
    let token = this.getCookie("token");
    this.getUsername(token);
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  getUsername(token) {
    let myHeaders = new Headers();
    let userInit = { method: 'POST',
      headers: myHeaders,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify({'token': token})
    };


    let userRequest = new Request(("http://127.0.0.1:5000/getUsername"), userInit);
    const userPromise = fetch(userRequest);

    userPromise
      .then((response) => response.json())
      .then((text) => {
        if (text['validToken']){
          this.username = <p>{text['username']}</p>;
        } else{
          this.username = (
            <span>
              <Link to="/login">Login</Link>
            </span>
          )
        }
        this.setState( { state: this.state } )
        })
  }

  render() {
    return (
      <nav className="topnav">
        <ul>
          <span>
            <Link to="/">Home</Link>
          </span>
          <span>
            <Link to="/choice">Play</Link>
          </span>
          <span>
            <Link to="/createQuestion">Create Question</Link>
          </span>
          {this.username}
        </ul>
      </nav>
    )
  }
}

export { NavBar };
