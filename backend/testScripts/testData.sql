INSERT INTO User
VALUES
    (0, "TEST_USER_0", "John Doe", "PASS123", "john@example.com"),
    (1, "TEST_USER_1", "Joanne Doe", "qwertyuiop", "joanne@example.com");

INSERT INTO Topic
VALUES
    (0, "Algebra"),
    (1, "Ratios"),
    (2, "Arithmetic");

INSERT INTO Question
VALUES
    (0, "2x -3 = 9 Find x", 0, 0, 0, 'Medium'),
    (1, "x/3 * 4 = 12 Find x", 0, 0, 0, 'Medium'),
    (2, "4x = 4 Find x", 0, 0, 1, 'Medium'),
    (3, "Divide 180 in the ratio 5:1", 1, 1, 0, 'Medium'),
    (4, "Divide 32 in the ratio 5:3", 1, 1, 0, 'Medium'),
    (5, "Divide 121 in the ratio 3:8", 1, 1, 1, 'Medium');

INSERT INTO Answer
VALUES
    (0, 0, "6", 1),
    (1, 1, "9", 1),
    (2, 2, "1", 1),
    (3, 2, "2", 0),
    (4, 2, "0", 0),
    (5, 3, "150:30", 1),
    (6, 4, "20:12", 1),
    (7, 5, "33:88", 1),
    (8, 5, "44:77", 0),
    (9, 5, "22:77", 0);

INSERT INTO Quiz
VALUES
    (0, 0, 3, 'Medium');


INSERT INTO Round
VALUES
    (0, 0, 0, NULL),
    (1, 1, 0, NULL);

INSERT INTO QuestionInRound
VALUES
    (0, 0),
    (1, 0),
    (2, 0),
    (3, 1),
    (4, 1),
    (5, 1);
