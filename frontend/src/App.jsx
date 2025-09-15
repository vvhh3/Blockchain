import { useState } from 'react'
import './App.css'
import Conectwallet from './Components/ConectWallet'
import { useEffect } from 'react';
import { ethers } from 'ethers';
function App() {
    const [signer,setSigner] = useState();
    const[provaider,setProvaider] = useState();

    useEffect(()=>{
      try{
        if(window.ethereum){
          const provaider = new ethers.BrowserProvider(window.ethereum);
          setProvaider(provaider);
        }else{
          alert("Установите metamask")
        }

      }catch(error){
        console.log(error)
      }
    },[])

  return (
    <>
    <Conectwallet signer={signer} provaider={provaider} setSigner={setSigner}/>
    </>
  )
}

export default App
