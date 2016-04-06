//===============================================================
// Require Modules
//===============================================================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/test";
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

//===============================================================
// Express App Settings
//===============================================================

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//===============================================================
// Routing Functions
//===============================================================

var routes = require('./routes/index');
var users = require('./routes/users');
var mixer = require('./routes/mixer');

app.use('/', routes);
app.use('/users', users);
app.use('/mixer', mixer);


//===============================================================
// Express App Middlewares
//===============================================================

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//===============================================================
// Mongo DB Functions
//===============================================================

// ------------------------------------------------------
// create a new room
var createRoom = function(_roomname, db, success_callback, error_callback) {

  // check if there is a room with the given rooom name in the database
  db.collection('rooms').findOne(
    { "roomname": _roomname },
    function(err, doc) {
      assert.equal(err, null);
      //console.dir(doc);

      if (doc == null) {
        // if the given room name doesn't exist, create a room with the name
        db.collection('rooms').insertOne( 
          {
            "roomname" : _roomname,
            "members" : [
            ]
          }, function(err, result) {
            assert.equal(err, null);
            console.log("Created a new room named " + _roomname);
            success_callback();

        });

      } else {
        // if the given room name already exists, tell the error
        console.log("The room with the name " + _roomname + " already exists!");
        error_callback();
      }
  });
}

// ------------------------------------------------------
// join a room
var joinRoom = function(_roomname, _username, db, success_callback, error_callback) {

  // check if there is a user with the given user name in the room
  db.collection('rooms').findOne( 
    { "roomname" : _roomname,
      "members" : { $elemMatch: { "username" : _username} }
    },
    function(err, doc) {
      assert.equal(err, null);
      //console.dir(doc);

      if (doc == null) {
        // if the given user name doesn't exist, add the username to the member list of the room
        db.collection('rooms').updateOne(
          { "roomname" : _roomname },
          {
            $push: { "members": { "username" : _username, "peerID" : null } }
          }, function(err, results) {
            //console.log(results);
            console.log("Added a new member " + _username + " to room " + _roomname);
            success_callback();

        });

      } else {
        // if the given user name already exists, tell the error
        console.log("The user named " + _username + " already exists in room" + _roomname + " !");
        error_callback();

      }
  });

}

// ------------------------------------------------------
// leave a room
var leaveRoom = function(_roomname, _username, db, callback) {

  db.collection('rooms').updateOne(
    { "roomname" : _roomname },
    {
      $pull: { "members": { "username" : _username } }
    }, function(err, doc) {
      assert.equal(err, null);
      console.log("A member " + _username + " left a room " + _roomname);
      callback();

  });

}



// ------------------------------------------------------
// count number of members in a room
var userCount = function(_roomname, db, callback) {
  db.collection('rooms').aggregate(
    [
      { $match: { "roomname": _roomname } },
      { $project: { "count": { $size: "$members" } } }
    ]).toArray(
      function(err, result) {
        assert.equal(err, null);
        var count = parseInt(result[0]["count"]);
        console.log("The number of the members in room " + _roomname + " is " + count);

        callback(count);
    });

}

// ------------------------------------------------------
// close a room
var closeRoom = function(_roomname, db, callback) {
  db.collection('rooms').deleteMany(
    { "roomname" : _roomname },
    function(err, result){
      assert.equal(err, null);
      console.log("The room " + _roomname + " is deleted.");
      callback();
    }
  );

}



var roomname1 = "CultureHub Event";
var username1 = "Jesse";

/*
// create room test call
MongoClient.connect(mongoUrl, function(err, db) {
  assert.equal(null, err);

  var create_success = function(){
    joinRoom(roomname1, username1, db, 
      function(){
        //success
        db.close();

      },function(){
        //error
        db.close();

      }
    );
  }

  var create_error = function(){
    db.close();
  }

  createRoom(roomname1, db, create_success, create_error);
});
*/

/*
// join room test call
MongoClient.connect(mongoUrl, function(err, db) {
  assert.equal(null, err);
  joinRoom(roomname1, username1, db, 
      function(){
        //success
        db.close();

      },function(){
        //error
        db.close();

      }
    );
});
*/

/*
// leave room test call
MongoClient.connect(mongoUrl, function(err, db) {
  assert.equal(null, err);
  leaveRoom(roomname1, username1, db, 
    function(){
      userCount(roomname1, db, 
        function(_count){
          if (_count == 0){
            closeRoom(roomname1, db, 
              function(){
                db.close();
              }
            );

          } else {

            db.close();
          }
      });
    }
  );
});
*/

/*
// user count test call
MongoClient.connect(mongoUrl, function(err, db) {
  assert.equal(null, err);
  userCount(roomname1, db, 
    function(_count){
      console.log(_count);
      db.close();

    }
  );
});
*/



//===============================================================
// Modulization
//===============================================================

module.exports = app;
