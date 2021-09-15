import os

from flask import(
        Flask, jsonify, request, abort
        )

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
            return jsonify({'name':'bob', 'occupation':'builder'})

    @app.route('/users', methods=['GET'])
    def users():
        if request.method == 'GET':
            database = db.get_db()

            users = database.execute('SELECT * FROM user').fetchall()
            userDict = {}
            count = 0
            for row in users:
                userDict.update({
                        count:{
                            'name':row[0],
                            'password':row[1]
                            }
                        })
                count += 1
            return jsonify(userDict)

    @app.route('/questions', methods=['GET'])
    def questions():
        if request.method == 'GET':
            database = db.get_db()

            questions = database.execute('SELECT * FROM question').fetchall()
            questionDict = {}
            count = 0
            for row in questions:
                questionDict.update({
                    count:{
                        'questionID':row[0],
                        'questionText':row[1],
                        'multipleChoice':row[2],
                        'author':row[3]
                        }
                    })
                count += 1
            return jsonify(questionDict)

    @app.route('/answers', methods=['GET'])
    def answers():
        if request.method == 'GET':
            database = db.get_db()

            answers = database.execute('SELECT * FROM answer').fetchall()
            answerDict = {}
            count = 0
            for row in answers:
                answerDict.update({
                    count:{
                        'answerID':row[0],
                        'questionID':row[1],
                        'answerText':row[2],
                        'correct':row[3]
                        }
                    })
                count += 1
            return jsonify(answerDict)

    @app.route('/tests', methods=['GET'])
    def tests():
        if request.method == 'GET':
            database = db.get_db()

            tests = database.execute('SELECT * FROM test').fetchall()
            testDict = {}
            count = 1
            for row in tests:
                testDict.update({
                    count:{
                        'testID':row[0],
                        'createdDT':row[1]
                        }
                    })
                count += 1
            return jsonify(testDict)

    @app.route('/topics', methods=['GET'])
    def topics():
        if request.method == 'GET':
            database = db.get_db()

            topics = database.execute('SELECT * FROM topic').fetchall()
            topicDict = {}
            count = 0
            for row in topics:
                topicDict.update({
                    count:{
                        'topicID':row[0],
                        'name':row[1]
                        }
                    })
                count += 1
            return jsonify(topicDict)

    @app.route('/rounds', methods=['GET'])
    def rounds():
        if request.method == 'GET':
            database = db.get_db()

            rounds = database.execute('SELECT * FROM round').fetchall()
            roundDict = {}
            count = 0
            for row in rounds:
                roundDict.update({
                    count:{
                        'roundID':row[0],
                        'difficulty':row[1],
                        'topicID':row[2],
                        'testID':row[3]
                        }
                    })
                count += 1
            return jsonify(roundDict)

    @app.route('/questionsInRound', methods=['GET'])
    def qIRounds():
        if request.method == 'GET':
            database = db.get_db()

            qIRounds = database.execute('SELECT * FROM questionInRound').fetchall()
            qIRoundDict = {}
            count = 0
            for row in qIRounds:
                qIRoundDict.update({
                    count:{
                        'roundID':row[0],
                        'questionID':row[1]
                        }
                    })
                count += 1
            return jsonify(qIRoundDict)

    @app.route('/sessions', methods=['GET'])
    def sessions():
        if request.method == 'GET':
            database = db.get_db()

            sessions = database.execute('SELECT * FROM userTestSession').fetchall()
            sessionDict = {}
            count = 0
            for row in sessions:
                sessionDict.update({
                    count:{
                        'userSessionId':row[0],
                        'username':row[1],
                        'testID':row[2],
                        'startDT':row[3],
                        'endDT':row[4]
                        }
                    })
                count += 1
            return jsonify(sessionDict)

    @app.route('/responses', methods=['GET'])
    def responses():
        if request.method == 'GET':
            database = db.get_db()

            responses = database.execute('SELECT * FROM userResponse').fetchall()
            responseDict = {}
            count = 0
            for row in responses:
                responseDict.update({
                    count:{
                        'questionID':row[0],
                        'userSessionID':row[1],
                        'response':row[2],
                        'timeToAnswer':row[3],
                        'score':row[4]
                        }
                    })
                count += 1
            return jsonify(responseDict)

    db.init_app(app)

    return app
