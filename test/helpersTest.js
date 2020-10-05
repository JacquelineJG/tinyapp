const express = require("express");
const cookieSession = require('cookie-session')
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

const { assert } = require('chai');

const {  emailVerify, userIdByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

describe('emailVerify', function() {
  it('should return true if email exists in the database', function() {
    const user = emailVerify(testUsers, "user@example.com")
    const expectedOutput = true;
    assert.equal(expectedOutput, user)
  });
  it('should reutn null if email does not exist in database', function() {
    const user = emailVerify(testUsers, "hello@hello.com")
    const expectedOutput = null;
    assert.equal(expectedOutput, user)
  });
});

describe('userIdByEmail', function() {
  it('should return a user object associated with email', function() {
    const user = userIdByEmail(testUsers, "user@example.com")
    const expectedOutput =   {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(expectedOutput, user)
  });
});

describe('urlsForUser', function() {
  it('should return an object of urls associated with userID', function() {
    const user = urlsForUser("userRandomID", urlDatabase)
    const expectedOutput =   {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
    }
    assert.deepEqual(expectedOutput, user)
  });
});