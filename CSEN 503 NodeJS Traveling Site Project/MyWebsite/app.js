var express = require('express');
var path = require('path');
var fs = require('fs');
const { render } = require('ejs');
var alert = require('alert');
const sessions = require('express-session');
var app = express();
let message = "";
let loginMessage = "";
var session;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(sessions({
  secret: 'Snickerdoodle',
  saveUninitialized: true,
  resave: false,
  cookie: {secure: true}
}));
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  session = req.session;
  session.logged = false;
  // if(session.username){
  //   res.redirect('/home');
  // }else{
  res.render('login', {loginMessage:loginMessage});
  //}
});

var db;
var Mongonb = require('mongodb').MongoClient;
Mongonb.connect('mongodb://127.0.0.1:27017', function (error, client) {
  if (error) {
    throw error;
  }
  db = client.db('myDB');

});

let User;
let pass;
let logged = false;
app.post('/', function (req, res) {
  User = req.body.username;
  pass = req.body.password;

  session = req.session;

  if (User == "admin" && pass == "admin"){
    res.redirect('/home');
    logged = true;
  }else{
    db.collection("myCollection").find().toArray(function(err, results){
      for(let i = 0; i < results.length; i++){
        if(results[i].Username == User && results[i].Password == pass){
          //if(!session.username){
            session.logged = true;
            session.username = results[i].Username;
            // req.session.save();
            res.redirect('/home');
            return;
          //}
        }
      }
      loginMessage = "Incorrect Username Or Password";
      res.redirect('/');
    });
  }
});

app.get('/registration', function (req, res) {
  if(session.logged || logged){
    res.redirect('/home');
  }else{
    res.render('registration', {message:message});
  }
});

let Userreg;
let passreg;
app.post('/register', function (req, res) {
  Userreg = req.body.username;
  passreg = req.body.password;
  if(Userreg == "" || passreg == ""){
    message = "Username or Password Cannot be empty";
    res.redirect('/registration');
    return;
  }
  db.collection("myCollection").find().toArray(function(err, results){
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == Userreg){
        message = "Username Already Exits";
        res.redirect('/registration');
        return;
      }
    }
      db.collection('myCollection').insertOne({Username: Userreg ,Password: passreg, Destination: "null", Favorites: "" });
      loginMessage = "Registration Successfull";
      res.redirect('/');
  });
});

app.get('/home', function(req, res){
  if(session.logged || logged){
    res.render('home');
  }else{
    res.send("You Are Not Logged In To Your Account");
  }
});

var Search;
let s = [];
let html = [];
app.post('/search', function(req, res){
  Search = req.body.Search;
  if(Search == ""){
    html = ["Not Found"]
    res.redirect('/searchresults');
    return;
  }
  db.collection("myCollection").find().toArray(function(err, results){
    //let s = []
    for(let i = 0; i < results.length; i++){
      if((results[i].Destination).includes(Search) && results[i].Destination != "null"){
        s = s.concat([results[i].Destination]);
      }
    }
    if(s == [] || s.length == 0){
      html = ["Not Found"]
      res.redirect('/searchresults');
      return;
    }else{
    //let html = [];
      for(let i = 0; i < s.length; i++){
        html = html.concat(['<a href="' + s[i] + '"><button type="button" class="btn btn-secondary ml-3">'+ s[i] + '</button></a>']);
      }
      res.redirect('/searchresults');
    }
  });
});

