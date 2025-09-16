import '../App.css'
import { ethers } from "ethers";

import { useEffect, useState, useCallback } from 'react';
// import DAO_json from '../../../hardhat/artifacts/contracts/DAO.sol/DAO.json'
// const AllPropose = ({ DAO, signer,provaider }) => {
//     const [proposeId, setProposeId] = useState(0)
//     const [proposals, setProposes] = useState([])

//     const getPropose = async () => {
//         try {
//             // const DaoConnect = DAO.connect(signer)
//             const dao = new ethers.Contract(DAO_json.address, DAO_json.abi, provaider)
//             const tx = await dao.getAllProposals()

//             const formatted = tx.map(p => ({
//                 id: Number(p.id),
//                 category: p.category,
//                 owner: p.owner,
//                 isActive: p.isActive
//             }));


//             setProposes(formatted)

//         } catch (error) {
//             console.log(error)
//         }
//     }
//     useEffect(() => {
//     getPropose();
//   }, []);
//     return (
//         <div>
//             <h2>Активные предложения</h2>
//             {proposals.map(p => (
//                 <div key={p.id}>
//                     <p>ID: {p.id}</p>
//                     <p>Категория: {p.category}</p>
//                     <p>Владелец: {p.owner}</p>
//                     <p>Статус: {p.isActive ? "Активно" : "Закрыто"}</p>
//                 </div>
//             ))}
//         </div>
//     )
// }
// export default AllPropose
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
import DAO_json from '../../../hardhat/artifacts/contracts/DAO.sol/DAO.json'

const AllPropose = ({}) => {
  const [proposals, setProposals] = useState([]);

  const loadAllProposals = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const DaoConnect = new ethers.Contract(DAO_json.address, DAO_json.abi, provider);

      const tx = await DaoConnect.getAllProposals();
        console.log(tx)
      const formatted = tx.map(p => {
        return {
            id: Number(p.id),
            category: p.category,
            owner: p.owner,
            isActive: p.isActive

      }
      });

      setProposals(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAllProposals();
  }, [loadAllProposals]);

  return (
    <div>
      <h2>Активные предложения</h2>
      {proposals.map((p) => (
        <div key={p.id}>
          <p>ID: {p.id}</p>
          <p>Категория: {p.category}</p>
          <p>Голосование: {p.voting}</p>
          <p>Владелец: {p.owner}</p>
          <p>Статус: {p.isActive ? "Активно" : "Закрыто"}</p>
        </div>
      ))}
    </div>
  );
};

export default AllPropose;