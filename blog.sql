DROP DATABASE IF EXISTS blog;
CREATE DATABASE blog;

\c blog;

CREATE TABLE posts (
  ID SERIAL PRIMARY KEY,
  name VARCHAR,
  content TEXT
);

INSERT INTO posts (name, content)
  VALUES ('Test post', 'test post content');