app.get('/searchresults', function(req, res){
  if(session.logged || logged){
    res.render('searchresults', {result:html.join(" ")});
    html = [];
    s = [];
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/inca', function(req, res){
  if(session.logged || logged){
    res.render('inca');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/santorini', function(req, res){
  if(session.logged || logged){
    res.render('santorini');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/rome', function(req, res){
  if(session.logged || logged){
  res.render('rome');
}else {
  res.send("You Are Not Logged Into Your Account");
}
});

app.get('/paris', function(req, res){
  if(session.logged || logged){
  res.render('paris');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/bali', function(req, res){
  if(session.logged || logged){
    res.render('bali');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/annapurna', function(req, res){
  if(session.logged || logged){
    res.render('annapurna');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/hiking', function(req, res){
  if(session.logged || logged){
    res.render('hiking');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/islands', function(req, res){
  if(session.logged || logged){
    res.render('islands');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.get('/cities', function(req, res){
  if(session.logged || logged){
    res.render('cities');
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

let html2 = [];
app.post('/AddToWantToGo', function(req, res){
  db.collection("myCollection").find().toArray(function(err, results){
    let TheUser;
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == User){
        TheUser = results[i];
        break;
      }
    }
    var locations = "";
    try{locations = TheUser.Favorites.split(',');}catch(error){html2 = []; return;}
    for(let i = 0; i < locations.length; i++){
      html2 = html2.concat(['<p style="color: blue">'+ locations[i] + '</p>']);
    }
  });
  res.redirect('/wanttogo');
});

app.get('/wanttogo', function(req, res){
  if(session.logged || logged){
    res.render('wanttogo', {wants: html2.join('<br>')});
    html2 = [];
  }else {
    res.send("You Are Not Logged Into Your Account");
  }
});

app.post('/addAnnapurna', function(req, res){
  db.collection("myCollection").find().toArray(function(err, results){
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == User){
        if(results[i].Favorites.includes('Annapurna')){
          alert("Already Exits in The Want-To-Go List");
          res.redirect('back');
        }else if(results[i].Favorites == "" && results[i].Favorites != "null"){
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: "Annapurna"}});
          alert("Added Successfully");
          res.redirect('back');
        }else if(results[i].Favorites != "null"){
          let newLocation = results[i].Favorites + ",Annapurna";
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: newLocation}});
          alert("Added Successfully");
          res.redirect('back');
        }
        return;
      }
    }
  });
});

app.post('/addBali', function(req, res){
  db.collection("myCollection").find().toArray(function(err, results){
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == User){
        if(results[i].Favorites.includes('Bali')){
          alert("Already Exits in The Want-To-Go List");
          res.redirect('back');
        }else if(results[i].Favorites == "" && results[i].Favorites != "null"){
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: "Bali"}});
          alert("Added Successfully");
          res.redirect('back');
        }else if(results[i].Favorites != "null"){
          let newLocation = results[i].Favorites + ",Bali";
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: newLocation}});
          alert("Added Successfully");
          res.redirect('back');
        }
        return;
      }
    }
  });
});

app.post('/addInca', function(req, res){
  db.collection("myCollection").find().toArray(function(err, results){
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == User){
        if(results[i].Favorites.includes('Inca')){
          alert("Already Exits in The Want-To-Go List");
          res.redirect('back');
        }else if(results[i].Favorites == "" && results[i].Favorites != "null"){
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: "Inca"}});
          alert("Added Successfully");
          res.redirect('back');
        }else if(results[i].Favorites != "null"){
          let newLocation = results[i].Favorites + ",Inca";
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: newLocation}});
          alert("Added Successfully");
          res.redirect('back');
        }
        return;
      }
    }
  });
});

app.post('/addParis', function(req, res){
  db.collection("myCollection").find().toArray(function(err, results){
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == User){
        if(results[i].Favorites.includes('Paris')){
          alert("Already Exits in The Want-To-Go List");
          res.redirect('back');
        }else if(results[i].Favorites == "" && results[i].Favorites != "null"){
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: "Paris"}});
          alert("Added Successfully");
          res.redirect('back');
        }else if(results[i].Favorites != "null"){
          let newLocation = results[i].Favorites + ",Paris";
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: newLocation}});
          alert("Added Successfully");
          res.redirect('back');
        }
        return;
      }
    }
  });
});

app.post('/addRome', function(req, res){
  db.collection("myCollection").find().toArray(function(err, results){
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == User){
        if(results[i].Favorites.includes('Rome')){
          alert("Already Exits in The Want-To-Go List");
          res.redirect('back');
        }else if(results[i].Favorites == "" && results[i].Favorites != "null"){
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: "Rome"}});
          alert("Added Successfully");
          res.redirect('back');
        }else if(results[i].Favorites != "null"){
          let newLocation = results[i].Favorites + ",Rome";
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: newLocation}});
          alert("Added Successfully");
          res.redirect('back');
        }
        return;
      }
    }
  });
});

app.post('/addSantorini', function(req, res){
  db.collection("myCollection").find().toArray(function(err, results){
    for(let i = 0; i < results.length; i++){
      if(results[i].Username == User){
        if(results[i].Favorites.includes('Santorini')){
          alert("Already Exits in The Want-To-Go List");
          res.redirect('back');
        }else if(results[i].Favorites == "" && results[i].Favorites != "null"){
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: "Santorini"}});
          alert("Added Successfully");
          res.redirect('back');
        }else if(results[i].Favorites != "null"){
          let newLocation = results[i].Favorites + ",Santorini";
          db.collection("myCollection").updateOne({Username: User, Password: pass, Destination: "null"}, {$set: {Favorites: newLocation}});
          alert("Added Successfully");
          res.redirect('back');
        }
        return;
      }
    }
  });
});

app.listen(3000);