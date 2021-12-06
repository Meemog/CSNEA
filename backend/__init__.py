import os

from flask import(
        Flask, jsonify, request, abort
        )

from markupsafe import escape

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

    @app.route('/testData', methods=['GET']) 
    #routes /testData GET requests to this function
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

    @app.route('/questions/<roundid>')
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
            return jsonify(questionDict)

    @app.route('/checkAnswers/<roundid>')
    def CheckAnswer(roundid): #expexts json in the response in the form {questionID: answer}
        if request.method == 'GET':
            #TODO this needs to take in a series of answers and mark all of them
            # QuestionID needs to be gotten from the round table, not the request
            database = db.get_db()

            userAnswers = request.get_json()

            command = "SELECT Question.ID FROM QuestionInRound WHERE RoundID=" + str(roundid) + ";"
            rows = database.execute(command).fetchall()
            for row in rows:
                questionID = row[0]
                answerCommand = "SELECT AnswerText FROM Answers WHERE ID=" + quesitonID + " AND Correct=1;"

            return jsonify({"correct": correct}) #should return in the form {questionID: isCorrect}

    db.init_app(app)

    return app
