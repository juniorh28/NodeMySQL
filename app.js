//Libraries Imported
const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require('cookie-parser')

//Creating the app
const app = express();

//Creating config which hold sensitive information
dotenv.config({
  path: "./.env",
});

//Create Connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

//where all front end files will be
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
app.set("view engine", "hbs");

//Allows you to grab data from any form
app.use(express.urlencoded({
  extended: false
}))
//convert the value into json
app.use(express.json())

//initializing cookie to be used in our browser
app.use(cookieParser())

//define routes
//whenever you use a path that has '/' , go to './routes/pages
app.use('/', require('./routes/pages'))
//whenever you use a path that has '/auth' , go to './routes/auth
app.use('/auth', require('./routes/auth'))

//Checking connection to MySQL
db.connect((err) => {
  if (err) console.log(err);
  else console.log("MYSQL Connected...");
});

//Tells the server where to be hosted
app.listen("5000", () => {
  console.log("connected to port 5000");
});


/**
 * in order to create a connection you must first create a database,
 * below is the creation of a database, once its created you must delete it because you cant recreate it
 * above, you named the database in the database section the name you just created
 * if you dont see the database in your mysql, you can type it in the search bar on mySQL and it should appear
 */

//Connect
/*
db.connect((err) => {
  if (err) throw err;
  console.log("Connected");
  db.query("SHOW DATABASES;", (err, result) => {
    if (err) throw err;
    console.log(result);
  });

});

//Create DB
app.get("./createdb", (req, res) => {
  let sql = "CREATE DATABASE test";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Database created...");
  });
});
*/