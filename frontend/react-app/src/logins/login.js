import sha256 from 'js-sha256';
import React from 'react';
import { Link } from 'react-router-dom'


class LoginPage extends React.Component{
  getData(){
    let actions = []

    let username = document.getElementById('username').value;
    if (!username){
      actions.push('Enter a username');
    }
    let password = document.getElementById('password').value;
    if (!password){
      actions.push('Enter a password');
    }

    if (actions.length === 0){
      return [true, [username, password]]
    }else{
      return [false, actions]
    }
  }

  createActionList(array){
    let actionStr = '';
    for (let i=0; i<array.length; i++){
      actionStr += `\n- ${array[i]}`
    }
    return actionStr
  }

  submit(){
    let data = this.getData()
    if (!data[0]){
      let actionList = this.createActionList(data[1]);
      alert(`Please complete the following actions:\n${actionList}`);
      return
    }
    let hashedPassword = sha256(data[1][1]);

    let toSubmit ={
      'username': data[1][0],
      'password': hashedPassword
    }

    let loginInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify(toSubmit)
    }

    let loginRequest = new Request(("http://127.0.0.1:5000/login"), loginInit);
    const loginPromise = fetch(loginRequest);

    loginPromise
      .then((response) => {
        if (response.status === 200){
          alert("logged in")
          response.json()
            .then((dict) => {
              document.cookie = `token=${dict['sessionToken']};SameSite=Strict;`;
              console.log(document.cookie);
              window.location.href = "http://localhost:3000/"
            })
        } else{
          response.json()
            .then((dict) => {alert(dict['response'])})
        }
      })

  }

  render(){
    return (
      <div className='form'>
        <h1>Login</h1>
        <span>
          <p>Username</p>
          <input id='username'/>
          <p>Password</p>
          <input type='password' id='password'/>
          <p>Don't have an account?</p>
          <Link to='/register'>Register</Link>
        </span>
        <span>
          <input type="Button" defaultValue="Login" onClick={() => {this.submit()}}/>
        </span>
      </div>
    )
  }
}

export { LoginPage }
