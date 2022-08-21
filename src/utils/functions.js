import Web3 from "web3";
import { ethers } from "ethers";
import * as ctoken from "./CTOKEN.json";
import * as ttoken from "./TTOKEN.json";
import * as htlc from "./HTLC.json";
import { chain, truncate } from "lodash";

export const setEthereumTokenContract= async()=>{
    const provider = new Web3(Web3.givenProvider)
    const contract = new provider.eth.Contract(ttoken.abi, ttoken.networks["42"].address)
    
    return contract;
}

export const setTHTLC = async() => {
    const provider = new Web3(Web3.givenProvider)
    const contract = new provider.eth.Contract(htlc.abi, htlc.networks["42"].address)
    return contract;
}

export const setCHTLC = async() => {
    const provider = new Web3(Web3.givenProvider)
    const contract = new provider.eth.Contract(htlc.abi, htlc.networks["43113"].address)
    return contract;
}


export const setAvalauncheTokenContract= async()=>{
    //Web3.providers.HttpProvider.prototype.sendAsync =
    //Web3.providers.HttpProvider.prototype.send
    const provider = new Web3(Web3.givenProvider)
    const contract = new provider.eth.Contract(ctoken.abi, ctoken.networks["43113"].address)
    return contract;
}

export const stringToHex = (web3, string)=>{

    const hex = web3.utils.asciiToHex(string)
    return { string, hex }

}

export const hashSecret =(secretPhrase)=>{

    const web3 = new Web3(Web3.givenProvider)

    const secretHex = stringToHex(web3, secretPhrase).hex
    const dataHex = web3.eth.abi.encodeParameter("bytes32", secretHex)
    const secretHash = ethers.utils.sha256(dataHex)

    //  return the secret phrase and its encoded data
    return { secretHex, secretHash}

}

export const loadWeb3 = () => {
    const web3 = new Web3(Web3.givenProvider)
    return web3
}


export const openOrders = async(chtlc, thtlc, _orderId, _ctokenId, _ttokenId, _ctokenAmount, _ttokenAmount,_ctokenReceiver, _ttokenReceiver, _secretPhrase) => {

   
    const { ethereum } = window
    const secretHash = hashSecret(_secretPhrase).secretHash
    const secretKey = hashSecret(_secretPhrase).secretHex

    const web3 = await loadWeb3()
    
    const account = await web3.eth.getAccounts()

    console.log(secretKey)

    const openTHTLC = await thtlc.methods.openOrder(_orderId, _ctokenId, _ttokenId, _ctokenAmount, _ttokenAmount, _ctokenReceiver, _ttokenReceiver, secretKey, secretHash).send({from: account[0]})
   
    await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: "0xa869"}],
        })

    const openCHTLC = await chtlc.methods.openOrder(_orderId, _ctokenId, _ttokenId, _ctokenAmount, _ttokenAmount, _ctokenReceiver, _ttokenReceiver, secretKey, secretHash).send({from: account[0]})

   

    alert("order opened successfully")
    console.log(openTHTLC)
    console.log(openCHTLC)

}





export const fetchOpenOrders = async (web3Eth, web3Ava, address) => {

    const ethOpenOrders = await web3Eth.getPastEvents(
        "Openedorder",
        {
        filter: {_ctokenReceiver: address, _ttokenReceiver: address},
        fromBlock:0, 
        toBlock:"latest"
    }
    )

    const avaOpenOrders = await web3Ava.getPastEvents(
        "Openedorder",
        {
        filter: {_ctokenReceiver: address, _ttokenReceiver: address},
        fromBlock:0, 
        toBlock:"latest"
    }
    )

    return { ethOpenOrders, avaOpenOrders }

}


export const filterOutReason=(err)=>{
    var errorMessageInJson = JSON.parse(
        err.message.slice(58, err.message.length - 2)
      );

      var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;

      return errorMessageToShow
}

export const withdrawTtokenOrder=async(thtlc, orderId, secret, address)=>{
    try {
        const withdrawal = await thtlc.methods.withdrawOrder(orderId, secret).send({from:address})
        
        alert("Ttoken withdrawn successfully")

        console.log(withdrawal)
    }   catch (err) {
        
        const errMessage = filterOutReason(err)
        alert(errMessage)
        
    }
}

export const refundTtokenOrder=async(thtlc, orderId, address)=>{
    try {
        const refund = await thtlc.methods.refundOrder(orderId).send({from:address})
        
        alert("ttoken refunded successfully")
        console.log(refund)
    }   catch (err) {
        const errMessage = filterOutReason(err)
        alert(errMessage)
    }
}

export const depositTtokenOrder=async(thtlc, orderId, address)=>{
    try {
        const deposit = await thtlc.methods.depositOrder(orderId).send({from:address})
        
        alert("ttoken deposited successfully")
        console.log(deposit)
    }   catch (err) {
        const errMessage = filterOutReason(err)
        alert(errMessage)
    }
}

export const withdrawCtokenOrder=async(chtlc, orderId, secret, address)=>{
    try {
        const withdrawal = await chtlc.methods.withdrawOrder(orderId, secret).send({from:address})
        alert("Ctoken withdrawn successfully")
        console.log(withdrawal)
    }   catch (err) {
        console.log(err)
        const errMessage = filterOutReason(err)
        alert(errMessage)
        console.log(err)
    }
}

export const refundCtokenOrder=async(chtlc, orderId, address)=>{
    try {
        const refund = await chtlc.methods.refundOrder(orderId).send({from:address})
        
        alert("ctoken refunded successfully")
        console.log(refund)
    }   catch (err) {
        const errMessage = filterOutReason(err)
        alert(errMessage)
    }
}

export const depositCtokenOrder=async(chtlc, orderId, address)=>{
    try {
        const deposit = await chtlc.methods.depositOrder(orderId).send({from:address})
        
        alert("ctoken deposited successfully")

        console.log(deposit)
    }   catch (err) {
        const errMessage = filterOutReason(err)
        alert(errMessage)
    }
}

export const checkOrder=async(orderId, htlc, web3)=>{

    //web3.eth.handleRevert = true

    
    const order = await htlc.methods.checkOrder(orderId).call()
    alert(web3.utils.hexToUtf8(order._secretKey))
    console.log(order)
    
   

   
    
    

    
}


export const balance = async(id, ttoken, ctoken)=>{

    const web3 = await loadWeb3()
    const chainId = await web3.eth.getChainId()
    const account = await web3.eth.getAccounts()

    console.log(chainId)
    

    if (chainId == 42) {
        const balance = await ttoken.methods.balanceOf(account[0], id).call()
        alert(balance)
    }

    if (chainId == 43113) {
        const balance = await ctoken.methods.balanceOf(account[0], id).call()
        alert(balance)
    }


    

}



