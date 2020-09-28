const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//hardcoded urls to start with
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

///urls represents the page and : declares a variable input in the page url bar and shortURL is the variable name of the parameter
app.get("/urls/:shortURL", (req, res) => {
  // console log of req.params so I can remember what it does
  console.log(req.params)
  // this variable displays the longURL by reaching into the urlDatabase and uses the req.params.shortURL to get the value 
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
