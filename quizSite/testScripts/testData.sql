INSERT INTO user
VALUES
    ("Bob", "qwertyuiop"),
    ("Ben", "thisisapassword");

INSERT INTO question
VALUES
    (0, "what is 1 + 1", 1, "Bob"),
    (1, "What is the square root of 9", 0, "Ben");

INSERT INTO answer
VALUES
    (0, 0, "2", 1),
    (1, 0, "3", 0),
    (2, 0, "99", 0),
    (3, 1, "3", 1),
    (4, 1, "three", 1);

INSERT INTO test
VALUES
    (0, 100),
    (1, 200);

INSERT INTO topic
VALUES
    (0, "addition");

INSERT INTO round
VALUES
    (0, 1, 0, 0);

INSERT INTO questionInRound
VALUES
    (0, 0);

INSERT INTO userTestSession
VALUES
    (0, "Bob", 0, 100, 110);

INSERT INTO userResponse
VALUES
    (0, 0, "2", 10.0, 50);
