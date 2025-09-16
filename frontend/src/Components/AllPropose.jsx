import { useEffect, useState } from "react";
import { ethers } from "ethers";
import DAO_json from '../../../hardhat/artifacts/contracts/DAO.sol/DAO.json'

const AllPropose = ({ }) => {
    const [proposals, setProposals] = useState([]);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const DaoConnect = new ethers.Contract(DAO_json.address, DAO_json.abi, provider);

    const deletedPropose = async (propId) => {
        try {
            // console.log(propId)
            const provaider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provaider.getSigner();
            const Dao = new ethers.Contract(DAO_json.address, DAO_json.abi, signer)

            const tx = await Dao.deletePropose(propId)
            await tx.wait()
            loadAllProposals();

        } catch (error) {
            alert("предложение может удалять только его владелец")
            console.log(error)
        }
    }
    const loadAllProposals = async () => {
        try {
            if (!window.ethereum) return;

            const tx = await DaoConnect.getAllProposals();
            const formatted = tx.map(p => ({
                id: Number(p.id),
                category: Number(p.category),
                voting: {
                    status: Number(p.voting.status),
                    start_time: Number(p.voting.start_time),
                    end_time: Number(p.voting.end_time),
                    description: p.voting.description,
                    count_yes: Number(p.voting.count_yes),
                    count_no: Number(p.voting.count_no),
                    quorum: Number(p.voting.quorum)
                },
                owner: p.owner,
                isActive: p.isActive
            }))

            setProposals(formatted);
        } catch (error) {
            console.error(error);
        }
    };

    const AddVoice = async (idPropose,quorum,variant) => {
        const provaider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provaider.getSigner()
        const Daoconnect = new ethers.Contract(DAO_json.address, DAO_json.abi, signer)
        try {
            if (quorum === 0) {
                if(variant === true){
                    const tx = await Daoconnect.quorumMechanikBigCounter(idPropose, variant)
                    await tx.wait();
                    alert("Успешно проголосовали")
                }
                if(variant === false){
                    const tx = await Daoconnect.quorumMechanikBigCounter(idPropose, variant)
                    await tx.wait();
                    alert("Успешно проголосовали")
                }
            }
            if (quorum === 1) {
                if(variant === true){
                    const tx = await Daoconnect.quarumMechanikSuperMajority(idPropose, variant)
                    await tx.wait();
                    alert("Успешно проголосовали")
                }
                if(variant === false){
                    const tx = await Daoconnect.quarumMechanikSuperMajority(idPropose, variant)
                    await tx.wait();
                    alert("Успешно проголосовали")
                }
            }
            if (quorum === 2) {
                if(variant === true){
                    const tx = await Daoconnect.quorumMechanikVotesByCount(idPropose, variant)
                    await tx.wait();
                    alert("Успешно проголосовали")
                }
                if(variant === false){
                    const tx = await Daoconnect.quorumMechanikVotesByCount(idPropose, variant)
                    await tx.wait();
                    alert("Успешно проголосовали")
                }
            }
        } catch (error) {
            alert("Вы уже голосовали")
            console.error(error)
        }
    }

    // return(
    //     <>
    //         <input type="number" value={idPropose} onChange={(e) => setIdPropose(e.target.value)} />
    //         <select value={variant}
    //         onChange={(e) => setVariant(e.target.value)}>
    //             <option value={true}>True</option>
    //             <option value={false}>False</option>
    //         </select>
    //         <button onClick={AddVoiceYes}>За</button>
    //         <button onClick={AddVoiceNo}>Против</button>
    //     </>
    // )
    useEffect(() => {
        loadAllProposals();
    }, [loadAllProposals]);
    const filterMap = proposals.filter(props => props.voting.status !== 3)
    return (
        <div>
            <h2>Активные предложения</h2>
            {filterMap.map((p) => (
                <div key={p.id}>
                    <p>ID: {p.id}</p>
                    <p>Категория: {p.category}</p>
                    <p>Владелец: {p.owner}</p>
                    <p>Статус: {p.isActive ? "Активно" : "Закрыто"}</p>
                    <p>Голосоавание</p>
                    <p>Статус : {p.voting.status}</p>
                    <p>Начало Голосоавания: {p.voting.start_time}</p>
                    <p>Конец Голосоавания: {p.voting.end_time}</p>
                    <p>Описание: {p.voting.description}</p>
                    <p>За: {p.voting.count_yes}</p>
                    <p>Против: {p.voting.count_no}</p>
                    <p>Тип кворума: {p.voting.quorum}</p>
                    <button onClick={() => deletedPropose(p.id)}>Удалить предложение</button>
                    <button onClick={() =>AddVoice(p.id,p.voting.quorum,true)}>За</button>
                    <button onClick={() => AddVoice(p.id,p.voting.quorum,false)}>Против</button>

                </div>
            ))}
        </div>
    );
};

export default AllPropose;