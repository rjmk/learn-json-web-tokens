var qs   = require('querystring');
var fs   = require('fs');
var path = require('path');


var secret = process.env.JWT_SECRET || "CHANGE_THIS_TO_SOMETHING_RANDOM"; // super secret

function loadView(view) {
  var filepath = path.resolve(__dirname + '../../views/' + view + '.html');
  return fs.readFileSync(filepath).toString();
}

// Content
var index      = loadView('index');      // default page
var restricted = loadView('restricted'); // only show if JWT valid
var fail       = loadView('fail');       // auth fail

function authFail(res, callback) {
  res.writeHead(401, {'content-type': 'text/html'});
  return res.end(fail);
}

function authSuccess(req, res) {

  res.writeHead(200, {
    'content-type': 'text/html',
  });
  return res.end(restricted);
}

function validate (req, res) {
  console.log(req.headers.authorization, req.headers.Authorization);
  authFail(res);
}

// lookup person in "database"
var u = { un: 'masterbuilder', pw: 'itsnosecret' };

// handle authorisation requests
function authHandler(req, res){
  if (req.method === 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      if(post.username && post.username === u.un && post.password && post.password === u.pw) {
        return authSuccess(req, res);
      } else {
        return authFail(res);
      }
    });
  } else {
    return authFail(res);
  }
}

function exit(res) {
  res.writeHead(404, {'content-type': 'text/plain'});
  res.end('bye');
  process.exit(); // kill the server!
}

function notFound(res) {
  res.writeHead(404, {'content-type': 'text/plain'});
  return res.end('Not Found');
}

function home(res) {
  res.writeHead(200, {'content-type': 'text/html'});
  return res.end(index);
}

function done(res) {
  return; // does nothing. (pass as callback)
}

function logout(req, res, callback) {
  // invalidate the token
  var token = req.headers.authorization;
  // console.log(' >>> ', token)
  authFail(res, done);
  return callback(res);
}


module.exports = {
  fail : authFail,
  exit: exit,
  done: done, // moch callback
  home: home,
  handler : authHandler,
  logout : logout,
  notFound : notFound,
  success : authSuccess,
  validate: validate,
  view : loadView,
}
