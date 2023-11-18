import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { wallet, contract, getBalance } from "../connection";
import { RELAYER_URL } from "../utils";
import axios from "axios";


const ABIElement = ({name, inputs, outputs, abi, stateMutability, type, bashOutput, setBash, setWalletBalance}) => {
  const [value, setValue] = useState("");
  const handleClick = async() => {
    let res = await axios.post(RELAYER_URL + "/relay",{
      address: contract.address,
      abi: abi,
      privKey: wallet.privateKey,
      value: value,
      inputs: inputs,
      methodName: name
    } )

    console.log(res.data.data);

    setBash(bashOutput + res.data.data + "\n");
    setValue("");
    //getBalance(wallet.address, setWalletBalance);
  }

  return(
    <div className="bg-indigo-400 p-2 font-mono" >
      <div className="bg-orange-500 w-32 text-white p-2 cursor-pointer" onClick={() => handleClick()}>
        {name}
      </div>

      {
        inputs.length > 0 &&
        <div>
          <input className="mt-5" placeholder={inputs.map(el => el.type)} value={value} onChange={e => setValue(e.target.value)}/>
        </div>
        
      }
      
    </div>
  )
};

export default ABIElement;