import os
import json

from flask import(
        Flask, jsonify, request, abort, json
        )

from markupsafe import escape
import random

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
    db.init_app(app)

    @app.route('/testData', methods=['GET'])  #routes /testData GET requests to this function
    def testData():
        if request.method == 'GET':
            return jsonify({'name':'bob', 'password':'qwertyuiop'})

    @app.route('/users', methods=['GET'])
    def users():
        if request.method == 'GET':
            database = db.get_db()

            userCommand = 'SELECT * FROM User'
            users = database.execute(userCommand).fetchall()
            print(f"Executed command: {userCommand}")
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


    @app.route('/questions/<roundid>', methods=['GET', 'POST'])
    def quizQuestions(roundid):
        if request.method == 'GET':
            try:
                int(roundid)
            except:
                abort(404)
            database = db.get_db()

            command = "SELECT Question.ID, Question.QuestionText, Question.MultipleChoice, Question.AuthorID FROM QuestionInRound INNER JOIN Question ON Question.ID=QuestionInRound.QuestionID WHERE RoundID=" + roundid + ";"
            questions = database.execute(command).fetchall()
            print(f"Executed command: {command}")
            questionDict = {}
            count = 0

            for row in questions:
                questionID = row[0]
                text = row[1]
                multiChoiceBool = row[2]
                authorID = row[3]
                authorCommand = "SELECT Username FROM User WHERE ID=" + str(authorID) + ";"
                author = database.execute(authorCommand).fetchone()
                print(f"Executed command: {authorCommand}")

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
                    print(f"Executed command: {answerCommand}")
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

        elif request.method == 'POST':
            responseText = {'recieved': 1}
            responseCode = 200
            #get data from request
            question = json.loads(request.data.decode())

            #extract data
            try:
                questionText = question['text']
                answers = question['answers']
                topic = question['topic']
                difficulty = question['difficulty']
                multipleChoice = question['multipleChoice']
            except:
                responseCode = 422
                responseText = 'json in wrong format'

            database = db.get_db()

            #add data to db
            if responseCode == 200:
                values = f"('{questionText}', 0, {topic}, {multipleChoice}, '{difficulty}')"
                query = f"INSERT INTO Question(QuestionText, AuthorID, TopicID, MultipleChoice, Difficulty) VALUES {values};"
                try:
                    database.execute(query)
                    database.commit()
                    print(f"Executed command: {query}")
                except:
                    responseCode = 422
                    responseText = "Couldn't write to the database"

            if responseCode == 200:
                ansQuery = "INSERT INTO Answer(QuestionID, AnswerText, Correct) VALUES "
                idQuery = "SELECT MAX(ID) FROM Question;"
                bigIdCursor = database.execute(idQuery).fetchone()
                print(f"Executed command: {idQuery}")
                for key in answers:
                    text = answers[key]['ansText']
                    correct = answers[key]['correct']
                    ansQuery = ansQuery + f"({bigIdCursor[0]}, '{text}', {correct}),"
                ansQuery = ansQuery[:-1]

                try:
                    database.execute(ansQuery)
                    database.commit()
                    print(f"Executed command: {ansQuery}")
                except:
                    responseCode = 422
                    responseText = "Couldn't write to the database"



            #submit response
            response = jsonify(responseText)
            response.headers.add('Access-Control-Allow-Origin', '*')

            return(response, responseCode)


    @app.route('/checkAnswers/<roundid>', methods=['GET', 'POST'])
    def CheckAnswer(roundid): #expexts json in the response in the form {questionID: answer}
        if request.method == 'POST':
            try:
                int(roundid)
            except:
                abort(404)
            database = db.get_db()


            userAnswers = json.loads(request.data.decode())
            print(userAnswers)

            #gets the correct questions and answers from the round
            command = "SELECT QuestionID FROM QuestionInRound WHERE RoundID=" + str(roundid) + ";"
            rows = database.execute(command).fetchall()
            print(f"Executed command: {command}")
            toAdd = {}

            for row in rows:
                try: #selects the answers for all the questions in the current round
                    questionID = str(row[0])
                    answerCommand = "SELECT AnswerText FROM Answer WHERE questionID=" + questionID + " AND Correct=1;"
                    correctAnswer = database.execute(answerCommand).fetchone()[0]
                    print(f"Executed command: {answerCommand}")
                    print(questionID)
                    toAdd.update({questionID: {
                        'correctAnswer': correctAnswer,
                        'userAnswer': userAnswers['answers'][questionID],
                        'correct': (correctAnswer == userAnswers['answers'][questionID])
                        }})
                except: #if the questions don't match up, a bad request error is returned
                    response = jsonify({"error": "Unprocessable Entity",
                        "recieved": userAnswers})
                    response.headers.add('Access-Control-Allow-Origin', '*')
                    return(response, 422)

            response = jsonify(toAdd)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return (response, 200) #returns in the form {questionID: {isCorrect, userAnswer, correctAnswer}}

    @app.route('/topics', methods=['GET'])  #routes /topics GET requests to this function
    def topics():
        if request.method == 'GET':
            database = db.get_db()

            try:
                topics = {}
                topicCommand = "SELECT ID, TopicName FROM Topic"
                topicObject = database.execute(topicCommand).fetchall()
                print(f"Executed command: {topicCommand}")

                count = 0
                for item in topicObject:
                    topics.update({count: {
                        'id': item[0],
                        'name': item[1]}
                        })
                    count += 1

                response = jsonify(topics)
                response.headers.add('Access-Control-Allow-Origin', '*')
                return (response, 200)
            except:
                return ('error', 500)


         # structure of json bring recieved

         # 'quizParams': {
         #   'topics': array of intagers for topics,
         #   'numQuestions': integer for the number of questions,
         #   'difficulty': string for the difficulty

    @app.route('/createQuiz', methods=['POST'])
    def createQuiz():
        params = json.loads(request.data.decode())
        response = 'OK'
        responseCode = 200

        # create a quiz entry with:
        #   the ID of the user that generated it
        #   the number of questions in each round
        #   and the difficulty

        try:
            quizParams = params['quizParams']

            author = 0 #PLACEHOLDER
            numQuestions = quizParams['numQuestions']
            difficulty = quizParams['difficulty']

        except:
            responseCode = 422
            response = "Couldn't unpack data"

        dificulties = ['Easy', 'Medium', 'Hard']
        if (difficulty not in dificulties):
            responseCode = 400
            response = "difficulty not valid"

        if responseCode == 200:
            try:
                database = db.get_db()
                query = f"INSERT INTO Quiz(Generator, NumQuestions, Difficulty) VALUES ({author}, {numQuestions}, '{difficulty}');"

                test = database.execute(query).fetchall()
                print(f"Executed command: {query}")
                print(test)
                database.commit()
            except Exception as e:
                print(e)
                responseCode = 500
                response = "Server error"


        #create a round for each topic
        if responseCode == 200:
            try:
                topics = quizParams['topics']
                allQuestions = []
                for topic in topics:
                    query = f"SELECT * FROM Question WHERE TopicID={topic};"
                    questions = database.execute(query).fetchall()
                    allQuestions.append([questions, topic])

                idQuery = "SELECT MAX(ID) FROM Quiz;"
                quizCursor = database.execute(idQuery).fetchone()
                quizId = quizCursor[0]
                print(f"Quiz {quizId}:")

                for i in range(len(allQuestions)): #for each potential round
                    print(f"Processing round {i+1}:")

                    #create round
                    roundQuery = f"INSERT INTO Round(TopicID, QuizID, StartDT) VALUES ({allQuestions[i][1]}, {quizId}, null);"
                    database.execute(roundQuery)
                    database.commit()
                    print(f"  Executed command: {roundQuery}")

                    roundIdQuery = "SELECT MAX(ID) FROM Round;"
                    roundId = database.execute(roundIdQuery).fetchone()[0]
                    print(f"  Executed command: {roundIdQuery}")
                    print(f"  Round ID: {roundId}")

                    #add questions to round
                    sample = random.sample(range(len(allQuestions[0][0])), int(numQuestions))
                    questions = []
                    for item in sample:
                        questions.append(allQuestions[i][0][item][0])

                    print(f"  Question IDs: {questions}")

                    for item in questions:
                        query = f"INSERT INTO QuestionInRound VALUES ({item}, {roundId});"
                        database.execute(query)
                        database.commit()
                        print(f"Executed command: {query}")

                response = {
                        'code': 200,
                        'message': 'OK',
                        'quizId': quizId
                        }

            except:
                response = "Server error"
                responseCode = 500


        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return (response, responseCode)

    @app.route('/round/<quizID>', methods=['GET'])
    def getQuestions(quizID):
        responseCode = 200
        response = {'response': 'OK'}

        rounds = []
        roundQuery = f"SELECT ID FROM round WHERE QuizID={quizID}"

        database = db.get_db()

        roundCursor = database.execute(roundQuery).fetchall()

        for item in roundCursor:
            rounds.append(item[0])

        roundDict = {'rounds': rounds}
        response = jsonify(roundDict)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return (response, responseCode)


    return app
