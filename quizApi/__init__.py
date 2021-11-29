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

            command = "SELECT * FROM QuestionInRound WHERE RoundID=" + roundid + ";"
            questions = database.execute(command).fetchall()
            questionDict = {}
            count = 0

            for row in questions:
                questionDict.update({
                    count:{
                        'questionid':row[0],
                        'roundid':row[1]
                        }
                    })
                count += 1
            return jsonify(questionDict)

    db.init_app(app)

    return app
