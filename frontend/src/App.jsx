import { useState } from 'react'
import './App.css'
import { useEffect } from 'react';
import { ethers } from 'ethers';

import profi_json from '../../hardhat/artifacts/contracts/PROFI.sol/PROFI.json'
import RTK_json from '../../hardhat/artifacts/contracts/RTK.sol/RTK.json'
import DAO_json from '../../hardhat/artifacts/contracts/DAO.sol/DAO.json'


import Conectwallet from './Components/ConectWallet'
import AddPropose from './Components/AddPropose'
function App() {
  const [signer, setSigner] = useState();
  const [provaider, setProvaider] = useState();

  const [PROFI, setPROFI] = useState();
  const [RTK, setRTK] = useState();
  const [DAO, setDAO] = useState();

  // const [voting, setVoting] = useState({status: 0,start_time: 0,end_time: 0,description: '',count_yes: 0,count_no: 0,quorum: 0});
  // const [propose, setPropose] = useState({category: 0, voting: voting, owner: '',isActive: false});
  const proposeType = ["none", "A", "B", "C", "D", "E", "F"];
  const votingStatus = ["waiting", "accept", "not_accept", "deleted"];
  const quorumType = ["majority", "super_majority", "votes_by_count"];
  const voiceType = ["none", "Yes", "No"];

  useEffect(() => {
    try {
      if (window.ethereum) {
        const provaider = new ethers.BrowserProvider(window.ethereum);
        setProvaider(provaider);
      } else {
        alert("Установите metamask")
      }

    } catch (error) {
      console.log(error)
    }
  }, [])
  useEffect(() => {
    const profi = new ethers.Contract(profi_json.address, profi_json.abi, provaider)
    setPROFI(profi);
    const rtk = new ethers.Contract(RTK_json.address, RTK_json.abi, provaider)
    setRTK(rtk);
    const dao = new ethers.Contract(DAO_json.address, DAO_json.abi, provaider)
    setDAO(dao);
  }, [])

  return (
    <>
      <AddPropose ethers={ethers} DAO={DAO} signer={signer}/>
      <Conectwallet signer={signer} provaider={provaider} setSigner={setSigner} />
    </>
  )
}

export default App
