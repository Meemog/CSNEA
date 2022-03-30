import React from 'react'

class JoinForm extends React.Component {

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
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(` ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  render(){
    return (
      <div>
        <h1>Enter Code:</h1>
        <input id="Code" style={{textTransform:'uppercase'}}/>
        <input type="Button" value="Submit" readOnly onClick={() => {this.submit()}} />
      </div>
    )
  }
}

export { JoinForm }
