#!/bin/bash

export FLASK_APP=backend
export FLASK_ENV=development
python -m flask init-db
python -m flask populate-db
python -m flask run
