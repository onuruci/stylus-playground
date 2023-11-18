var express = require('express');
var router = express.Router();

const { ethers } = require("ethers");
const RPC_URL = "http://localhost:8547"

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    msg: "Relayer connected"
  });
});


router.post('/relay', async function(req, res, next) {
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

router.post('/balance', async function(req, res, next) {
  let address = req.body.address

  let balance = await provider.send("eth_getBalance", [address, "latest"])


  res.json({
    msg: "Get Balance",
    balance: balance.toString()
  })
});

module.exports = router;
