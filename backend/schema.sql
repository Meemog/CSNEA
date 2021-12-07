DROP TABLE IF EXISTS Answer;
DROP TABLE IF EXISTS Response;
DROP TABLE IF EXISTS RoundResponse;
DROP TABLE IF EXISTS QuizSession;
DROP TABLE IF EXISTS QuestionInRound;
DROP TABLE IF EXISTS Round;
DROP TABLE IF EXISTS Quiz;
DROP TABLE IF EXISTS Question;
DROP TABLE IF EXISTS User;

CREATE TABLE User (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Username TEXT,
  Name TEXT,
  Password TEXT,
  Email TEXT
);

CREATE TABLE Question (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  QuestionText TEXT,
  AuthorID INTEGER,
  Topic TEXT,
  MultipleChoice BOOLEAN,
  Difficulty INTEGER,
  FOREIGN KEY (AuthorID) REFERENCES User(ID)
);

CREATE TABLE Answer (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  QuestionID INTEGER,
  AnswerText TEXT,
  Correct BOOLEAN,
  FOREIGN KEY (QuestionID) REFERENCES Question(ID)
);

CREATE TABLE Quiz (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Generator INTEGER,
  NumQuestions INTEGER,
  Difficulty INTEGER,
  FOREIGN KEY (Generator) REFERENCES User(ID)
);

CREATE TABLE Round (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Topic INTEGER,
  QuizID INTEGER,
  StartDT INTEGER,
  FOREIGN KEY (QuizID) REFERENCES Quiz(ID)
);

CREATE TABLE QuestionInRound (
  QuestionID INTEGER,
  RoundID INTEGER,
  FOREIGN KEY (QuestionID) REFERENCES Question(ID),
  FOREIGN KEY (RoundID) REFERENCES Round(ID)
);

CREATE TABLE QuizSession (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  UserID INTEGER,
  QuizID INTEGER,
  Score INTEGER,
  FOREIGN KEY (UserID) REFERENCES User(ID),
  FOREIGN KEY (QuizID) REFERENCES Quiz(ID)
);

CREATE TABLE RoundResponse (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  QuizSessionID INTEGER,
  RoundID INTEGER,
  EndDT INTEGER,
  Score INTEGER,
  FOREIGN KEY (RoundID) REFERENCES Round(ID),
  FOREIGN KEY (QuizSessionID) REFERENCES QuizSession(ID)
);

CREATE TABLE Response (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Answer TEXT,
  RoundResponseID INTEGER,
  QuestionID INTEGER,
  FOREIGN KEY (QuestionID) REFERENCES Question(ID),
  FOREIGN KEY (RoundResponseID) REFERENCES RoundResponse(ID)
);