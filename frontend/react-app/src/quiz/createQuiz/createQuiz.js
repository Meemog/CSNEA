import React from 'react'

class CreateQuizPage extends React.Component {
  constructor(props) {
    super(props);

    this.topicDict = {};
    this.getTopics();
    this.nextID = 1;
    this.addToTopics = this.addToTopics.bind(this);
    this.topicIDdict = {};
  }

  turnObjectToArray(obj){
    const arrToReturn = []

    for (const [key, value] of Object.entries(obj)){
      arrToReturn.push(value)
    }

    return arrToReturn;
  }

  removeItemFromObject(key){
    delete this.topicDict[key]
    this.setState( { state: this.state } )
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
          this.topicIDdict[value['id']] = value['name']
        }
        this.topics = options
        this.topicDict[0] =
          (
            <label key="0">
              <select name="topic0" id="topic0">
                {this.topics}
              </select>
            </label>
          )
        this.setState( { state: this.state } )
      });
  }

  addToTopics(){
    this.topicDict[this.nextID] = (this.generateTopicInput(this.nextID))
    this.nextID += 1;
    this.setState( { state: this.state } )
  }

  generateTopicInput(id){
    return(
      <label key={id.toString()}>
        <select name={"topic" + id.toString()} id={"topic" + id.toString()}>
          {this.topics}
        </select>
        <input type="button" value="Remove" onClick={() => {this.removeItemFromObject(id)}} />
      </label>
    )
  }

  getTopicsFromDoc(){
    let topics = [];
    let valid = true;
    for (const [key] of Object.keys(this.topicDict)){
      let toAdd = document.getElementById("topic" + key).value
      if (toAdd === "-1"){
        valid = false;
      }
      topics.push(toAdd);
    }
    if (valid){
      return topics
    }else{
      return false
    }
  }

  getData(){
    let actions = []

    let topics = this.getTopicsFromDoc()
    if (!topics){
      actions.push("Choose a topic")
    }

    let numQuestions = document.getElementById("numQuestions").value
    if (!/^([1-9][0-9]*)$/.test(numQuestions)){
      actions.push("Enter a valid number for the amount of questions")
    }

    let difficulty = document.getElementById("difficulty").value
    if (difficulty === "-1"){
      actions.push("Enter a difficulty")
    }

    if (actions.length > 0){
      return [actions, false]
    }else{
      return [[topics, numQuestions, difficulty], true]
    }
  }

  submit(){
    let data = this.getData();
    console.log(data);
    if (data[1]){
      let topics = data[0][0]
      let numQuestions = data[0][1]
      let difficulty = data[0][2]
      let topicString = ''
      for (let i=0; i <topics.length; i++){
        topicString += (this.topicIDdict[topics[i]] + ', ');
      }
      topicString= topicString.substring(0, topicString.length-2);

      let choice = prompt(`is this what you want to submit\nTopic(s): ${topicString}\nNumber of Questions: ${numQuestions}\nDifficulty: ${difficulty}\n(Y)es or (N)o`)

      if (choice === 'Y') {
        let params = {
          'quizParams': {
            'topics': topics,
            'numQuestions': numQuestions,
            'difficulty': difficulty
          }
        };
         this.postParams(params);
      }
    }else{
      let actions = data[0]
      let toAlert = 'There are some problems with this question.\nPlease complete the following actions:\n\n';
      for (let i=0; i < actions.length; i++){
        toAlert = toAlert + '- ' + actions[i]+ '\n';
      }
      alert(toAlert);
    }
  }

  postParams(params){
    let quizInit = { method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
        },
      cache: 'default',
      mode: 'cors',
      body: JSON.stringify(params)
    }

    let quizRequest = new Request(("http://127.0.0.1:5000/createQuiz"), quizInit);
    const quizPromise = fetch(quizRequest);

    quizPromise
      .then(response => response.json())
      .then(response => {
        console.log(response)
        if (response['code'] === 200){
          alert(`Quiz parameters succesfully submitted\nQuizID: ${response.quizId}`);
          window.location.reload(false);
        }else{
          alert(`There was an error in submission\nResponse Code: ${response.status}`);
        }
      })
    return
  }

  render(){
    return (
      <div className="form">
        <h1>Create Quiz</h1>
        <span>
          <p>Topics:</p>
          {this.turnObjectToArray(this.topicDict)}
        </span>
        <span>
          <input type="button" value="Add Round" onClick={() => {this.addToTopics()}}/>
        </span>
        <span>
          <p>Number of Questions per round:</p>
          <input size="2" id="numQuestions" />
        </span>
        <span >
          <p>Difficulty:</p>
          <select name="difficulty" id="difficulty">
            <option value="-1">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </span>
        <span>
          <input type="button" value="Submit" onClick={() => {this.submit()}} />
        </span>
      </div>
    )
  }
}

export { CreateQuizPage }
