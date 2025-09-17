import { useState } from 'react'
import './App.css'
import { useEffect,useLayoutEffect  } from 'react';
import { ethers } from 'ethers';

import profi_json from '../../hardhat/artifacts/contracts/PROFI.sol/PROFI.json'
import RTK_json from '../../hardhat/artifacts/contracts/RTK.sol/RTK.json'
import DAO_json from '../../hardhat/artifacts/contracts/DAO.sol/DAO.json'


import Conectwallet from './Components/ConectWallet'
import AddPropose from './Components/AddPropose'
import AllPropose from './Components/AllPropose';
import Registration from './Components/Registration'
import Cabinet from './Components/Cabinet'

function App() {
  const [signer, setSigner] = useState();
  const [provaider, setProvaider] = useState();

  const [PROFI, setPROFI] = useState();
  const [RTK, setRTK] = useState();
  const [DAO, setDAO] = useState();


useLayoutEffect(() => {
  const setupContracts = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const profi = new ethers.Contract(profi_json.address, profi_json.abi, signer);
    setPROFI(profi);

    const rtk = new ethers.Contract(RTK_json.address, RTK_json.abi, signer);
    setRTK(rtk);

    const dao = new ethers.Contract(DAO_json.address, DAO_json.abi, signer);
    setDAO(dao);

    setSigner(signer);
    setProvaider(provider);
  };

  setupContracts();
}, []);
  
  return (
    <>
      <Cabinet RTK ={RTK} PROFI={PROFI} signer={signer} provaider={provaider}/>
      <Registration DAO={DAO} signer={signer}/>
      <AddPropose ethers={ethers} DAO={DAO} signer={signer}/>
      <Conectwallet signer={signer} provaider={provaider} setSigner={setSigner} />
      <AllPropose signer={signer} DAO={DAO} provaider={provaider}/>
    </>
  )
}

export default App
