import sqlite3

import click
from flask import current_app
from flask.cli import with_appcontext


def populate_db():
    db = get_db()

    with current_app.open_resource('testData.sql') as f:
        db.executescript(f.read().decode('utf8'))

@click.command('populate-db')
@with_appcontext
def populate_db_command():
    populate_db()
    click.echo('Populated the database')
