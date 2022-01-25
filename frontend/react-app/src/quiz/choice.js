import React from 'react'

class CreateOrPlay extends React.Component {
  constructor(props) {
    super(props);
    this.content = (
      <div className="chooseMode">
        <h1>Play</h1>
        <span>
          <p>Choose wether you would like to create a quiz, or join one</p>
        </span>
        <span>
          <input type="button" href="/playQuiz" value="Create Quiz" />
          <input type="button" href="/" value="Join Quiz" />
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
