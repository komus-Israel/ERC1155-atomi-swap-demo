import { useEffect, useState } from "react"
import Web3 from "web3"
import { loadWeb3, stringToHex, openOrders, withdrawTtokenOrder, withdrawCtokenOrder, depositCtokenOrder, depositTtokenOrder, refundCtokenOrder, refundTtokenOrder, balance } from "../utils/functions"
import { reject } from "lodash"

export const CreateOrders = ({chtlc, thtlc, ttoken, ctoken}) => {

    const [tokenIn, setTokenIn] = useState("ctoken")
    const [tokenOut, setTokenOut] = useState("ttoken")

    const [ctokenReceiver, setCtokenReceiver] = useState("")
    const [ttokenReceiver, setTtokenReceiver] = useState("")

    const [ctokenAmount, setCtokenAmount] = useState("10")
    const [ttokenAmount, setTtokenAmount] = useState("12")
    const [ttokenId, setTtokenId] = useState("5")
    const [ctokenId, setCtokenId] = useState("1")

    const [secret, setSecret] = useState("")
    const [orderId, setOrderId] = useState("")

    const [tokenId, setTokenId] = useState("")


    
    
    
    return (
        <div>
            <h4>Create atomic swap orders</h4>
            

            <input  placeholder="token id"  value={tokenId} onChange={(e)=>setTokenId(e.target.value)}/> <button onClick={()=>balance(tokenId, ttoken, ctoken)}>check balance</button>

            <div>
                <h4>c token receiver</h4>

                    <input placeholder="secret" value={secret} onChange={(e)=>setSecret(e.target.value)}/>
                    <input placeholder="order id" value={orderId} onChange={(e)=>setOrderId(e.target.value)}/>

                    <input placeholder="amount" value = {ctokenAmount} onChange={(e)=>setCtokenAmount(e.target.value)}/>
                    <input placeholder="token id" value = {ctokenId} onChange={(e)=>setCtokenId(e.target.value)}/>
                    <input placeholder="receiver" value= {ctokenReceiver} onChange={(e)=>setCtokenReceiver(e.target.value)}/>
                

            </div>

            <div>
                <h4>t token receiver</h4>

                    <input placeholder="amount" value = {ttokenAmount} onChange={(e)=>setTtokenAmount(e.target.value)}/>
                    <input placeholder="token id" value = {ttokenId} onChange={(e)=>setTtokenId(e.target.value)}/>
                    <input placeholder="receiver" value = {ttokenReceiver} onChange={(e)=>setTtokenReceiver(e.target.value)}/>
                    
                    
            </div>

            <button onClick={async()=>{
                await openOrders(chtlc, thtlc, orderId, ctokenId, ttokenId, ctokenAmount, ttokenAmount, ctokenReceiver, ttokenReceiver, secret)
                setSecret()
                }}>Open Order Across chains</button>

            
        </div>
    )
}



export const MintTokens = ({cTokenContract, tTokenContract}) => {

   
    const { ethereum } = window

    const [token, setToken] = useState("ctoken")
    const [amount, setAmount] = useState("")
    const [recipient, setRecipient] = useState("")

    const web3 = loadWeb3()
    const handleMint = async() => {

        console.log(token)
        
        if (token == "ctoken") {

            try {
                await web3.currentProvider.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: "0xa869"}],
                });
              console.log("You have succefully switched to Avalaunche Test network")
              } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                 console.log("This network is not available in your metamask, please add it")
                }
                console.log(switchError)
                console.log("Failed to switch to the network")
              }

            cTokenContract.methods.createToken(recipient, amount, "", stringToHex(web3, "").hex).send({from: "0x4EF197c64Fc3508c466deDa1E809A366AF0D259A", gas:3000000}).on(
                "receipt", (receipt)=> {
                console.log(receipt)
                alert("token minted on Avalaunche")
            })

            
        
        }
        

        if (token == "ttoken") {



            try {
                await web3.currentProvider.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: "0x2a"}],
                });
              console.log("You have succefully switched to ethereum Test network")
              } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                 console.log("This network is not available in your metamask, please add it")
                }
                console.log("Failed to switch to the network")
              }

             tTokenContract.methods.createToken(recipient, amount, "", stringToHex(web3, "").hex).send({from: "0x4EF197c64Fc3508c466deDa1E809A366AF0D259A", gas:3000000}).on(
                "receipt", (receipt)=> {
                console.log(receipt)
                alert("token minted on ethereum")
            }
            )


        }

        
        

       
          
    }

    return (
        <div>
            <p>Mint</p>
            <input placeholder="recipent" value={recipient} onChange={(e)=>setRecipient(e.target.value)}/>
            <input placeholder="amount" value={amount} onChange={(e)=>setAmount(e.target.value)}/>

            <select value={token} onChange={(e)=>setToken(e.target.value)}>
                <option value="ctoken">ctoken</option>
                <option value="ttoken">ttoken</option>
            </select>

            <button onClick={handleMint}>mint</button>
        </div>
    )
    
}


