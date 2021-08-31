DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS userTestSession;
DROP TABLE IF EXISTS userResponse;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS answer;
DROP TABLE IF EXISTS questionsInRound;
DROP TABLE IF EXISTS round;
DROP TABLE IF EXISTS test;
DROP TABLE IF EXISTS topic;

CREATE TABLE user (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
);

CREATE TABLE question (
  questionID INTEGER PRIMARY KEY AUTOINCREMENT,
  questionText TEXT NOT NULL,
  multipleChoice BOOLEAN NOT NULL,
  author TEXT NOT NULL,
  FOREIGN KEY (author) REFERENCES user (username)
);

CREATE TABLE answer (
  answerID INTEGER PRIMARY KEY AUTOINCREMENT,
  question INTEGER NOT NULL,
  answerText TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  FOREIGN KEY (question) REFERENCES question (questionID)
);

--TODO: add rest of tables
