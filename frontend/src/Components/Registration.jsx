import { useEffect, useState } from "react";
import { ethers } from "ethers";
import DAO_json from '../../../hardhat/artifacts/contracts/DAO.sol/DAO.json'

const Registration = ({ DAO, signer }) => {
    const [user, setUser] = useState({ owner: '', name: '', status: true })

    const [users, setUsers] = useState([])
    const provider = new ethers.BrowserProvider(window.ethereum);
    const DaoCon = new ethers.Contract(DAO_json.address, DAO_json.abi, provider);

    const addUser = async () => {
        if (!DAO || !signer) {
            alert("DAO или signer не подключенны")
        }
        try {
            const tx = await DAO.AddRegister(user.name)
            await tx.wait()
            alert("Регистрация пройдена")

            console.log(user)
        } catch (error) {
            console.log(user)
            console.log(error)
        }
    }
    const getAllUser = async () => {
        try {
            const tx = await DaoCon.getAllUsers()
            const allUser = tx.map(u => ({
                owner: u.owner,
                name: u.name,
                status: u.status ? "Зарегистрирован" : " Не зарегистрированный"
            }))
            setUsers(allUser)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getAllUser()
    }, [])
    return (
        <>
            {signer&&(
                <>
                    <p></p>
                </>  

            )
            }
            {!signer && (
                <div>
                    <input value={user.name} placeholder="Имя" onChange={(e) => setUser({ ...user, name: e.target.value })} />
                    <button onClick={addUser}>Зарегистрироваться</button>
                </div>

            )}




        </>
    )
}
export default Registration