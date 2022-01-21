import React from 'react';
//TODO: add SweetAlert

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
    let answers = [];
    let valid = true;
    for (const [key] of Object.keys(this.answerFields)){
      let toAdd = document.getElementById("textInput" + key).value
      if (!toAdd){
        valid = false;
      }
      answers.push(toAdd);
    }
    if (valid){
      return answers
    }else{
      return false
    }
  }

  getData() {
    let actions = []
    let questionText = document.getElementById('QuestionText').value;
    if (!questionText){
      actions.push('Write the question')
    }
    let answers = this.getDataFromAnswerFields();
    if (!answers){
      actions.push('Enter an answer')
    }
    let topic = document.getElementById('topic').value;
    if (topic === '-1'){
      actions.push('Choose a topic')
    }
    let difficulty = document.getElementById('difficulty').value;
    if (difficulty === '-1'){
      actions.push('Choose a difficulty')
    }
    let multipleChoice = ((Object.keys(this.answerFields).length > 1) ? true : false)
    if (actions.length > 0){
      return [actions, false];
    }else{
      return [[questionText, answers, topic, difficulty, multipleChoice], true];
    }
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
          options.push(<option value={value['id']}>{value['name']}</option>);
        }
        this.topics = options
        this.setState( { state: this.state } )
      });
  }
  submit(){
    let data = this.getData(); //data is an array of: [questionText, answers, topic, difficulty, multipleChoice]
    if (data[1]){
      //if the data is valid format the data and send to the API
      let questionText = data[0][0];
      let answers = data[0][1];
      let topic = data[0][2];
      let difficulty = data[0][3];
      let multipleChoice = data[0][4];

      let ansString = ''
      for (let i=0; i < answers.length; i++){
        ansString += (answers[i] + ', ');
      }
      ansString =ansString.substring(0, ansString.length-2);

      let willWont = (multipleChoice ? "will":"Won't")

      let choice = prompt(`Is this what you want to submit?\nText: ${questionText}\nAnswers: ${ansString}\nTopic: ${topic}\nDifficulty: ${difficulty}\nThis question ${willWont} be multiple choice because of the number of answers\n(Y)es or (N)o`);

      if (choice === 'Y'){
        //creates dictionary of answers
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

        //Submiting to the API

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
          .then((response) => response.status)
          .then(status => {
            if (status === 200){
              alert("Question succesfully submitted");
            }else{
              alert(`There was an error in submission\nResponse Code: ${status}`);
            }
          })
      }
    }else{
      //or log all problems
      let actions = data[0]
      let toAlert = 'There are some problems with this question.\nPlease complete the following actions:\n\n';
      for (let i=0; i < actions.length; i++){
        toAlert = toAlert + '- ' + actions[i]+ '\n';
      }
      alert(toAlert);
    }

  }

  render(){
    return (
      <div>
        <h1>Create Question</h1>
        <span className="col-sm-4">
          <p>Enter the Question:</p>
          <input id='QuestionText' type='text' />
        </span>
        <span>
          {this.turnObjectToArray(this.answerFields)}
        </span>
        <span>
            <input type="button" value="Add Answer" onClick={() => {this.addToAnswers()}}/>
          </span>
        <span>
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
        <span>
          <input type="button" value="Submit" onClick={() => {this.submit()}} />
        </span>
      </div>
    )
  }

}

export { QuestionForm }
