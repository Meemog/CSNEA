import os
import json
import random
import string
import time

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

    #Actual API starts here

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
            questionDict = {'authorised': 1}
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


                questionDict.update({str(count):jsonToAdd})
                count += 1
            response = questionDict

            response = jsonify(response)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

        elif request.method == 'POST':
            responseText = {'recieved': 1}
            responseCode = 200
            #get data from request
            question = json.loads(request.data.decode())

            try:
                token = question['token']
            except:
                token = ''

            database = db.get_db()

            #verify identity
            sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
            user = database.execute(sessionQuery).fetchone()
            print(f"Executed command: {sessionQuery}")

            if user == None:
                print("User not authorized")
                responseText = "Not logged in"
                responseCode = 401


            if responseCode == 200:
                print(f"User authorised: {user}")
                #extract data
                try:
                    questionText = question['text']
                    answers = question['answers']
                    topic = question['topic']
                    difficulty = question['difficulty']
                    multipleChoice = question['multipleChoice']
                except:
                    responseCode = 422
                    responseText = "json in wrong format"


            #add data to db
            if responseCode == 200:
                user = user[0]
                values = f"('{questionText}', {user}, {topic}, {multipleChoice}, '{difficulty}')"
                query = f"INSERT INTO Question(QuestionText, AuthorID, TopicID, MultipleChoice, Difficulty) VALUES {values};"
                print(f"Executed command: {query}")
                try:
                    database.execute(query)
                    print(f"Executed command: {query}")
                    database.commit()
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
                    print(f"Executed command: {ansQuery}")
                    database.commit()
                    print(f"Executed command: {ansQuery}")
                except:
                    responseCode = 422
                    responseText = "Couldn't write to the database"



            #submit response
            response = jsonify({'response': responseText})
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

            try:
                token = userAnswers['token']
            except:
                token = ''

            #verify identity
            sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
            user = database.execute(sessionQuery).fetchone()[0]
            print(f"Executed command {sessionQuery}")

            if user == None:
                print("User not authorized")
                response = {'authorised': 0}
                responseCode = 401
                return (response, responseCode)

            #gets the correct questions and answers from the round
            command = "SELECT QuestionID FROM QuestionInRound WHERE RoundID=" + str(roundid) + ";"
            rows = database.execute(command).fetchall()
            print(f"Executed command: {command}")
            toAdd = {}

            roundScore = 0

            for row in rows:
                try: #selects the answers for all the questions in the current round
                    questionID = str(row[0])
                    answerCommand = "SELECT AnswerText FROM Answer WHERE questionID=" + questionID + " AND Correct=1;"
                    correctAnswer = database.execute(answerCommand).fetchone()[0]
                    print(f"Executed command: {answerCommand}")
                    correct = (correctAnswer == userAnswers['answers'][questionID])
                    toAdd.update({questionID: {
                        'correctAnswer': correctAnswer,
                        'userAnswer': userAnswers['answers'][questionID],
                        'correct': correct
                        }})
                    if correct:
                        roundScore += 1
                except: #if the questions don't match up, a bad request error is returned
                    response = jsonify({"error": "Unprocessable Entity",
                        "recieved": userAnswers})
                    response.headers.add('Access-Control-Allow-Origin', '*')
                    return(response, 422)

            #submit score to roundSession

            #get QuizSession
            sessionQuery = f"SELECT ID FROM QuizSession WHERE UserID={user} AND QuizID={userAnswers['quizID']};"
            cursor = database.execute(sessionQuery).fetchone()
            print(f"Executed command: {sessionQuery}")
            sessionID = cursor[0]

            #round id stored in roundid

            #TODO: add score to session

            response = toAdd

            response = jsonify(response)
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

            numQuestions = quizParams['numQuestions']
            difficulty = quizParams['difficulty']
            token = quizParams['token']

        except:
            token = ''
            responseCode = 422
            response = "Couldn't unpack data"

        database = db.get_db()

        #verify identity
        sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"Executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = "User not authorized"
            responseCode = 401

        dificulties = ['Easy', 'Medium', 'Hard']
        if (difficulty not in dificulties):
            responseCode = 400
            response = "difficulty not valid"

        author = user[0]

        if responseCode == 200:
            try:
                database = db.get_db()
                query = f"INSERT INTO Quiz(Generator, NumQuestions, Difficulty) VALUES ({author}, {numQuestions}, '{difficulty}');"
                print(f"Executed command: {query}")
                test = database.execute(query).fetchall()
                print(f"Executed command: {query}")
                database.commit()
            except Exception as e:
                print(e)
                responseCode = 500
                response = "Server error"


        #create a round for each topic
        if responseCode == 200:
            topics = quizParams['topics']
            allQuestions = []
            for topic in topics:
                query = f"SELECT * FROM Question WHERE TopicID={topic};"
                questions = database.execute(query).fetchall()
                print(f"Executed command: {query}")
                allQuestions.append([questions, topic])

            idQuery = "SELECT MAX(ID) FROM Quiz;"
            quizCursor = database.execute(idQuery).fetchone()
            print(f"Executed command: {idQuery}")
            quizId = quizCursor[0]
            print(f"Quiz {quizId}:")

            for i in range(len(allQuestions)): #for each potential round
                print(f"Processing round {i+1}:")

                #create round
                roundQuery = f"INSERT INTO Round(TopicID, QuizID, StartDT) VALUES ({allQuestions[i][1]}, {quizId}, null);"
                database.execute(roundQuery)
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
                    print(f"Executed command: {query}")

            database.commit()
            response = {
                    'code': 200,
                    'message': 'OK',
                    'quizId': quizId
                    }


        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return (response, responseCode)

    @app.route('/round/<quizID>', methods=['GET', 'POST'])
    def getQuestions(quizID):
        responseCode = 200
        response = {'response': 'OK'}
        params = json.loads(request.data.decode())

        try:
            token = params['token']
        except:
            token = ''

        database = db.get_db()

        #verify identity
        sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"Executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401

        if responseCode == 200:
            print(f"User authorised: {user[0]}")

            #add user to QuizSession table
            userID = user[0]
            delCommand = f"DELETE FROM QuizSession WHERE UserID={userID} AND QuizID={quizID}"
            database.execute(delCommand)
            print(f"Executed command: {delCommand}")
            database.commit()
            command = f"INSERT INTO QuizSession(UserID, QuizID) VALUES ({userID}, {quizID})"

            database.execute(command)
            print(f"Executed command: {command}")
            database.commit()

            rounds = []
            roundQuery = f"SELECT ID FROM round WHERE QuizID={quizID}"


            roundCursor = database.execute(roundQuery).fetchall()
            print(f"Executed command: {roundQuery}")

            for item in roundCursor:
                rounds.append(item[0])

            roundDict = {'authorised': 1, 'rounds': rounds}
            response = roundDict
        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return (response, responseCode)

    @app.route('/register', methods=['POST'])
    def register():

        params = json.loads(request.data.decode())

        database = db.get_db()

        #check if username exists

        usernameQuery = f"SELECT EXISTS(SELECT 1 FROM User WHERE Username='{params['username']}')"
        testUserId = database.execute(usernameQuery).fetchone()
        print(f"Executed command: {usernameQuery}")

        if (testUserId[0]):
            response = jsonify({'response': 'Username already in use'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return (response, 409)

        registerCommand = f"INSERT INTO User (Username, Name, Password, Email) VALUES('{params['username']}', '{params['name']}', '{params['password']}', '{params['email']}')"

        database.execute(registerCommand)
        print(f"Executed command: {registerCommand}")
        database.commit()

        responseCode = 200
        response = {'response': 'OK'}

        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return(response, responseCode)

    @app.route('/login', methods=['POST'])
    def login():
        params = json.loads(request.data.decode())

        #get user id from username
        idQuery = f"SELECT ID FROM User WHERE Username='{params['username']}'"

        try:
            database = db.get_db()
            id = database.execute(idQuery).fetchone()[0]
            print(f"Executed command: {idQuery}")

        except:
            responseCode = 422
            response = {'response': 'username not found'}
            response = jsonify(response)
            response.headers.add('Access-Control-Allow-Origin', '*')

            return(response, responseCode)


        #check authentication
        passQuery = f"SELECT Password FROM User WHERE ID={id}"

        try:
            password = database.execute(passQuery).fetchone()[0]
            print(f"Executed command: {password}")
        except:
            responseCode = 500
            response = {'response': 'Error checking password'}
            response = jsonify(response)
            response.headers.add('Access-Control-Allow-Origin', '*')

            return(response, responseCode)

        if params['password'] != password:
            responseCode = 422
            response = {'response': 'Incorrect Username or Password'}
            response = jsonify(response)
            response.headers.add('Access-Control-Allow-Origin', '*')

            return(response, responseCode)

        #Delete old session if user is already logged in
        sessionQuery = f"SELECT EXISTS(SELECT 1 FROM userSession WHERE UserID = {id})"
        isLoggedIn = database.execute(sessionQuery).fetchone()[0]
        print(f"Executed command: {sessionQuery}")

        if isLoggedIn:
            delCommand = f"DELETE FROM userSession WHERE UserID={id}"
            database.execute(delCommand)
            print(f"Executed command: {delCommand}")
            database.commit()

        #make session
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))

        sessionCommand = f"INSERT INTO UserSession(Token, UserID, LastUsed) VALUES ('{token}', {id}, {time.time()});"

        database.execute(sessionCommand)
        print(f"Executed command: {sessionCommand}")
        database.commit()


        print(f"User logged in as {params['username']}")

        responseCode = 200
        response = {'response': 'OK', 'sessionToken': token}

        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return(response, responseCode)

    @app.route('/getUsername', methods=['POST'])
    def username():

        params = json.loads(request.data.decode())
        try:
            token = params['token']
        except:
            token = ''
        database = db.get_db()

        command = f"SELECT Username FROM User INNER JOIN UserSession ON User.ID=UserSession.UserID AND UserSession.Token=\"{token}\""
        try:
            username = database.execute(command).fetchone()
            print(f"Executed command: {command}")
            toReturn = { 'validToken': True, 'username':username[0] }
        except:
            toReturn = { 'validToken': False }
        response = jsonify(toReturn)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


    @app.route('/createSession', methods=['POST'])
    def createSession():
        params = json.loads(request.data.decode())

        try:
            token = params['token']
        except:
            token = ''

        database = db.get_db()
        sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"Executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401
        else:
            print(f"User authorised: {user[0]}")

            cont = False
            while not cont:
                #Create Session Code
                sessionCode = ''.join(random.choices(string.ascii_letters.upper(), k=8))

                #Check if code exists
                command = f"SELECT ID FROM QuizSession WHERE SessionCode=\"{sessionCode}\";"

                sessionExists = database.execute(command).fetchone()
                print(f"Executed command: {command}")

                if sessionExists == None:
                    cont = True

            #create session
            command = f"INSERT INTO QuizSession(Creator, QuizID, SessionCode) VALUES ({user[0]}, {params['quizId']}, '{sessionCode}')"
            database.execute(command)
            database.commit()
            print(f"Executed command: {command}")

            #get session id
            idCommand = f"SELECT MAX(ID) FROM QuizSession"
            sessionId = database.execute(idCommand).fetchone()[0]
            print(f"Executed command: {idCommand}")

            response = {
                'sessionId': sessionId,
                'sessionCode': sessionCode}

            #Add author to session
            memberCommand = f"INSERT INTO QuizMember (UserID, SessionID) VALUES ({user[0]}, {sessionId})"
            database.execute(memberCommand)
            database.commit()
            print(f"Executed command: {memberCommand}")

        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    @app.route('/joinSession', methods=['POST'])
    def joinSession():
        params = json.loads(request.data.decode())

        try:
            token = params['token']
            sessionCode = params['code'].upper()
        except:
            token = ''
            sessionCode = ''

        database = db.get_db()
        sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"Executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401
        else:
            print(f"User authorised: {user[0]}")

            #get session id
            sessionCommand = f"SELECT ID FROM QuizSession WHERE SessionCode=\"{sessionCode}\""

            sessionId = database.execute(sessionCommand).fetchone()
            print(f"Executed command: {sessionCommand}")
            if sessionId == None:
                response = {"Response": "Incorrect code"}
            else:
                #add user to session
                memberCommand = f"INSERT INTO QuizMember (UserID, SessionID) VALUES ({user[0]}, {sessionId[0]})"
                database.execute(memberCommand)
                print(f"Executed command: {memberCommand}")
                database.commit()
                response = {"sessionId": sessionId[0], 'authorised': 1}
        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


    @app.route('/getMembers', methods=['POST'])
    def getMebers():
        params = json.loads(request.data.decode())

        try:
            token = params['token']
            sessionId = params['sessionId']
        except:
            token = ''
            sessionId = ''

        database = db.get_db()
        sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"Executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401
        else:
            print(f"User authorised: {user[0]}")

            command = f"SELECT Username FROM User INNER JOIN QuizMember ON QuizMember.UserID=User.ID AND QuizMember.SessionID={sessionId};"
            ids = database.execute(command).fetchall()
            print(f"Executed command: {command}")
            usernameList = []
            for item in ids:
                usernameList.append(item[0])

            response = {"Usernames": usernameList}

        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return response

    return app
