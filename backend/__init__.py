import os
import json

from flask import(
        Flask, jsonify, request, abort, json
        )

from markupsafe import escape

testDict = {'answers': {
    0: "6",
    1: "9",
    2: "2"
    }}
    #TODO: Remove this

def create_app(test_config=None): #function that creates the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'quizSite.sqlite'),
    ) #sets config for the app including the database path and the secret key

    if test_config is None: #loads the config if it exists
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path) 
        #tries to make the files needed, but doesn't crash if they already exist
    except OSError:
        pass

    from . import db

    @app.route('/testData', methods=['GET'])  #routes /testData GET requests to this function
    def testData():
        if request.method == 'GET':
            return jsonify({'name':'bob', 'password':'qwertyuiop'})

    @app.route('/users', methods=['GET'])
    def users():
        if request.method == 'GET':
            database = db.get_db()

            users = database.execute('SELECT * FROM User').fetchall()
            userDict = {}
            count = 0
            for row in users:
                userDict.update({
                        count:{
                            'ID':row[0],
                            'username':row[1],
                            'name':row[2],
                            'password':row[3],
                            'email':row[4]
                            }
                        })
                count += 1
            return jsonify(userDict)



    @app.route('/questions/<roundid>', methods=['GET'])
    def quizQuestions(roundid):
        if request.method == 'GET':
            database = db.get_db()

            command = "SELECT Question.ID, Question.QuestionText, Question.MultipleChoice, Question.AuthorID FROM QuestionInRound INNER JOIN Question ON Question.ID=QuestionInRound.QuestionID WHERE RoundID=" + roundid + ";"
            questions = database.execute(command).fetchall()
            questionDict = {}
            count = 0

            for row in questions:
                questionID = row[0]
                text = row[1]
                multiChoiceBool = row[2]
                authorID = row[3]
                authorCommand = "SELECT Username FROM User WHERE ID=" + str(authorID) + ";"
                author = database.execute(authorCommand).fetchone()

                jsonToAdd = {
                        'ID':questionID,
                        'Text':text,
                        'IsMultipleChoice':multiChoiceBool,
                        'Author':author[0]
                    }

                if multiChoiceBool == 1:
                    answerCommand = "SELECT ID, AnswerText FROM Answer WHERE QuestionID=" + str(questionID) + ";"
                    answerDict = {}
                    answers = database.execute(answerCommand).fetchall()
                    count2 = 0
                    for item in answers:
                        answerDict.update({count2:{
                            'ID':item[0],
                            'AnsText':item[1]
                            }
                        })
                        count2 += 1

                    jsonToAdd.update({'answers':answerDict})


                questionDict.update({count:jsonToAdd})
                count += 1
            response = jsonify(questionDict)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

    @app.route('/checkAnswers/<roundid>', methods=['GET', 'POST'])
    def CheckAnswer(roundid): #expexts json in the response in the form {questionID: answer}
        if request.method == 'POST':
            database = db.get_db()


            userAnswers = json.loads(request.data.decode())
            print(userAnswers)

            #gets the correct questions and answers from the round
            command = "SELECT QuestionID FROM QuestionInRound WHERE RoundID=" + str(roundid) + ";"
            rows = database.execute(command).fetchall()
            toAdd = {}

            for row in rows:
                try: #selects the answers for all the questions in the current round
                    questionID = str(row[0])
                    answerCommand = "SELECT AnswerText FROM Answer WHERE questionID=" + questionID + " AND Correct=1;"
                    correctAnswer = database.execute(answerCommand).fetchone()[0]
                    print(questionID)
                    toAdd.update({questionID: {
                        'correctAnswer': correctAnswer,
                        'userAnswer': userAnswers['answers'][questionID],
                        'correct': (correctAnswer == userAnswers['answers'][questionID])
                        }})
                except: #if the questions don't match up, a bad request error is returned
                    response = jsonify({"error": "Bad Request",
                        "expected": testDict,
                        "recieved": userAnswers})
                    response.headers.add('Access-Control-Allow-Origin', '*')
                    return(response, 400)

            response = jsonify(toAdd);
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response #returns in the form {questionID: {isCorrect, userAnswer, correctAnswer}}

    db.init_app(app)

    return app
