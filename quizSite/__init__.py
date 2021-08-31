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

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    @app.route('/testData', methods=['GET'])
    def testData():
        if request.method == 'GET':
            return jsonify({'name':'bob', 'occupation':'builder'})

    from . import db
    db.init_app(app)

    return app
