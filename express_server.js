const express = require("express");
const app = express();
const PORT = 8080;

//used for generating unique shortURL
const generateRandomString = () => Math.random().toString(36).substring(2,8);

// const newObj = {
//   Apple: "red"
// };

// newObj["Apple"] = "green"
// newObj["Banana"] = "yellow"

app.set("view engine", "ejs");

//hardcoded urls to start with and our database since we aren't saving to an external
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//body parser for post requests to make human readable data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  //saves to object urlDatabase
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect(`/urls/${shortURL}`);         // Redirects us to newly created short url
});

// to redirect the short url hyper link to the long url page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  //console.log(req.params)
  // this variable displays the longURL by reaching into the urlDatabase and uses the req.params.shortURL to get the value 
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  //if statement for if shortURL returns a falsey value
  if (!req.params.shortURL) {
    res.send("400 Bad Request").statusCode(400);
    }
});

//route for deleting url, then redirects to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")

})
// edits the longURL using post request
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls")
//  console.log("howdy params", req.params)
//  console.log("hello body", req.body)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