export const Approve = ({cTokenContract, tTokenContract, web3}) => {

    
    //const chainId = await web3.eth.getChainId()
    

    const approveTHTLC = async() => {
        const account = await web3.eth.getAccounts()
        await tTokenContract.methods.setApprovalForAll("0x008cE9b0873a7798e11eb2230483dbac6Aa8bFB0", true).send({from: account[0]}).on(
            "receipt", (receipt)=>{
                console.log(receipt)
                alert("htlc approved for TToken")
            }
        )
    }

    const approveCHTLC = async() => {
        const account = await web3.eth.getAccounts()
        await cTokenContract.methods.setApprovalForAll("0x843ee4A0e6331859d1f502EFCEdf4aaC7c7EDd50", true).send({from: account[0]}).on("receipt", (receipt)=>{
            console.log(receipt)
            alert("htlc approved for CToken")
        }
        )

    }


   

    return (
        <div>
            <button onClick={approveCHTLC}>Approve CHTLC</button>
            <button onClick={approveTHTLC}>Approve THTLC</button>
        </div>
    )
}


export const Orders = ({chtlc, thtlc, cTokenContract, tTokenContract}) => {

    const [openOrders, setOpenOrders] = useState([])
    const [closedOrders, setClosedOrders]  = useState([])
    const [address, setAddress] = useState()
    const [web3, setWeb3] = useState()
    const [network, setNetwork] = useState()
    const [secret, setSecret] = useState("")

    

    const { ethereum } = window

    useEffect(()=>{

        const loadbc = async() =>{

            const _web3 = await loadWeb3()
            const _address = await _web3.eth.getAccounts()

            setWeb3(_web3)
            setAddress(_address[0])
        }

        loadbc()
        

    })

    //  get the orders and display based on the connected network via an onclick button event

    const handleOpenOrders = async(chain) =>{

    
        

        if (chain == "ethereum") {

            try {
                await ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: "0x2a"}],
                });
                setNetwork("ethereum")
              console.log("You have succefully switched to Ethereum Test network")

            const ethCreatedOrders = await thtlc.getPastEvents(
                "OpenedOrder",
                {
                fromBlock:0, 
                toBlock:"latest"
                }
            )
        
            const ethClosedOrders = await thtlc.getPastEvents(
                "ClosedOrder",
                {
                fromBlock:0, 
                toBlock:"latest"
                }
            )

            const ethExpiredOrders = await thtlc.getPastEvents(
                "RefundOrder",
                {
                fromBlock:0, 
                toBlock:"latest"
                }
            )

            
            

                

        const createdOrdersStream = ethCreatedOrders.map((order)=>order.returnValues)
        const closedOrdersStream = ethClosedOrders.map((order)=>order.returnValues)
        const expiredOrdersStream = ethExpiredOrders.map((order)=>order.returnValues)

        const openOrdersStream = reject(createdOrdersStream, (order)=>{
            const filled = closedOrdersStream.some((filledOrder)=>filledOrder._orderId === order._orderId)
            const expired = expiredOrdersStream.some((expiredOrder) => expiredOrder._orderId === order._orderId)
    
            return filled || expired
        })
                
                setOpenOrders(openOrdersStream)
                
        

              } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                 console.log("This network is not available in your metamask, please add it")
                }
                console.log(switchError)
                console.log("Failed to switch to the network")
              }

            



        }

        if (chain == "ava") {
            try {
                await ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: "0xa869"}],
                });
                setNetwork("ava")
              console.log("You have succefully switched to Avalaunche Test network")

              const ethCreatedOrders = await chtlc.getPastEvents(
                    "OpenedOrder",
                    {
                    fromBlock:0, 
                    toBlock:"latest"
                    }
                )
            
                const ethClosedOrders = await chtlc.getPastEvents(
                    "ClosedOrder",
                    {
                    fromBlock:0, 
                    toBlock:"latest"
                    }
                )

                const ethExpiredOrders = await chtlc.getPastEvents(
                    "RefundOrder",
                    {
                    fromBlock:0, 
                    toBlock:"latest"
                    }
                )

                
                

                    

            const createdOrdersStream = ethCreatedOrders.map((order)=>order.returnValues)
            const closedOrdersStream = ethClosedOrders.map((order)=>order.returnValues)
            const expiredOrdersStream = ethExpiredOrders.map((order)=>order.returnValues)

            const openOrdersStream = reject(createdOrdersStream, (order)=>{
                const filled = closedOrdersStream.some((filledOrder)=>filledOrder._orderId === order._orderId)
                const expired = expiredOrdersStream.some((expiredOrder) => expiredOrder._orderId === order._orderId)
        
                return filled || expired
            })

            
            console.log(openOrdersStream)
            
            setOpenOrders(openOrdersStream)
              } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                 console.log("This network is not available in your metamask, please add it")
                }
                console.log(switchError)
                console.log("Failed to switch to the network")
              }
        }


        

    }


    return (
        <div>
            <button onClick={()=>handleOpenOrders("ethereum")}>View open orders on Ethereum</button>

            <button onClick={()=>handleOpenOrders("ava")}>View closed orders on Avalaunche</button>
            
            <div className="orders">


                {
                    openOrders.length > 0 && openOrders.map((order, index)=>{
                        
                        
                        return (

                            
                            <div key={index} >
                                {
                                    network == "ethereum" ? (
                                        <div className="order">
                                            <span>{order._orderId}</span>
                                                {
                                                    order._ctokenReceiver == address ? (


                                                        <div>
                                                            <button onClick={()=>refundTtokenOrder(thtlc, order._orderId, address)}>Get TToken Refund</button>
                                                            <button onClick={()=>depositTtokenOrder(thtlc, order._orderId, address)}>Deposit TToken</button>
                                                        </div>

                                                           
                                                    ) :

                                                    order._ttokenReceiver == address && (

                                                        <div>

                                                            <input placeholder="secret" value={secret} onChange={(e)=>setSecret(e.target.value)}/>
                                                            <button onClick={()=>{
                                                                withdrawTtokenOrder(thtlc, order._orderId, stringToHex(web3, secret).hex, address)
                                                                }}>withdraw ttoken</button>
        
                                                        </div>

                                                    )

                                                    
                                                    
                                                }

                                                <span>${order._ttokenAmount}</span>
                                        </div>
                                    ) :

                                    (
                                        <div className="order">
                                            <span>{order._orderId}</span>
                                                {
                                                    order._ttokenReceiver == address ? (

                                                        <div>
                                                            <button onClick={()=>refundCtokenOrder(chtlc, order._orderId, address)}>Get CToken Refund</button>
                                                            <button onClick={()=>depositCtokenOrder(chtlc, order._orderId, address)}>Deposit CToken</button>
                                                        </div>

                                                    
                                                        
                                                    ) :

                                                    order._ctokenReceiver == address && (
                                                        <div>
                                                            <input placeholder="secret" value={secret} onChange={(e)=>setSecret(e.target.value)}/>
                                                            <button onClick={()=>{
                                                                withdrawCtokenOrder(chtlc, order._orderId, stringToHex(web3, secret).hex, address)
                                                                setSecret("")
                                                            }}>withdraw ctoken</button>
                                                        </div>
                                                    )

                                                    
                                                    
                                                }

                                                <span>${order._ctokenAmount}</span>
                                        </div>
                                    )
                                }


                            </div>
                        )

                    })
                }
               
                
            </div>
        
        </div>
    )

}
