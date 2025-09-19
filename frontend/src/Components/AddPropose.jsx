import '../App.css'
import { ethers } from "ethers";
import { useEffect, useState, useCallback } from 'react';
const AddPropose = ({ ethers, DAO, signer }) => {
    const [propose, setPropose] = useState({
        category: 1,
        voting: {
            status: 0,
            start_time: 0,
            end_time: 0,
            description: '',
            count_yes: 0,
            count_no: 0,
            quorum: 0
        },
        owner:'',
        isActive: true
    })
    const addPropose = async () => {
        if (!DAO || !signer) {
            alert("DAO или signer не подключены");
            return;
        }
        try {
            // const DaoConnect = DAO.connect(signer)
            if(propose.voting.quorum ===1|| propose.voting.quorum ===2 && propose.status ===3){
            }
            const tx = await DAO.AddPropose(
                propose.category,
                propose.voting.end_time,
                propose.voting.description,
                propose.voting.quorum,
            )
            await tx.wait();
            alert("Предложение добавленно")
        } catch (error) {
            alert(error)
            console.log(error)
        }
    }
    return (
        <>
        <h1>ФОРМА ДЛЯ ДОБАВЛЕНИЯ ПРЕДЛОЖЕНИЯ</h1>
            <p>Второе поле ввода это через сколько закончиться предложение.Вводить секунды (1час-3600с 1мин-60с)</p>
            <select value={propose.category}
                onChange={(e) => setPropose({ ...propose, category: Number(e.target.value) })}>
                <option value={1}>A</option>
                <option value={2}>B</option>
                <option value={3}>C</option>
                <option value={4}>D</option>
                <option value={5}>E</option>
                <option value={6}>F</option>
            </select>
            <input value={propose.voting.end_time}
                type='number'
                onChange={(e) => setPropose({ ...propose, voting: { ...propose.voting, end_time: Number(e.target.value) } })} />
            <input value={propose.voting.description}
                type='text'
                onChange={(e) => setPropose({ ...propose, voting: { ...propose.voting, description: e.target.value } })}
                placeholder='Описание' />
            <select value={propose.voting.quorum}
                onChange={(e) => setPropose({ ...propose, voting: { ...propose.voting, quorum: Number(e.target.value) } })}>
                <option value={0}>majority</option>
                <option value={1}>super_majority</option>
                <option value={2}>votes_by_count</option>
            </select>
            <button onClick={addPropose}>Добавить предложение</button>
        </>
    )
}
export default AddPropose