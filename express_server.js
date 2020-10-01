const express = require("express");
const cookieSession = require('cookie-session')
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['apqr16-7acujhu-fj8ahfgk-jfujjka8', 'zxiuslojf-nsijwi98-dna1-2djkkand']
}))

//URL DATABASE OBJECT
//hardcoded urls to start with and our database since we aren't saving to an external
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
// console.log(urlDatabase)
//USER DATABASE OBJECT
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

// HELPER FUNCTIONS
//used for generating unique shortURL
const generateRandomString = () => Math.random().toString(36).substring(2,8);
//used for checking existence of email in users object
const emailVerify = (obj, email) => {
  for (const user in obj) {
    const thisUser = obj[user]
    if (thisUser.email === email) {
       return true
    }
  }
  return null
}
const userIdByEmail = (bcrypt, obj, email, password) => {
  const hashPass = bcrypt.hashSync(password, salt)
  for (const user in obj) {
    const thisUser = obj[user]
   
    if (thisUser.email === email) {
      console.log("test1") 
      console.log("bcrypt", password)
      console.log("thisUser", thisUser.password)
      if(bcrypt.compareSync(thisUser.password, hashPass)) {
        console.log("test2")
      return thisUser;
    } else {
      console.log("returning null")
      return null
    }
  }
 } 

}

const urlsForUser = (id) => {
 //console.log("id", id)
  newObj = {};
  for (let url in urlDatabase) {
    //console.log("url", url);
    //console.log("urlDatabase[url]", urlDatabase[url])
    if (id === urlDatabase[url].userID) {
      newObj[url] = urlDatabase[url];
      
    }
  } //console.log("newObj", newObj)
  return newObj;
}

// const passwordVerify = (obj, password) => {
//   for (const user in obj) {
//     const thisUser = obj[user]
//     if (thisUser.password === password) {
//       return true
//     }
//   }
//   return null
// }

// const newObj = {
//   Apple: "red"
// };

// newObj["Apple"] = "green"
// newObj["Banana"] = "yellow"



app.use( (req, res, next) => {
  const user_id = req.session.userID
  const user = users[user_id];
  req.user = user
  next();
})

////////////////GET/////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log('req.user', req.user)
  if (req.user) {
    const userUrls = urlsForUser(req.user.id);
    console.log('req.user.id', req.user.id)
    const templateVars = { 
      urls: userUrls,
      user: req.user
    };
    return res.render("urls_index", templateVars);
  } else {
    // res.status(403).send("Please log in or register")
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

///urls represents the page and : declares a variable input in the page url bar and shortURL is the variable name of the parameter
app.get("/urls/:shortURL", (req, res) => {
  // console log of req.params so I can remember what it does
  // console.log(req.params)
  // this variable displays the longURL by reaching into the urlDatabase and uses the req.params.shortURL to get the value 
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.user
   };
  //  console.log('urlDatabase', urlDatabase)
  //  console.log('req.params', req.params)
  //  console.log('req.params.shortURL', req.params.shortURL)

  res.render("urls_show", templateVars);
  //if statement for if shortURL returns a falsey value
  if (!req.params.shortURL) {
    res.send("400 Bad Request")
    }
});


////////////////POST/////////////////

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  
  let shortURL = generateRandomString();
  //saves to object urlDatabase
   urlDatabase[shortURL] = {longURL: req.body["longURL"], userID: req.user.id};
   console.log('req.body["longURL"]', req.body["longURL"])
   console.log('req.user.id', req.user.id)
  res.redirect(`/urls/${shortURL}`);         // Redirects us to newly created short url
});

//route for deleting url, then redirects to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.userID
  const user = users[user_id];
  //const userUrls = urlsForUser(user.id);
  console.log('users[user_id]', users[user_id])
  console.log('user_id', user_id)
  //console.log("user URLS", userUrls);
   if (user.id){
    delete urlDatabase[req.params.shortURL]
    // console.log(urlDatabase[req.params.shortURL])
    return res.redirect('/urls')
   } else {
    res.status(403).send("Whoops, you can't delete that")
   }
})
// edits the longURL using post request
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.userID
  const user = users[user_id];
  if (user.id){
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls")
  }
//  console.log("howdy params", req.params)
//  console.log("hello body", req.body)
})

app.post("/login", (req, res) => {
  // const { email, password } = req.body
  let foundUser = userIdByEmail(bcrypt, users, req.body.email, req.body.password)
  //console.log("founduser", foundUser)
  if (foundUser) {
    //console.log(foundUser.user_id)
    req.session.userID = foundUser.id
    
    // console.log("req session userID", req.session.user_id)
    //console.log("user found")
    res.redirect('/urls');
  } else {
      return res.send("403 Forbidden: Email/Password invalid")
    } 
  
  //return res.send("403 Forbidden: Email/Password invalid")
});

app.post("/logout", (req, res) => {
  //console.log(req.body);
  delete req.session.userID;
    // ... any other vars
    
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
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
