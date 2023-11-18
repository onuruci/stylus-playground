import { ethers } from "ethers";
const RPC_URL = "http://localhost:8547"

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

export let wallet;
export let contract ;


export const getWallet = () => {
  wallet = ethers.Wallet.createRandom();

  return wallet;
}

export const getBalance = async (walletAddress, setBalance) => {
  setTimeout(async () => {
    let balance = await provider.send("eth_getBalance", [walletAddress, "latest"])
    setBalance(ethers.utils.formatUnits(balance.toString(), 18));
  }, 1000);
}

export const generateContract = (contractAddress, abi, w) => {
  let signer = w.connect(provider);
  contract = new ethers.Contract(contractAddress, abi, signer);
}