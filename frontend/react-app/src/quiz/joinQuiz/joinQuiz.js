import React from 'react'

class Questions extends React.Component {
  constructor(props) {
    super(props)

    this.roundId = this.props.roundId;
  }

  render(){
    return(
      <div>
        <p>Round ID: </p>
        {this.roundId}
      </div>
    )
  }

}

class JoinPage extends React.Component {
  constructor(props) {
    super(props);
    this.rounds = []
    this.state = {
      data: false
    }
    this.content = (
      <div>
        <h1>Join Quiz</h1>
        <span>
          <p>Enter Quiz ID</p>
          <input id="quizid" />
          <input type="button" value="Submit" onClick={() => {this.submit()}}/>
        </span>
      </div>
    )
  }

  submit(){
    let quizId = document.getElementById("quizid").value;
    let actions = []

    if (!/^([1-9][0-9]*)$/.test(quizId)){
      actions.push("Enter a valid number for the id")
    }

    if (actions.length === 0){
      alert('Success');
      this.getRounds(0)
    }else{
      let actionStr = '';
      for (let i=0; i<actions.length; i++){
        actionStr += `\n- ${actions[i]}`
      }
      alert(`You need to complete the following action(s):${actionStr}`)
    }
  }

  getRounds(quizID){
    let quizInit = { method: 'GET',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      mode: 'cors',
    }

    let quizRequest = new Request((`http://127.0.0.1:5000/round/${quizID}`), quizInit);
    const quizPromise = fetch(quizRequest);

    quizPromise
      .then((response) => response.json())
      .then((data ) => {
        let rounds = data['rounds'];
        this.rounds = rounds;
        this.setState( {data: true} )
      })
  }

  render(){
    return (this.content)
  }
}

export { JoinPage }
