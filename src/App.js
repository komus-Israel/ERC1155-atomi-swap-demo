import logo from './logo.svg';
import React, { useState, useEffect } from 'react'
import { setEthereumTokenContract, setAvalauncheTokenContract, setCHTLC, setTHTLC, connectwallet, checkOrder, loadWeb3 } from './utils/functions';
import { CreateOrders, MintTokens, Approve, Orders } from './components/orders';
import './App.css';

function App() {

  const [ethereumRPC, setEthereum] = useState()
  const [avalauncheRPC, setAvalaunche] = useState()
  const [ethOpenOrders, setEthOpenOrders] = useState([])
  const [ethClosedOrders, setClosedOpenOrders] = useState([])
  const [avaOpenOrders, setAvaOpenOrders] = useState([])
  const [avaClosedOrders, setAvaClosedOrders] = useState([])
  const [chainId, setChainId] = useState()
  const { ethereum } =  window 
  const [orderId, setOrderId] = useState("")

  const [chtlc, setChtlc] = useState()
  const [thtlc, setThtlc] = useState()
  const [web3, setWeb3] = useState()

  const avalaunceLocalChainId = "0xa868"
  const ethLocalChainId = "0x539"

  


  useEffect(() => {

    if (!ethereum) {
      console.log("metamask not installed")
    }

    const rpcs = async()=>{

      

      const ethRPC= await setEthereumTokenContract()
      const avaRPC = await setAvalauncheTokenContract()
      const _chainId = await ethereum.request({ method: "eth_chainId" });
      const _chtlc = await setCHTLC()
      const _thtlc = await setTHTLC()
      const _web3 = await loadWeb3()
      

      setEthereum(ethRPC)
      setAvalaunche(avaRPC)
      setChainId(_chainId)
      setChtlc(_chtlc) 
      setThtlc(_thtlc)   
      setWeb3(_web3)

  
    }

    rpcs()
    
    
    

    
    
  }, [ethereumRPC, avalauncheRPC])
  

  
  return (
    <div>
      <center><h2>Atomic swap</h2></center>

      <button>Connect wallet</button>
      <button onClick={()=>checkOrder(orderId, thtlc, web3)} >check Secret on ethereum</button>
      <button onClick={()=>checkOrder(orderId, chtlc, web3)}>check Secret on avalaunche</button>
      <input value={orderId} onChange={(e)=>setOrderId(e.target.value)}/>
      <Approve cTokenContract={avalauncheRPC} tTokenContract={ethereumRPC} web3={web3}/>
      <MintTokens cTokenContract={avalauncheRPC} tTokenContract={ethereumRPC} />
      <CreateOrders chtlc={chtlc} thtlc={thtlc} ctoken={avalauncheRPC} ttoken={ethereumRPC}/>

      <h3>Orders</h3>
      <Orders chtlc = {chtlc} thtlc={thtlc} cTokenContract={avalauncheRPC} tTokenContract={ethereumRPC}/>
    </div>
  );
}

export default App;
