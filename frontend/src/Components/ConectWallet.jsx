// import { useState } from 'react'
import '../App.css'
 import { ethers } from "ethers";

import { useEffect, useState,useCallback } from 'react';

const Conectwallet = ({provaider, setSigner,signer}) =>{

    const check_connect = useCallback(() =>{
        const status = localStorage.getItem('statusAuth');
        console.log(status)
        if(status){
            connect();
        }else(
            setSigner(null)
        )
    })
    const connect = useCallback(async () =>{
        if(provaider){
            const _signer = await provaider.getSigner();
            if(_signer){
                setSigner(_signer);
                localStorage.setItem('statusAuth',1);
                console.log("УСПЕШНО")   
            }
        }
    })
    const disconnect = () => {
        localStorage.removeItem('satusAuth');
        setSigner(null);
    }
    useEffect(()=>{
        check_connect()
    },[])
    return(
       <>
       {signer ? (<>
            <p>{signer.address}</p>
            <button className="disconnect" onClick={() => disconnect()}>Выход</button>
        </>) : (<>
            <button  onClick={() => connect()}>Вход</button>
        </>)}
       </> 
    )
}
export default Conectwallet