import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Cabinet = ({ PROFI, RTK, signer,provaider }) => {
    const [balancePROFi, setBalanceProfi] = useState(0)
    const [balanceRTK, setBalanceRTK] = useState(0)
    const [balanceWei,setBalanceWei] = useState(0)
    const [valueRTk,setValueRTK] = useState(0)
    const getBalance = async () => {
        if (!PROFI || !signer) return
        try {
            const newBalanceProfi = await PROFI.balanceOf(signer.address)
            const parsedProfi = Number(newBalanceProfi) / 10 ** 12;
            setBalanceProfi(parsedProfi)

            const newBalanceRTK = await RTK.balanceOf(signer.address)
            const parsedRTK = Number(newBalanceRTK) / 10 ** 12;
            setBalanceRTK(parsedRTK)

            const newBalanceWei = await provaider.getBalance(signer.address)
            const parsedWei = Number(newBalanceWei) /10**18;
            setBalanceWei(parsedWei)

        } catch (error) {
            console.log(error)
        }
    }
    const BuyToken = async (value) => {
        if(!isNaN(Number(value)) && Number(value >=1));
        const tx = await RTK.buyToken({value:String(Number(value * 10**18))});
        await tx.wait()
    }
    useEffect(() => {``
        getBalance();
    }, [PROFI, signer])
    return (
        <>
        <p>Личный кабинет</p>
            {signer && (<>
                <p>Баланс PROFi:{balancePROFi}</p>
                <p>Баланс RTK:{balanceRTK}</p>
                <p>Баланс Wei:{balanceWei}</p>
                <input type="number" value={valueRTk} onChange={(e) => setValueRTK(e.target.value)}/>
                <button onClick={() => BuyToken(valueRTk)}>Купить RTK коины</button>

            </>)}
            {!signer && (<>
            <p>Вы не вошли в аккаунт</p>
            </>)}

        </>
    )
}
export default Cabinet