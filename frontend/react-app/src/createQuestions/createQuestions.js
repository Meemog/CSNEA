import React from 'react';

class QuestionForm extends React.Component {
  constructor(props) {
    super(props);
    this.addToAnswers = this.addToAnswers.bind(this);
    this.removeItemFromObject = this.removeItemFromObject.bind(this);
    this.answerFields = {0:
      (<label key={0}>
        <span >
          <p>Enter the correct answer: </p>
          <input type="text" id={("textInput0")} />
        </span>
      </label>)
    }
    this.nextID = 1;
    this.getTopics = this.getTopics.bind(this);
    this.topics = [(<option value="-1">Select Topic</option>)]
    this.getDataFromAnswerFields = this.getDataFromAnswerFields.bind(this);
    this.getData = this.getData.bind(this);
    this.submit = this.submit.bind(this);

    this.getTopics()
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
          <p>Enter an incorrect answer: </p>
          <input type="text" id={("textInput" + index.toString())} />
          <input type="button" value="Remove" id={("removeButton" + index.toString())} onClick={() => {this.removeItemFromObject(index)}} />
        </span>
      </label>
    return answerField
  }

  getDataFromAnswerFields() {
    let answers = []
    for (const [key] of Object.keys(this.answerFields)){
      answers.push(document.getElementById("textInput" + key).value)
    }
    return answers
  }

  getData() {
    let questionText = document.getElementById('QuestionText').value;
    let answers = this.getDataFromAnswerFields();
    let topic = document.getElementById('topic').value;
    let difficulty = document.getElementById('difficulty').value;
    let multipleChoice = ((Object.keys(this.answerFields).length > 1) ? true : false)
    return [questionText, answers, topic, difficulty, multipleChoice];
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

  getTopics(){
    let myHeaders = new Headers();
    let topicInit = { method: 'GET',
      headers: myHeaders,
      mode: 'cors',
      cache: 'default'
    };


    let topicRequest = new Request(("http://127.0.0.1:5000/topics"), topicInit);
    const topicPromise = fetch(topicRequest);

    topicPromise
      .then((response) => response.json())
      .then((data) => {
        let options = [(<option value="-1">Select Topic</option>)]
        for (const[key, value] of Object.entries(data)){
          options.push(<option value={value}>{value}</option>);
        }
        this.topics = options
        this.setState( { state: this.state } )
      });
  }
  submit(){
    let data = this.getData(); //data is an array of: [questionText, answers, topic, difficulty, multipleChoice]
    console.log(data);
    let questionText = data[0];
    let answers = data[1];
    let topic = data[2];
    let difficulty = data[3];
    let multipleChoice = data[4];

    let ansDict = {0: {
      'ansText': answers[0],
      'correct': 1
      }
    }
    for (let i = 1; i < answers.length; i++){
      ansDict[i] = {
        'ansText': answers[i],
        'correct': 0}
    }
    /*
      format data in the form
      {questionText: text,
      answers: {
        1: {
          ansText: text,
          correct: boolean
          }
        },
      topic: text,
      difficulty: text
      }
    */
    let toSubmit = {
      'text': questionText,
      'answers': ansDict,
      'topic': topic,
      'difficulty': difficulty,
      'multipleChoice': multipleChoice
    }
    console.log(toSubmit);

    let questionInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify(toSubmit)
    }

    let questionRequest = new Request(("http://127.0.0.1:5000/questions/-1"), questionInit);
    const questionPromise = fetch(questionRequest);

    questionPromise
      .then((response) => response.json())
      .then(data => console.log(data))

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
          <br />
          <select name="topic" id="topic">
            {this.topics}
          </select>
        </span>
        <span>
          <select name='difficulty' id='difficulty'>
            <option value='-1'>Enter Difficulty</option>
            <option value='Easy'>Easy</option>
            <option value='Medium'>Medium</option>
            <option value='Hard'>Hard</option>
          </select>
        </span>
        <br />
        <span>
          <input type="button" value="Submit" onClick={() => {this.submit()}} />
        </span>
      </div>
    )
  }

}

export { QuestionForm }
