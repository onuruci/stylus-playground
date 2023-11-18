var express = require('express');
var router = express.Router();
var fs = require("fs")
var exec = require('child_process').exec;
const server = require("http").Server(router)
const io = require("socket.io")(server)
port = process.env.PORT || 8080


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
});


server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});



function logResult(output) {
  console.log(output)
}

function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

router.get('/', function(req, res, next) {
  res.json(({msg: 'Success'}));
});

/* Generate new project */
router.post('/newproject', function(req, res, next) {
  let code = req.body.name;

  execute(`mkdir projects && cd projects && cargo stylus new ${code} > output.txt`, logResult);

  res.json({ msg: 'Compiling' });
})

/* Compile */
router.post('/', function(req, res, next) {
  let code = req.body.code;

  fs.writeFileSync('./projects/newproject/src/lib.rs', code);

  execute("cd projects && cd newproject && cargo stylus check > output.txt 2>&1", logResult);
  
  res.json({ msg: 'Compiling' });
});

router.get('/getabi', function(req, res, next) {

  execute("cd projects && cd newproject && cargo stylus export-abi --json", logResult);
  
  res.json({ msg: 'Compiling' });
});


/*
Get output of the ongoing operation.
Client constantly calls it until it is completed
Mark something when operation is completed.
*/

router.get('/getoutput', function(req, res, next) {

  res.json({
    output: "",
    completed: false
  })
});


module.exports = router;


// Name projects with random strings

// Only support one project for user
// Only support one file for user

// Generate project button
// Generate a wallet on client side
// Fund wallet when generating project

// Have a main.rs and write code there
// Have linter for the code for better styling

// With project generation, generate random string, send it to server to name the project
// Use random string to navigate through the project
// Store string on client local storage

/*
  Generate project is ratherly fast. Just use sockets to send response of it
*/

// Compile, get abi functionalities takes time
// Run these operations on different processes, since they don't need to interact
// During these time taking operations keep writing outputs to a file
// Client will constantly send read operations to this file until operation completed
// Once the operation is completed mark it and send the completed message

// Deploy contract
// When sending deployment after deployment is successfull send get abi
// Dont implement it as another function
// Return contract address, keep checking for abi output and return abi

