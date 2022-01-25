import React from 'react'

class CreateQuizPage extends React.Component {
  constructor(props) {
    super(props);
    this.content = (
      <div>
        <h1>Create Quiz</h1>
        <p>Hello this is the page where you create the quiz</p>
      </div>
    );
  }

    render(){
      return this.content
    }
}

export { CreateQuizPage }
