import React from 'react'
import { Link } from 'react-router-dom'

class CreateOrPlay extends React.Component {
  constructor(props) {
    super(props);
    this.clearAllIntervals()
    this.content = (
      <div className="chooseMode">
        <h1>Play</h1>
        <span>
          <p>Choose whether you would like to create a quiz, or join one</p>
        </span>
        <span>
          <button><Link to="/createQuiz">Create Quiz</Link></button>
          <button><Link to="/joinQuiz">Join Quiz</Link></button>
          <button><Link to="/createSession">Create Session</Link></button>
        </span>
      </div>
    );
  }

  clearAllIntervals(){
    const interval_id = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
  }

  goToCreate() {

  }

    render(){
      return this.content
    }
}

export { CreateOrPlay }
