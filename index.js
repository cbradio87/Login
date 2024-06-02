const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const pool = dbConnection();

app.set("view engine", "ejs");

app.use(session( {
  secret: "top secret!",
  resave: true,
  saveUnitialized: true
}));

app.use(express.urlencoded({extended: true})); //to be able to parse POST parameters

//routes
app.get('/', (req, res) => {
  res.render('index')
});

app.post("/", async(req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  //console.log("username:" + username);
  //console.log("password:" + password);
  let hashedPwd = "";

  let sql = "SELECT * FROM q_admin WHERE username = ?";
  let rows = await executeSQL(sql, [username]);

  if(rows.length > 0) {
    hashedPwd = rows[0].password;
  }

  let passwordMatch = await bcrypt.compare(password, hashedPwd);
  console.log("passwordMatch:" + passwordMatch);

  if (passwordMatch) {
    req.session.authenticated = true;
    res.render ("welcome")
  } else {
    res.render("index", {"loginError":true});
  }
});

app.get('/myProfile', isAuthenticated, (req, res) => {
  res.render("profile");
});

app.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy();
    res.redirect("/")
})

//functions
function isAuthenticated(req,res,next) {
  if(!req.session.authenticated) {
    res.redirect("/");
   } else {
     next();
   }
}

function dbConnection(){
  const pool = mysql.createPool({
    connectionLimit: 10,
    host: "w3epjhex7h2ccjxx.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "mf1w8x4ok0oya478",
    password: "d5to7gvvgirxdz4x",
    database: "dmw6rn12umewvz16"
  });

  return pool;

}  //dbConnection

//server listener
app.listen(3000, () => {
  console.log('server started');
});

async function executeSQL(sql, params){
 return new Promise (function (resolve, reject) {
   pool.query(sql, params, function (err, rows, fields) {
   if (err) throw err;
     resolve(rows);
   });
 });
}//executeSQL