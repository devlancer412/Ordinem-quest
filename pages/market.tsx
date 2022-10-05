import { useState } from 'react';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { NextPage } from "next";
import NextImage from "next/image";
import axios from "axios";
import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import { getCurrentUserData, updateUser } from "utils/firebase";
import MysteryBoxModal from "components/modal/MysteryBoxModal";
import { useModal } from "hooks/useModal";
import { createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { myLoader } from "utils/constants";
import CreatePromoteEventModal from "components/modal/CreatePromoteEventModal";

type Item = {
  image: string;
  name: string,
  desc: string,
  price: number,
}

const items: Item[] = [
  {
    image: "/market-item.png",
    name: "TREASURE CHEST",
    desc:
      "Feeling lucky? Take a gamble and test your luck by having a chance to win whitelist spots, solana, pricey nft's or even nothing!",
    price: 250,
  },
];

async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return await getAssociatedTokenAddress(tokenMintAddress, walletAddress);
}

const Market: NextPage = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { setModal } = useModal();
  const { tokens, setTokens } = useSolanaNfts();
  const [modalMode, setModalMode] = useState<Boolean>(false);

  const buyBox = async (item: Item) => {
    if (!wallet.connected) {
      console.error("not connected");
      return;
    }

    const response = await axios.get(
      `/api/get-buy-box?price=${item.price}&user_wallet=${(
        wallet.publicKey as PublicKey
      ).toBase58()}`
    );

    if (response.data.status != "ok") {
      console.log(response.data.data);
      return;
    }

    if (response.data.needTx) {
      setTokens(0);
      const tx = new Transaction();

      const mintAddress = new PublicKey(process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS as string);

      const fromAddress = wallet.publicKey as PublicKey;
      const toAddress = new PublicKey(process.env.NEXT_PUBLIC_WALLET_ADDRESS as string);

      const fromTokenAccount = await findAssociatedTokenAddress(
        fromAddress,
        mintAddress
      );

      const toTokenAccount = await findAssociatedTokenAddress(
        toAddress,
        mintAddress
      );

      const amount = response.data.restAmount * 10 ** 8;

      tx.add(
        createTransferCheckedInstruction(
          fromTokenAccount,
          mintAddress,
          toTokenAccount,
          fromAddress,
          amount, // amount to transfer
          8, // decimals of token
        )
      );
      const mconnection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
      const { blockhash } = await mconnection.getLatestBlockhash();

      tx.feePayer = fromAddress;
      tx.recentBlockhash = blockhash;

      try {
        const txId = await wallet.sendTransaction(tx, mconnection);

        console.log("Transaction sent", txId);
        const user = await getCurrentUserData();
        await updateUser(user._id, {
          tokensWithdrawable: 0,
        });
      } catch (err) {
        console.log(err);
        return;
      }
    }

    setTokens(tokens - item.price);

    setModalMode(true);
    setModal(true);
  };

  const newPromoteTweet = () => {
    setModalMode(false);
    setModal(true);
  }

  return (
    <>
      <div className="full-body fixed top-0 left-0 -z-40">
        <NextImage
          src="/market-bg.png"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="w-full flex flex-col items-center">
        <div className="w-1/2 bg-gray-500 rounded-[50px] py-7 px-auto bg-[url('/promote.png')] mb-10 min-w-[300px] bg-cover">
          <h1 className="bg-[#454545B2] py-[10px] rounded-full font-bold text-white text-[20px] leading-[150%] text-center w-[195px] mx-auto hover:cursor-pointer" onClick={newPromoteTweet}>
            Promote Tweet
          </h1>
        </div>
        <ItemsComponent items={items} onBuy={buyBox} />
      </div>
      {modalMode ? <MysteryBoxModal /> : <CreatePromoteEventModal />}
    </>
  );
};

interface Props {
  items: Item[];
  onBuy: (item: Item) => void;
}

const ItemsComponent: React.FC<Props> = ({ items, onBuy }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5 justify-items-center">
      {items &&
        items.length > 0 &&
        items.map((item, i) => (
          <div
            key={i}
            className="relative bg-[#ffffffad] text-black dark:bg-[#262121a0] dark:text-white rounded-[16px] px-5 py-3 flex flex-col justify-between items-center max-w-[25rem] drop-shadow-lg"
          >
            <div className="absolute top-0 right-0 bg-white text-black rounded-[16px] flex justify-center gap-1 text-[15px] font-bold px-3 py-2 items-center">
              {item.price}
              <NextImage
                src="/ogcoin.png"
                layout="fixed"
                width="15px"
                height="15px"
              />
            </div>
            <div className="flex flex-col pt-5">
              <NextImage
                className="overflow-hidden rounded-lg"
                src={item.image}
                alt={item.name}
                width="212px"
                height="212px"
                loader={myLoader}
              />
            </div>
            <div>
              <h3 className="text-[18px] text-center py-1">{item.name}</h3>
              <h5 className="text-[13px] text-center">{item.desc}</h5>
            </div>
            <button className="bg-white text-black rounded-[12px] px-[16px] py-[14px] text-[14px] my-5 w-[120px] font-bold" onClick={() => onBuy(item)}>
              Buy!
            </button>
          </div>
        ))}
    </div>
  );
};

export default Market;
