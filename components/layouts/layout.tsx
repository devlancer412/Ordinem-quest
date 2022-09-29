import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useLayoutEffect, useState } from "react";
import solanaClient from "utils/solanaClient";
import { Header } from "../header/Header";
import { Sidenav } from "../sidenav/Sidenav";
import { getAuth } from "firebase/auth";
import { useTwitterUser } from "hooks/useTwitterUser";
import { getUserFromAddress } from "utils/firebase";
import Alert from "components/Alert";
import Notification from "components/Notification";
import { useWindowSize } from "hooks/useWindowSize";
import { sendTokensToUser } from "utils/token";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import axios from "axios";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getCurrentUserData, updateUser } from "utils/firebase";

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { login, logout, changeUser, getDataFromStorage, currentUser } = useTwitterUser();
  const { setSize } = useWindowSize();
  const { nfts, setTokens } = useSolanaNfts();
  const auth = getAuth();
  const [updateOwnershipFlage, setUpdateOwnershipFlag] = useState<boolean>(true);

  useEffect(() => {
    if (nfts && nfts.length && updateOwnershipFlage && currentUser) {
      (async () => {
        await solanaClient.updateNFTOwner(nfts, currentUser.screenName as string);
        setUpdateOwnershipFlag(false);
      })();
    }
  }, [nfts, updateOwnershipFlage, currentUser]);

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      (async () => {
        const publicKey = wallet.publicKey!.toString();

        const user = await getUserFromAddress(publicKey);
        if (!user) {
          logout();
        } else {
          changeUser(user.screenName);
        }

        await solanaClient.getGoldTokens(publicKey)
        await solanaClient.getAllNfts(publicKey);
        setUpdateOwnershipFlag(true);
      })();
    }
  }, [wallet]);

  useEffect(() => {
    auth.onAuthStateChanged(async (observer) => {
      if (observer !== null) {
        login(observer);
        setUpdateOwnershipFlag(true);
      }
      // else {
      //   logout();
      // }
    });
  }, []);

  const windowListener = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useLayoutEffect(() => {
    windowListener();
    window.addEventListener("resize", windowListener);
    getDataFromStorage();

    return () => window.removeEventListener("resize", () => { });
  }, []);

  
  const withdrawGold = async () => {
    if (!wallet.connected) {
      console.error("not connected");
      return;
    }

    const response = await axios.get(
      `/api/get-withdraw-transaction?user_wallet=${(wallet.publicKey as PublicKey).toBase58()}`
    );

    console.log(response.data)
    if (response.data.status != 'ok') {
      console.log(response.data.error);
      return;
    }

    setTokens(0);
    const tx = Transaction.from(
      Buffer.from(response.data.data, "base64")
    );
    console.log(tx);
    try {
      const txId = await wallet.sendTransaction(tx, connection);

      console.log('Transaction sent', txId);
      const user = await getCurrentUserData();
      updateUser(user._id, {
        tokensWithdrawable: 0,
      })
      await connection.confirmTransaction(txId, 'confirmed');
    } catch (err) { console.log(err) }
  }

  try {
    return (
      <>
        <div>
          <Alert />
          <Notification />
          <Sidenav />
          <div className="main">
            <Header withdrawGold={withdrawGold} />
            <div className="mx-2 md:mx-4 py-4 px-3 md:px-6">{children}</div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    return <div>We found an error here {JSON.stringify(error)}</div>;
  }
};
