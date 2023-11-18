import axios from "axios";
import { ethers } from "ethers";
import { RELAYER_URL } from "./utils";

// const RPC_URL = "http://localhost:8547"
 
// const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

export let wallet;
export let contract ;


export const getWallet = () => {
  wallet = ethers.Wallet.createRandom();

  return wallet;
}

export const getBalance = async (walletAddress, setBalance) => {
  setTimeout(async () => {
    let res = await axios.post(RELAYER_URL + "/balance", {
      address: walletAddress
    });
    setBalance(ethers.utils.formatUnits(res.data.balance.toString(), 18));
  }, 1700);
}

export const generateContract = (contractAddress, abi, w) => {
  contract = new ethers.Contract(contractAddress, abi, w);
}
