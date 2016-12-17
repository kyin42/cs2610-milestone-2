CREATE TABLE scores (
  ID SERIAL PRIMARY KEY,
  nick VARCHAR,
  score BIGINT
);

INSERT INTO scores (nick, score)
  VALUES ('kyin42', 24);