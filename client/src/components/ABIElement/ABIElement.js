import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { wallet, contract, getBalance } from "../connection";


const ABIElement = ({name, inputs, outputs, stateMutability, type, bashOutput, setBash, setWalletBalance}) => {
  const [value, setValue] = useState("");
  const handleClick = async() => {
    if(contract) {
      let res 
      if(inputs.length > 0) {
        let input = value.split(",");
        res = await contract[name](...input);
      } else {
        res = await contract[name]();
      }
      setValue("");
      

      setBash(bashOutput + JSON.stringify(res,  null, 2) + "\n");
      getBalance(wallet.address, setWalletBalance);
    }
    
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