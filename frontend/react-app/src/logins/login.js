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

    console.log(username);
    console.log(password);

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
          <input type="Button" value="Submit" onClick={() => {this.submit()}}/>
        </span>
      </div>
    )
  }
}

export { LoginPage }
