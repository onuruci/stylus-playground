import React from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import ABIElement from './components/ABIElement';
import Tab from './components/Tab';
import Editor from './components/Editor/Editor';
import MonacoEditor from 'react-monaco-editor';
import { ethers } from "ethers";
import { wallet, getWallet, getBalance, contract, generateContract } from './components/connection';

const URL = "http://localhost:5000"
const socket = io('http://localhost:5000'); // Replace with your server URL
var files = [{name: "main.rs", content: ""},{name: "lib.rs", content: ""}];
var fileName = "main";


function App() {
  const [code, setCode] = useState("");
  const [bashOutput, setBashOutput] = useState("Starting..\n");
  const [operating, setOperating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [abiElements, setABIElements] = useState([]);
  const [walletBalance, setWalletBalance] = useState("0");
  const [deploymentCount, setDeploymentCount] = useState(0);
  const [deploymentAddress, setDeploymentAddress] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(0);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  const handleCompile = async () => {
    let res = await axios.post(URL + "/compile", {
      main: files[0].content,
      lib: files[1].content,
      socketId: socket.id
    });

    setOperating(true);

    setBashOutput(bashOutput + res.data.msg);
  }

  const handleGetABI = async () => {
    let res = await axios.post(URL + "/getabi", {
      socketId: socket.id
    });

    setOperating(true);

    setBashOutput(bashOutput + res.data.msg);
  }

  const newProject = async() => {
    let res = await axios.post(URL + "/newproject", {
      socketId: socket.id
    });

    let resFund = await axios.post(URL + "/getfund", {
      address: wallet.address,
      socketId: socket.id
    });

    console.log(resFund);
  }
  
  const handleDeploy = async () => {
    let res = await axios.post(URL + "/deploy", {
      socketId: socket.id,
      privateKey: wallet.privateKey
    });

    console.log(res);
  }

  const handleNewFile = () => {
    let newFiles = [...files, {name: newFileName, content: ""}]
    files = [...newFiles];
    setNewFileName("")
  }

  const handleTabChange = (newi) => {
    console.log("NEW TAB: ",newi);
    setSelectedFile(newi);
    console.log(selectedFile);
    if(fileName === "main") {
      fileName = "lib";
    } else {
      fileName = "main";
    }
  }

  const handleCodeChange = (cont) => {
    if(fileName === "main") {
      files[0].content = cont;
    } else {
      files[1].content = cont;
    }
  }


  /*
    Get output while compiling
  */
  const getOutput = async (endpoint) => {
    let res = await axios.post(URL + endpoint, {
      socketId: socket.id
    });

    console.log(res);
    setBashOutput(bashOutput + res.data.output);
  }

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if(operating) {
        getOutput("/outputres");
      } else if(generating) {
        getOutput("/newprojectres");
      }
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(intervalId);
    };
  }, [operating, generating])

  useEffect(() => {
    getWallet();
  }, []);

  /*
    Scroll to bottom whenever 
  */
  useEffect(() => {
    scrollToBottom();
  }, [bashOutput]);

   useEffect(() => {
        socket.on('compiled', (data) => {
          setOperating(false);
          setBashOutput(bashOutput + data.message)
        });

        socket.on('deployed', (data) => {
          setBashOutput(bashOutput + data.message)
          getBalance(wallet.address, setWalletBalance);
        });

        socket.on('abi', (data) => {
          setOperating(false);
          console.log("DATA ABI:  ",data);
          handleDeploy();
          setBashOutput(bashOutput + data.message)
          let lines = data.message.split('\n');
          let json = lines[lines.length - 2];
          let abi = JSON.parse(json);

          setABIElements([...abi]);

          let address = ethers.utils.getContractAddress({from: wallet.address, nonce: deploymentCount});
          setDeploymentCount( deploymentCount + 1);
          setDeploymentAddress(address);

          generateContract(address, abi, wallet);
        });

        socket.on('newproject', (data) => {
          setGenerating(false);
          //setCode(data.data);
          files[0].content = data.mainData;
          files[1].content = data.libData; 
          setBashOutput(bashOutput + data.message)
          getBalance(wallet.address, setWalletBalance);
        });

        // Clean up the event listeners when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []); // Emp

  return (
    <div>
      <h1 className='text-4xl font-bold text-center p-4'>
        Online Stylus Playground
      </h1>
      <div className='flex'>
        <div className='flex flex-col w-80 p-4 pt-0 gap-8 border-r-4 border-indigo-700 overflow-y-scroll h-128'>
          <div className='flex flex-col gap-8 border-b-2 p-4 pt-0'>
            <button className='bg-indigo-700 w-56 mx-auto p-4 text-white rounded-md' onClick={() => newProject()}>
              New Project
            </button>
            <button className='bg-indigo-700 w-56 mx-auto p-4 text-white rounded-md' onClick={() => handleCompile()}>
              Compile
            </button>
            <button className='bg-indigo-700 w-56 mx-auto p-4 text-white rounded-md' onClick={() => handleGetABI()}>
              Deploy
            </button>
          </div>
          <div>
            <div>
            Address: {
              wallet && wallet.address.slice(0,7) + "..." + wallet.address.slice(-5)
            }
            </div>
            <div>
              Balance: {walletBalance} Ether
            </div>
          </div>
          <div>
            <div>Deployment Address</div>
            <div className='font-mono'>{deploymentAddress.slice(0,10)+"..."+deploymentAddress.slice(-10)}</div>
          </div>
          <div>
            <div>Ether Value</div>
            <input placeHolder="Ether Amount" className='border-2 border-indigo-700'/>
          </div>
          {
            abiElements.map(
              (element,i) => {
                console.log(element);
                return(
                  <ABIElement
                    key={i}
                    name={element.name}
                    inputs={element.inputs}
                    outputs={element.outputs}
                    stateMutability={element.stateMutability}
                    type={element.type}
                    bashOutput={bashOutput}
                    setBash={setBashOutput}
                    setWalletBalance={setWalletBalance}
                  />
                )
              }
            )
          }
        </div>
        <div className='w-7/12 h-3/6 ml-auto mr-56'>
          <div className='flex flex-row'>
            {
              files.map((file,ind) => {
                return(
                  <Tab
                    key={file.name}
                    name={file.name}
                    index={ind}
                    selected={ind === selectedFile}
                    handleTabChange={() => handleTabChange(ind)}
                  />
                )
              })
            }
            
          </div>
           <MonacoEditor
              width="1200"
              height="700"
              language="rust"
              theme="vs-dark"
              value={files[selectedFile].content}
              onChange={e => handleCodeChange(e)}
          />
        <textarea className='bg-gray-700 text-white w-1200 h-40 font mono overflow-y-scroll resize-none' ref={textareaRef} value={bashOutput} disabled>

        </textarea>
        </div>
        

        
      </div>
    </div>
  );
}

export default App;


// Send ether value to abi element

// Accept inputs