var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var logger = require('morgan');
var cors = require('cors');
var fs = require("fs")
var exec = require('child_process').exec;

const http = require('http');
const socketIO = require('socket.io');

const { ethers } = require("ethers");
const RPC_URL = "http://localhost:8547"

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const DEVNODE_URL = "http://localhost:8547";

function logResult(output, socketId) {
  console.log(output);
  console.log(socketId);
}

function execute(command, callback){
  exec(command, function(error, stdout, stderr){ callback(stdout); });
};

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});

io.on("connection", async (socket) => {
  console.log("Connected  " + socket.id);


  /*
    Delete project on disconnect
  */
  socket.on('disconnect', () => {
    console.log(`user disconnected ${socket.id}`);

    /*
      Looks kind of a dangerous
    */
    execute(`rm -rf ./projects/${socket.id}`, (output) => console.log(output));
  });
});

function logOutput(output) {
  console.log(output);
}

function sendTxResult(output, socketId) {
  const fileOutput = fs.readFileSync(`./${socketId}.txt`, 'utf8');

  console.log(fileOutput);
}

function sendFileOutput(output, socketId) {
  const targetSocket = io.sockets.sockets.get(socketId);
  let outputFile = fs.readFileSync(`./projects/${socketId}/output.txt`, 'utf8');


  if (targetSocket) {
      targetSocket.emit('compiled', { message: outputFile });
  } else {
      console.log(`Target socket (${socketId}) not found`);
  }
}

function sendDirectOutput(output, socketId) {
  const targetSocket = io.sockets.sockets.get(socketId);

  if (targetSocket) {
      targetSocket.emit('deployed', { message: output });
  } else {
      console.log(`Target socket (${socketId}) not found`);
  }
}

function sendAbi(output, socketId) {
  const fileOutput = fs.readFileSync(`./projects/${socketId}/output.txt`, 'utf8');
  const targetSocket = io.sockets.sockets.get(socketId);

  if (targetSocket) {
      targetSocket.emit('abi', { message: fileOutput });
  } else {
      console.log(`Target socket (${socketId}) not found`);
  }
}

function sendNewProjectOutput(output, socketId) {
  const fileData = fs.readFileSync(`./projects/${socketId}/src/lib.rs`, 'utf8');
  const mainFileData = fs.readFileSync(`./projects/${socketId}/src/main.rs`, 'utf8');
  
  const targetSocket = io.sockets.sockets.get(socketId);

  if (targetSocket) {
      targetSocket.emit('newproject', { message: output, libData: fileData, mainData: mainFileData });
  } else {
      console.log(`Target socket (${socketId}) not found`);
  }
}

app.get("/", (req, res, next) => {
  let socketId = req.query.socketId;

  // Check if the target socket is connected
  const targetSocket = io.sockets.sockets.get(socketId);

  if (targetSocket) {
      targetSocket.emit('compileResponse', { message: "Compiled" });
  } else {
      console.log(`Target socket (${socketId}) not found`);
  }

  res.json({
    message: "connected"
  });
})


/* Generate new project */
/*
  Send file contents
*/
app.post('/newproject', function(req, res, next) {
  let socketId = req.body.socketId

  execute(`cd projects && cargo stylus new ${socketId}`, (output) => sendNewProjectOutput(output, socketId));

  res.json({ 
    msg: 'Project Generating'
  });
})


/* Compile */
app.post('/compile', function(req, res, next) {
  let socketId = req.body.socketId
  let main = req.body.main;
  let lib = req.body.lib;

  fs.writeFileSync(`./projects/${socketId}/src/main.rs`, main);
  fs.writeFileSync(`./projects/${socketId}/src/lib.rs`, lib);

  execute(`cd projects && cd ${socketId} && cargo stylus check > output.txt 2>&1`, (output) => sendFileOutput(output, socketId));
  
  res.json({ msg: 'Compiling' });
});

/* Read newproject output */
app.post('/newprojectres', function(req, res, next) {
  let socketId = req.body.socketId

  let output = fs.readFileSync(`./projects/${socketId}.txt`, 'utf8');

  res.json({
    output: output
  });
})

/* Read compile output */
app.post('/outputres', function(req, res, next) {
  let socketId = req.body.socketId

  let output = fs.readFileSync(`./projects/${socketId}/output.txt`, 'utf8');

  res.json({
    output: output
  });
})


/* Get abi */
app.post('/getabi', function(req, res, next) {
  let socketId = req.body.socketId

  execute(`cd projects && cd ${socketId} && rm -rf output.txt && cargo stylus export-abi --json > output.txt 2>&1`, (output) => sendAbi(output, socketId));
  
  res.json({ msg: 'Exporting ABI' });
});


/*
  Fund wallet
*/
app.post('/getfund', function(req, res, next) {
  let walletAddress = req.body.address;
  let socketId = req.body.socketId

  execute(`../../nitro-testnode/test-node.bash script send-l2 --to address_${walletAddress} --ethamount 5`, (output) => logOutput(output));


  res.json({
    msg: "Fund request"
  });
});

/*
  Deploy contract
*/
app.post('/deploy', function(req, res, next) {
  let socketId = req.body.socketId
  let privateKey = req.body.privateKey

  execute(`cd projects && cd ${socketId} && rm -rf output.txt && cargo stylus deploy --endpoint ${DEVNODE_URL} --private-key ${privateKey}`, (output) => sendDirectOutput(output, socketId));

  res.json({
    msg: "Deploy request"
  })
});

app.post('/relay', async function(req, res, next) {
  let address = req.body.address
  let abi = req.body.abi
  let privKey = req.body.privKey
  let value = req.body.value
  let inputs = req.body.inputs
  let methodName = req.body.methodName

  wallet = new ethers.Wallet(privKey);
  let signer = wallet.connect(provider);
  contract = new ethers.Contract(address, abi, signer);

  let txres;

  if(inputs.length > 0) {
    let input = value.split(",");
    txres = await contract[methodName](...input);
  } else {
    txres = await contract[methodName]();
  }


  res.json({
    msg: "Send tx",
    data: JSON.stringify(txres,  null, 2)
  })
});

app.post('/balance', async function(req, res, next) {
  let address = req.body.address

  let balance = await provider.send("eth_getBalance", [address, "latest"])


  res.json({
    msg: "Get Balance",
    balance: balance.toString()
  })
});




/*
  TODO:

  - Fix bash message state changes

  - Fix double deployment address change

  - Send transactions

  - Add header

*/