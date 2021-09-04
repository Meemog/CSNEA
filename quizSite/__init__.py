import os

from flask import(
        Flask, jsonify, request, abort
        )

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'quizSite.sqlite'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from . import db

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    @app.route('/testData', methods=['GET'])
    def testData():
        if request.method == 'GET':
            return jsonify({'name':'bob', 'occupation':'builder'})

    @app.route('/users', methods=['GET'])
    def users():
        if request.method == 'GET':
            database = db.get_db()

            users = database.execute('SELECT * FROM user').fetchall()
            for row in users:
                userDict = {
                        'name':row[0],
                        'password':row[1]
                        }
            return jsonify(userDict)

    @app.route('/questions', methods=['GET'])
    def questions():
        if request.method == 'GET':
            database = db.get_db()

            questions = database.execute('SELECT * FROM questions').fetchall()
            for row in questions:
                questionDict = {
                        'questionID':row[0],
                        'questionText':row[1],
                        'multipleChoice':row[2],
                        'author':row[3]
                        }
            return jsonify(questionDict)

    @app.route('/answers', methods=['GET'])
    def answers():
        if request.method == 'GET':
            database = db.get_db()

            answers = database.execute('SELECT * FROM answer').fetchall()
            for row in answers:
                answerDict = {
                        'answerID':row[0],
                        'questionID':row[1],
                        'answerText':row[2],
                        'correct':row[3]
                        }
            return jsonify(answerDict)

    @app.route('/tests', methods=['GET'])
    def tests():
        if request.method == 'GET':
            database = db.get_db()

            tests = database.execute('SELECT * FROM test').fetchall()
            for row in tests:
                testDict = {
                        'testID':row[0],
                        'createdDT':row[1]
                        }
            return jsonify(testDict)

    @app.route('/topics', methods=['GET'])
    def topics():
        if request.method == 'GET':
            database = db.get_db()

            topics = database.execute('SELECT * FROM topics').fetchall()
            for row in topics:
                topicDict = {
                        'topicID':row[0],
                        'name':row[1]
                        }
            return jsonify(topicDict)

    @app.route('/rounds', methods=['GET'])
    def rounds():
        if request.method == 'GET':
            database = db.get_db()

            rounds = database.execute('SELECT * FROM round').fetchall()
            for row in rounds:
                roundDict = {
                        'roundID':row[0],
                        'difficulty':row[1],
                        'topicID':row[2],
                        'testID':row[3]
                        }
            return jsonify(roundDict)

    @app.route('/questionInRound', methods=['GET'])
    def qIRounds():
        if request.method == 'GET':
            database = db.get_db()

            qIRounds = database.execute('SELECT * FROM questionsInRound').fetchall()
            for row in qIRounds:
                qIRoundDict = {
                        'roundID':row[0],
                        'questionID':row[1]
                        }
            return jsonify(qIRoundDict)

    @app.route('/sessions', methods=['GET'])
    def sessions():
        if request.method == 'GET':
            database = db.get_db()

            sessions = database.execute('SELECT * FROM userTestSession').fetchall()
            for row in sessions:
                sessionDict= {
                        'userSessionId':row[0],
                        'username':row[1],
                        'testID':row[2],
                        'startDT':row[3],
                        'endDT':row[4]
                        }
            return jsonify(sessionDict)

    @app.route('/responses', methods=['GET'])
    def responses():
        if request.method == 'GET':
            database = db.get_db()

            responses = database.execute('SELECT * FROM userResponse').fetchall()
            for row in responses:
                responseDict= {
                        'questionID':row[0],
                        'userSessionID':row[1],
                        'response':row[2],
                        'timeToAnswer':row[3],
                        'score':row[4]
                        }
            return jsonify(responseDict)

    db.init_app(app)

    return app
