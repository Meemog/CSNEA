DROP TABLE IF EXISTS userResponse;
DROP TABLE IF EXISTS userTestSession;
DROP TABLE IF EXISTS questionInRound;
DROP TABLE IF EXISTS round;
DROP TABLE IF EXISTS topic;
DROP TABLE IF EXISTS test;
DROP TABLE IF EXISTS answer;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS user;

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

CREATE TABLE test (
  testID INTEGER PRIMARY KEY AUTOINCREMENT,
  createdDT INTEGER NOT NULL
);

CREATE TABLE topic (
  topicID INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE round (
  roundID INTEGER PRIMARY KEY AUTOINCREMENT,
  difficulty INTEGER NOT NULL,
  topicID INTEGER NOT NULL,
  testID INTEGER NOT NULL,
  FOREIGN KEY (topicID) REFERENCES topic (topicID),
  FOREIGN KEY (testID) REFERENCES test (testID)
);

CREATE TABLE questionInRound (
  roundID INTEGER,
  questionID INTEGER,
  FOREIGN KEY (roundID) REFERENCES round (roundID),
  FOREIGN KEY (questionID) REFERENCES question (questionID)
  PRIMARY KEY (roundID, questionID)
);

CREATE TABLE userTestSession (
  userSessionID INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  testID INTEGER NOT NULL,
  startDT INTEGER NOT NULL,
  endDT INTEGER,
  FOREIGN KEY (username) REFERENCES user (username),
  FOREIGN KEY (testID) REFERENCES test (testID)
);

CREATE TABLE userResponse (
  questionID INTEGER,
  userSessionID INTEGER,
  response TEXT NOT NULL,
  timeToAnswer FLOAT NOT NULL,
  score FLOAT NOT NULL,
  FOREIGN KEY (questionID) REFERENCES question (questionID),
  FOREIGN KEY (userSessionID) REFERENCES userTestSession (userSessionID)
  PRIMARY KEY (questionID, userSessionID)
);
