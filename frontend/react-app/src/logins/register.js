import sha256 from 'js-sha256';
import React from 'react';
import { Link } from 'react-router-dom';

class RegisterPage extends React.Component{
  getData(){
    let actions = []

    let username = document.getElementById('username').value;
    if (!username){
      actions.push('Enter a username');
    }

    let email = document.getElementById('email').value;
    if (!email){
      actions.push('Enter an email address');
    }

    let name = document.getElementById('name').value;
    if (!name){
      actions.push('Enter a name');
    }

    let password = document.getElementById('password').value;
    if (!password){
      actions.push('Enter a password');
    }

    let confPassword = document.getElementById('confPassword').value;
    if (!confPassword){
      actions.push('Confirm your password');
    }

    if (!(password === confPassword)){
      actions.push('Passwords do not match. Please check that they are the same')
    }

    if (actions.length === 0){
      return [true, [username, name, email, password]]
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

    let passwordHash = sha256(data[1][3]);

    let toSubmit = {
      'username': data[1][0],
      'name': data[1][1],
      'email': data[1][2],
      'password': passwordHash
    }

    let registerInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify(toSubmit)
    }

    let registerRequest = new Request(("http://127.0.0.1:5000/register"), registerInit);
    const registerPromise = fetch(registerRequest);

    registerPromise
      .then((response) => {
        if (response.status === 200){
          alert("registered")
        } else{
          response.json()
            .then((dict) => {alert(dict['response'])})
        }
      })
  }


  render(){
    return (
      <div className='form'>
        <h1>Register</h1>
        <span>
          <p>Username</p>
          <input id='username'/>
          <p>Email address</p>
          <input id='email'/>
          <p>Name</p>
          <input id='name'/>
          <p>Password</p>
          <input type='password' id='password'/>
          <p>Confirm Password</p>
          <input type='password' id='confPassword'/>
          <p>Already have an account?</p>
          <Link to='/login'>Login</Link>
        </span>
        <span>
          <input type="Button" defaultValue="Register" onClick={() => {this.submit()}}/>
        </span>
      </div>
    )
  }
}

export { RegisterPage }
