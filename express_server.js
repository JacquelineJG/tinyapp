const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bodyParser = require("body-parser");
const { generateRandomString, emailVerify, userIdByEmail, urlsForUser } = require('./helpers');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['apqr16-7acujhu-fj8ahfgk-jfujjka8', 'zxiuslojf-nsijwi98-dna1-2djkkand']
}))

// URL DATABASE OBJECT
// hardcoded urls to start with and our database since we aren't saving to an external
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
// console.log(urlDatabase)
// USER DATABASE OBJECT
const users = {
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
}
// this makes req.user reusable throughout parts of the code, no need to redefine
app.use( (req, res, next) => {
  const user_id = req.session.userID
  const user = users[user_id];
  req.user = user
  next();
})

////////////////GET/////////////////

app.get("/", (req, res) => {
  res.redirect('/urls');
});

// to redirect the short url hyper link to the long url page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// /urls page based on whether user is logged in our not
app.get("/urls", (req, res) => {
  if (req.user) {
    const userUrls = urlsForUser(req.user.id, urlDatabase);
    const templateVars = {
      urls: userUrls,
      user: req.user
    };
    return res.render("urls_index", templateVars);
  } else {
    const errorVars = {
      errorMessage: "REGISTER OR SIGN IN TO CREATE TINY URLS!!!",
      user: req.user
    }
    res.render("error", errorVars)
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    email: req.session["email"],
    password: req.session["password"],
    user: req.user
  };
  res.render("register_page", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.session["email"],
    password: req.session["password"],
    user: req.user
  };
  res.render("login_page", templateVars);
});

// /urls represents the page and : declares a variable input in the page url bar and shortURL is the variable name of the parameter
app.get("/urls/:shortURL", (req, res) => {
  // this variable displays the longURL by reaching into the urlDatabase and uses the req.params.shortURL to get the value 
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.user
   };
  res.render("urls_show", templateVars);
  //if statement for if shortURL returns a falsey value
  if (!req.params.shortURL) {
    res.send("400 Bad Request")
    }
});


////////////////POST/////////////////

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  //saves to object urlDatabase
  urlDatabase[shortURL] = {longURL: req.body["longURL"], userID: req.user.id};
  // Redirects us to newly created short url
  res.redirect(`/urls/${shortURL}`);
});

//route for deleting url, then redirects to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.userID
  const user = users[user_id];
  if (user.id){
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls')
   } else {
    res.status(403).send("Whoops, you can't delete that")
   }
});
// edits the longURL using post request
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.userID
  const user = users[user_id];
  if (user.id){
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls")
  }
});

app.post("/login", (req, res) => {
  let foundUser = userIdByEmail(users, req.body.email)
  let passwordCheck = bcrypt.compareSync(req.body.password, foundUser.password)
  if (foundUser && passwordCheck) {
    req.session.userID = foundUser.id
    res.redirect('/urls');
  } else {
      return res.send("403 Forbidden: Email/Password invalid")
    } 
});

app.post("/logout", (req, res) => {
  delete req.session.userID;
  res.redirect("/urls")
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  const { email, password } = req.body
  if(email === "" || password === "") {
    console.log("Error")
    return res.send("400 Bad Request")
  }
  if (emailVerify(users, email)) {
    res.send("400 Bad Request: Email already in use")
  } else {
    let newUser = {
      id: userID,
      email,
      password: bcrypt.hashSync(password, salt)
    }
  users[userID] = newUser;
  req.session.userID = userID
  res.redirect("/urls")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
