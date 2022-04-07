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

    @app.route('/questions/<roundid>', methods=['POST'])
    def quizQuestions(roundid):
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


    @app.route('/submitAnswers', methods=['GET', 'POST'])
    def CheckAnswer():
        if request.method == 'POST':
            database = db.get_db()
            params = json.loads(request.data.decode())

            token = params['token']
            sessionId = params['sessionId']
            roundSessionId = params['roundSessionId']
            answers = params['answers'] #expects json in the response in the form {questionID: answer}

            #verify identity
            sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
            user = database.execute(sessionQuery).fetchone()[0]
            print(f"Executed command {sessionQuery}")

            if user == None:
                print("User not authorized")
                response = {'authorised': 0}
                responseCode = 401
            else:
                #check that the user is a member of the session
                memberCommand = f"SELECT ID FROM QuizMember WHERE SessionID={sessionId} AND UserID={user[0]}"

                memberId = database.execute(memberCommand).fetchone()

                if memberId != None:
                    validated = True
                else:
                    validated = False

            if validated:
                #check that there isn't already a round response table
                memberId = memberId[0]

                rResponseCommand = f"SELECT ID FROM RoundResponse WHERE QuizMemberID={memberId} AND RoundSessionID={roundSessionId}"
                rResponseId = database.execute(rResponseCommand).fetchone()
                print(f"Executed command: {rResponseCommand}")

                if rResponseId == None:
                    #make round response entry that references the current round
                    createResponseCommand = f"INSERT INTO RoundResponse(QuizMemberID, RoundSessionID, EndDT) VALUES ({memberId}, {roundSessionId}, {time.time()});"

                    print(f"Executed command: {createResponseCommand}")
                    database.execute(createResponseCommand)
                    database.commit()

                    #get ID of created entry
                    rResponseCommand = f"SELECT ID FROM RoundResponse WHERE QuizMemberID={memberId} AND RoundSessionID={roundSessionId}"
                    rResponseId = database.execute(rResponseCommand).fetchone()[0]

                    #get each question in the round

                    questionCommand = f"""
                    SELECT Question.ID FROM Question
                    INNER JOIN QuestionInRound ON QuestionInRound.QuestionID = Question.ID
                    INNER JOIN Round ON Round.ID = QuestionInRound.RoundId
                    INNER JOIN RoundSession ON RoundSession.RoundID = Round.ID
                    WHERE RoundSession.ID = {roundSessionId}
                    ORDER BY Question.ID ASC;"""

                    questionIds = database.execute(questionCommand).fetchall()

                    #for each question:
                        #get correct answer
                        #compare the correct answer to the user's answer
                        #submit each question response to the response table
                        #if there isn't enough responses, the last one should default to an empty string, keeping going if there still isn't enough

                    responseArr = []
                    for i in range(len(questionIds)):
                        questionId = questionIds[i][0]
                        userAnswer = answers[str(i)]
                        correctAnswerCommand = f"""
                            SELECT AnswerText
                            FROM Answer
                            WHERE
                                QuestionID={questionId} AND
                                Correct=1;
                            """

                        correctAnswer = database.execute(correctAnswerCommand).fetchone()[0]
                        correct = correctAnswer == userAnswer

                        userResponseCommand = f"""
                            INSERT INTO Response (Answer, RoundResponseID, QuestionID, Correct)
                            VALUES ("{userAnswer}", {rResponseId}, {questionId}, {correct});
                            """

                        database.execute(userResponseCommand)
                        print(f"Executed command: {userResponseCommand}")
                        database.commit()

                    response = {"ok": 1, "response": "Submitted"}

                    #calculate score
                    #get number of questions
                    questionCommand = f"""
                        SELECT Response.ID
                        FROM Response
                        JOIN RoundResponse ON RoundResponse.ID = Response.RoundResponseID
                        WHERE
                            RoundResponse.QuizMemberId = {memberId}
                        """
                    questionResponses = database.execute(questionCommand).fetchall()
                    numQuestions = len(questionResponses)

                    #get number of questions answered correctly
                    correctCommand = f"""
                        SELECT Response.ID
                        FROM Response
                        JOIN RoundResponse ON RoundResponse.ID = Response.RoundResponseID
                        WHERE
                            RoundResponse.QuizMemberId = {memberId} AND
                            Response.Correct = 1;
                        """
                    correctResponses = database.execute(correctCommand).fetchall()
                    numCorrect = len(correctResponses)
                    #get the time taken (time taken = time submitted - time the round started

                    roundStartCommand = f"""
                        SELECT StartDT
                        FROM RoundSession
                        WHERE ID = {roundSessionId};
                        """
                    endTime = database.execute(roundStartCommand).fetchone()

                    responseTimeCommand = f"""
                        SELECT EndDT
                        FROM RoundResponse
                        WHERE ID = {rResponseId}
                        """
                    responseTimestamp = database.execute(responseTimeCommand).fetchone()[0]

                    timeTaken = responseTimestamp - endTime[0]

                    #absolute score = %correct * (60 * numQuestions - time taken)
                    #relative score = absolute score / highest possible score * 1000

                    absScore = (numCorrect/numQuestions) * (60 * numQuestions - timeTaken)
                    relScore = round((absScore/(60 * numQuestions)) * 1000)

                    if relScore < 0:
                        relScore = 0

                    #set score in RoundResponse
                    scoreCommand = f"""
                        UPDATE RoundResponse
                        SET Score = {relScore}
                        WHERE ID = {rResponseId};
                        """
                    database.execute(scoreCommand)
                    database.commit()

                    #add score to total score

                    tScoreCommand = f"SELECT Score FROM QuizMember WHERE ID={memberId}"
                    totalScore = database.execute(tScoreCommand).fetchone()[0]

                    addScoreCommand = f"UPDATE QuizMember SET Score = {totalScore + relScore} WHERE ID = {memberId}"
                    database.execute(addScoreCommand)
                    database.commit()

                else:
                    response = {"response": "already responded"}

                #check to see if everyone has submitted a response

                #get number of quiz members in the current quiz session
                memberCommand = f"""
                    SELECT QuizMember.ID
                    FROM QuizMember
                    JOIN QuizSession ON QuizMember.SessionID = QuizSession.ID
                    WHERE QuizSession.ID = {sessionId};
                """

                members = database.execute(memberCommand).fetchall()

                numMembers = len(members)

                #get number of responses for this round

                responseCommand = f"""
                    SELECT RoundResponse.ID
                    FROM RoundResponse
                    JOIN RoundSession ON RoundSession.ID = RoundResponse.RoundSessionID
                    WHERE RoundSession.ID = {roundSessionId}
                    """
                responses = database.execute(responseCommand).fetchall()
                print(f"Executed command: {responseCommand}")

                numResponses = len(responses)

                print(numResponses, numMembers)

                if numResponses == numMembers:
                    roundEndCommand = f"""
                        UPDATE RoundSession
                        SET EndDT = {time.time()}
                        WHERE ID={roundSessionId}
                        """
                    database.execute(roundEndCommand)
                    database.commit()

            response = jsonify(response)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return (response, 200)

    @app.route('/checkAnswers', methods=['POST'])
    def checkAnswers():
        if request.method == 'POST':
            database = db.get_db()
            params = json.loads(request.data.decode())

            try:
                token = params['token']
                roundSessionId = params['roundSessionId']
                sessionId = params['sessionId']
            except:
                token = ''
                roundSessionId = ''
                sessionId = ''

            #verify identity
            sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
            user = database.execute(sessionQuery).fetchone()[0]
            print(f"Executed command {sessionQuery}")

            if user == None:
                print("User not authorized")
                response = {'authorised': 0}
            else:
                #check that the user is a member of the session
                memberCommand = f"SELECT ID FROM QuizMember WHERE SessionID={sessionId} AND UserID={user[0]}"

                memberId = database.execute(memberCommand).fetchone()

                if memberId != None:
                    validated = True
                else:
                    validated = False

            if validated:
                #check if the round session has an end time yet
                roundSessionCommand = f"""
                    SELECT EndDT
                    FROM RoundSession
                    WHERE ID={roundSessionId}
                """
                endTime = database.execute(roundSessionCommand).fetchone()
                print(f"Executed command: {roundSessionCommand}")
                #if it does return the user's score
                if endTime[0] != None:
                    #get user's total score
                    totalScoreCommand = f"SELECT Score FROM QuizMember WHERE ID = {memberId[0]};"
                    totalScore = database.execute(totalScoreCommand).fetchone()[0]
                    #get user's round score
                    roundScoreCommand = f"""
                        SELECT Score
                        FROM RoundResponse
                        WHERE RoundSessionID = {roundSessionId} AND
                        QuizMemberID = {memberId[0]};
                    """
                    roundScore = database.execute(roundScoreCommand).fetchone()[0]

                    #get top user's score
                    highScoreCommand = f"SELECT UserID, MAX(Score) FROM QuizMember WHERE SessionID = {sessionId}"
                    highScoreCursor = database.execute(highScoreCommand).fetchone()

                    topUserCommand = f"SELECT Username FROM User WHERE ID={highScoreCursor[0]}"
                    topUser = database.execute(topUserCommand).fetchone()[0]


                    highScore = highScoreCursor[1]


                    response = {"authorised": 1, "ended": 1, "score": roundScore, "topScore": highScore, "topUser": topUser}
                else:
                    response = {"authorised": 1, "ended": 0}
            else:
                response = {"authorised": 0}
        response = jsonify(response)
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response


    @app.route('/checkIfHost', methods=['POST'])
    def checkHost():
        if request.method == 'POST':
            database = db.get_db()
            params = json.loads(request.data.decode())

            try:
                token = params['token']
                sessionId = params['sessionId']
            except:
                token = ''
                sessionId = ''

            #verify identity
            sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
            user = database.execute(sessionQuery).fetchone()[0]
            print(f"Executed command {sessionQuery}")

            if user == None:
                print("User not authorized")
                response = {'authorised': 0, 'creator': 0}
                responseCode = 401
            else:
                #check that the user is the creator of the session
                creatorQuery = f"SELECT Creator FROM QuizSession WHERE ID={sessionId} AND Creator={user[0]}"

                creator = database.execute(creatorQuery).fetchone()
                if creator == None:
                    response = {'authorised': 1, 'creator': 0}
                else:
                    response = {'authorised': 1, 'creator': 1}
            response = jsonify(response)

            response.headers.add("Access-Control-Allow-Origin", "*")

            return response

    @app.route('/startNextRound', methods=['POST'])
    def nextRound(): #Adds a start time to the next round
        if request.method == 'POST':
            database = db.get_db()
            params = json.loads(request.data.decode())

            try:
                token = params['token']
                sessionId = params['sessionId']
            except:
                token = ''
                sessionId = ''

            #verify identity
            sessionQuery = f"SELECT UserID FROM UserSession WHERE Token='{token}';"
            user = database.execute(sessionQuery).fetchone()[0]
            print(f"Executed command {sessionQuery}")

            if user == None:
                print("User not authorized")
                response = {'authorised': 0}
                #check that the user is the creator of the session
                creatorQuery = f"SELECT Creator FROM QuizSession WHERE ID={sessionId} AND Creator={user[0]}"

                creator = database.execute(creatorQuery).fetchone()
                if creator == None:
                    response = {'authorised': 0}
                else:
                    #get next roundSession in QuizSession that doesn't have a start time, and add one
                    pass


        return response

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
                roundQuery = f"INSERT INTO Round(TopicID, QuizID) VALUES ({allQuestions[i][1]}, {quizId});"
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
            memberCommand = f"INSERT INTO QuizMember (UserID, SessionID, Score) VALUES ({user[0]}, {sessionId}, 0)"
            database.execute(memberCommand)
            database.commit()
            print(f"Executed command: {memberCommand}")

            #create round sessions without start times
            #get each round

            roundCommand = f"SELECT ID FROM Round WHERE QuizID = {quizId}"

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
                response = {"authorised": 1, "Response": "Incorrect code"}
            else:
                #add user to session
                memberCommand = f"INSERT INTO QuizMember (UserID, SessionID, Score) VALUES ({user[0]}, {sessionId[0]}, 0)"
                database.execute(memberCommand)
                print(f"Executed command: {memberCommand}")
                database.commit()
                response = {"sessionId": sessionId[0], 'authorised': 1}
        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


    @app.route('/getMembers', methods=['POST'])
    def getMembers():
        params = json.loads(request.data.decode())

        try:
            token = params['token']
            sessionId = params['sessionId']
        except Exception as e:
            print(e)
            token = ''
            sessionid = ''

        database = db.get_db()
        sessionQuery = f"SELECT UserID FROM UserSession WHERE TOKEN='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401
        else:
            print(f"User authorised: {user[0]}")

            #get members of the session
            command = f"SELECT Username FROM User INNER JOIN QuizMember ON QuizMember.UserID=User.ID AND QuizMember.SessionID={sessionId};"
            ids = database.execute(command).fetchall()
            print(f"Executed command: {command}")
            usernameList = []
            for item in ids:
                usernameList.append(item[0])

            #get if the quiz has started
            startCommand = f"SELECT StartTime FROM QuizSession WHERE ID={sessionId}"

            startTime = database.execute(startCommand).fetchone()[0]
            print(f"Executed command: {startCommand}")

            if startTime != None:
                response = {"StartTime": startTime, "Usernames": usernameList}
            else:
                response = {"Usernames": usernameList}


        response = jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')

        return response

    @app.route('/getSessionCode', methods=['POST'])
    def getCode():
        #Check if user is logged in
        params = json.loads(request.data.decode())

        try:
            token = params['token']
            sessionId = params['sessionId']
        except:
            token = ''
            sessionId = ''

        database = db.get_db()
        sessionQuery = f"SELECT UserID FROM UserSession WHERE TOKEN='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401
        else:
            print(f"User authorised: {user[0]}")
            #check if user is a member of the session

            memberCommand = f"SELECT ID FROM QuizMember WHERE UserID={user[0]} AND SessionId={sessionId};"

            memberId = database.execute(memberCommand).fetchone()[0]
            print(f"Executed command: {memberCommand}")

            if memberId != None:
                codeCommand = f"SELECT SessionCode FROM QuizSession WHERE ID={sessionId};"

                code = database.execute(codeCommand).fetchone()[0]
                response = {"response": "Success", "code": code}

            else:
                response = {"response": "Not in session"}

        response = jsonify(response)
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response

    @app.route('/startGame', methods=['POST'])
    def startGame():
        #Check if user is logged in
        params = json.loads(request.data.decode())

        try:
            token = params['token']
            sessionId = params['sessionId']
        except:
            token = ''
            sessionId = ''

        database = db.get_db()
        sessionQuery = f"SELECT UserID FROM UserSession WHERE TOKEN='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401
        else:
            print(f"User authorised: {user[0]}")

            #Check if user is the creator of the session
            command = f"SELECT Creator FROM QuizSession WHERE ID={sessionId};"

            creatorId = database.execute(command).fetchone()[0]
            print(f"creatorId: {creatorId}, userId: {user[0]}")

            if str(creatorId) != str(user[0]):
                print("User not owner of session")
                response = {'authorised': 0}
                responseCode = 401
            else:
                print("User is owner of session")

                #Add a value to the startTime column
                timeCommand = f"UPDATE QuizSession SET StartTime={time.time()+10} WHERE ID={sessionId};"
                database.execute(timeCommand)
                print(f"Executed command: {timeCommand}")

                #add a start time to the first roundSession entry


                database.commit()
                response = {'authorised': 1, 'completed': 1}


        #Return status
        response = jsonify(response)
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response

    @app.route('/currentRound', methods=['POST'])
    def getCurrentRound():
        #Check if user is logged in
        params = json.loads(request.data.decode())

        try:
            token = params['token']
            sessionId = params['sessionId']
        except:
            token = ''
            sessionId = ''

        database = db.get_db()
        sessionQuery = f"SELECT UserID FROM UserSession WHERE TOKEN='{token}';"
        user = database.execute(sessionQuery).fetchone()
        print(f"executed command: {sessionQuery}")

        if user == None:
            print("User not authorized")
            response = {'authorised': 0}
            responseCode = 401
        else:
            print(f"User authorised: {user[0]}")
            #check if user is a member of the session

            memberCommand = f"SELECT ID FROM QuizMember WHERE UserID={user[0]} AND SessionId={sessionId};"
            print(f"Executed command: {memberCommand}")
            memberId = database.execute(memberCommand).fetchone()[0]

            if memberId != None:
                #round order is in assecding ids

                quizCommand = f"SELECT QuizID FROM QuizSession WHERE ID={sessionId};"
                quizId = database.execute(quizCommand).fetchone()[0]
                print(f"Executed command: {quizCommand}")

                #the current round is the roundSession with the highest ID that has a start time
                roundSessionCommand = f"SELECT MAX(ID) FROM RoundSession WHERE SessionId={sessionId} AND StartDT IS NOT NULL;"
                roundSessionId = database.execute(roundSessionCommand).fetchone()[0]
                print(f"Executed command: {roundSessionCommand}")

                #Get round id from round session
                roundCommand = f"SELECT Round.ID FROM Round JOIN RoundSession ON RoundSession.RoundID=Round.ID WHERE RoundSession.ID={roundSessionId};"
                roundId = database.execute(roundCommand).fetchone()[0]
                print(f"Executed command: {roundCommand}")

                command = f"SELECT Question.ID, Question.QuestionText, Question.MultipleChoice, Question.AuthorID FROM QuestionInRound INNER JOIN Question ON Question.ID=QuestionInRound.QuestionID WHERE RoundID={roundId}"
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
                response = {'questions':questionDict, 'currentround': roundSessionId}
            else:
                response = {"response": "Not in session"}

        response = jsonify(response)
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response

    return app
