-- drop existing tables
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;


-- new users table
CREATE TABLE users (
    id         SERIAL primary key,
    first      VARCHAR(255) NOT NULL CHECK (first != ''),
    last       VARCHAR(255) NOT NULL CHECK (last != ''),
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL CHECK (password != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- new signatures table
CREATE TABLE signatures (
    id          SERIAL primary key,
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature   TEXT NOT NULL CHECK (signature != '')
);


-- user_profiles table
CREATE TABLE user_profiles (
    id          SERIAL primary key,
    city        VARCHAR(255),
    age         INT,
    website         VARCHAR, 
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id)
);