/* eslint-disable react/no-unescaped-entities */
import { useModal } from "hooks/useModal";
import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import ModalWrapper from "./ModalWrapper";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import RollingSlide from "components/RollingSlider"
import { updateUserData } from "utils/firebase";
import { increment } from "firebase/firestore";

const stages = ["Prepare", "Rolling", "Result"] as const;
type Stage = typeof stages[number];

const MysteryBoxModal = () => {
    const { setModal } = useModal();
    const wallet = useWallet();
    const { connection } = useConnection();

    const [stage, setStage] = useState<Stage>('Prepare');
    const [items, setItems] = useState<RollItem[]>([])

    useEffect(() => {
        if (!wallet.connected) {
            return;
        }

        if(stage != 'Prepare') {
            return;
        }

        (async () => {
            const response = await axios.get(`/api/get-random-mystery-values?user_wallet=${(wallet.publicKey as PublicKey).toBase58()}`);
            setItems(response.data.items);
            // console.log(response.data)
        })();
    }, [wallet, stage]);

    const claim = async () => {
        const win = items[47];
        if(win.type == 'Nothing') {
            setStage('Prepare');
            setModal(false);
        }

        const response = await axios.get(`/api/claim-earning?user_wallet=${(wallet.publicKey as PublicKey).toBase58()}&type=${win.type}&amount=${win.amount}&hash=${win.hash}`);
        // console.log(response.data);
        if (response.data.status != "ok") {
          console.log(response.data.error);
          return;
        }
    
        const tx = Transaction.from(Buffer.from(response.data.data, "base64"));
        // console.log(tx);
        try {
          const txId = await wallet.sendTransaction(tx, connection);
    
          console.log("Transaction sent", txId);

          if(win.type == 'Sol') {
            await updateUserData({
                swapedSol: increment(win.amount),
            })
          }
        //   await connection.confirmTransaction(txId, "confirmed");
        } catch (err) {
          console.log(err);
        }
        
        setStage('Prepare');
        setModal(false);
    }

    return (
        <ModalWrapper>
            {stage == "Prepare" ? <div className="w-full md:h-[420px] bg-gradient-to-b from-[#211C1CFF] to-[#000000B2] rounded-[22px] py-[65px] flex flex-col items-center h-full justify-between">
                <NextImage
                    className="overflow-hidden rounded-lg"
                    src='/market-item.png'
                    alt="Box"
                    width="200px"
                    height="200px"
                />
                {items.length ? <button className="bg-white text-black rounded-[12px] px-[16px] py-[14px] text-[14px] my-5 w-[120px] font-bold" onClick={() => setStage('Rolling')}>
                    Open Now!
                </button>:<></>}
            </div> : stage == "Rolling" ? <div className="w-full md:h-[420px] bg-gradient-to-b from-[#211C1CFF] to-[#000000B2] rounded-[22px] py-[65px] flex flex-col items-center h-full justify-between">
                <div className="w-[90%] md:w-[70%] flex flex-col items-center bg-[#4D4C4C] rounded-[20px] p-8">
                    <RollingSlide items={items} finishedRolling={() => setStage('Result')} />
                    <NextImage
                        className="overflow-hidden"
                        src='/arrow-up.png'
                        alt="Arrow"
                        width="40px"
                        height="30px"
                    />
                </div>
                <button className="bg-white text-black rounded-[12px] px-[16px] py-[14px] text-[14px] my-5 w-[120px] font-bold">
                    Rolling...
                </button>
            </div> : <div className="w-full md:h-[420px] bg-gradient-to-b from-[#211C1CFF] to-[#000000B2] rounded-[22px] py-[65px] flex flex-col items-center h-full justify-between">
                <h1 className="w-[80%] text-center text-white text-[36px] leading-[47px]">
                    {items[47].type == 'Nothing' ? 'You won Nothing. Better luck next time!' : 'Congratulations! You won:'}
                </h1>
                <div className='w-20 flex flex-col justify-center items-center mx-auto'>
                    <img
                        className='w-full rounded-md mx-4 mb-2'
                        src={items[47].type == 'Sol' ? '/roll-sol.png' : items[47].type == 'Gold' ? '/roll-gold.png' : '/roll-nothing.png'}
                        alt={'Image'}
                    />
                    <div>{items[47].type == 'Nothing' ? 'Nothing' : `${items[47].amount} ${items[47].type}`}</div>
                </div>
                <button className="bg-white text-black rounded-[12px] px-[16px] py-[14px] text-[14px] my-5 w-[120px] font-bold" onClick={claim}>
                    {items[47].type == 'Nothing' ? 'Close': 'Claim here!'}
                </button>
            </div>}
        </ModalWrapper>
    );
};

export default MysteryBoxModal;