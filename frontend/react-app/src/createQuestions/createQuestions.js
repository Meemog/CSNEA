import React from 'react';

class QuestionForm extends React.Component {
  constructor(props) {
    super(props);
    this.addToAnswers= this.addToAnswers.bind(this);
    this.removeItemFromObject = this.removeItemFromObject.bind(this);
    this.answerFields = {}
    this.nextID = 0;
  }

  addToAnswers(){
    this.answerFields[this.nextID] = (this.generateAnswerField(this.nextID))
    this.nextID += 1;
    this.setState( { state: this.state } )
  }

  generateAnswerField(index) {
    const answerField =
      <label key={index}>
        <span >
          <p>Enter an answer: </p>
          <input type="text" id={("textInput" + index.toString())} />
          <input type="button" value="Remove" id={("removeButton" + index.toString())} onClick={() => {this.removeItemFromObject(index)}} />
        </span>
      </label>
    return answerField
  }

  removeItemFromObject(key){
    delete this.answerFields[key]
    this.setState( { state: this.state } )
  }

  turnObjectToArray(obj){
    const arrToReturn = []

    for (const [key, value] of Object.entries(obj)){
      arrToReturn.push(value)
    }

    return arrToReturn;
  }

  render(){
    return (
      <div>
        <h1>Create Question</h1>
        <span>
          <p>Enter the Question:</p>
          <input id='QuestionText' type='text' />
        </span>
        <span>
          {this.turnObjectToArray(this.answerFields)}
        </span>
        <br />
        <span>
          <input type="button" value="Add Answer" onClick={() => {this.addToAnswers()}}/>
        </span>
        <span>
          <p>Multiple Choice? </p>
          <input type="checkbox" id="miltiChoiceBox" />
        </span>
        <br />
        <span>
          <input type="button" value="Submit" onClick={() => {alert("hello")}} />
        </span>
      </div>
    )
  }

}

export { QuestionForm }
