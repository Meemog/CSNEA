import React from 'react'
import { Link } from 'react-router-dom'

class CreateOrPlay extends React.Component {
  constructor(props) {
    super(props);
    this.content = (
      <div className="chooseMode">
        <h1>Play</h1>
        <span>
          <p>Choose whether you would like to create a quiz, or join one</p>
        </span>
        <span>
          <button><Link to="/createQuiz">Create Quiz</Link></button>
          <button><Link to="/joinQuiz">Join Quiz</Link></button>
        </span>
      </div>
    );
  }

  goToCreate() {

  }

    render(){
      return this.content
    }
}

export { CreateOrPlay }
