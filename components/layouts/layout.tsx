import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
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

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  const wallet = useWallet();
  const { login, logout, changeUser, getDataFromStorage, currentUser } = useTwitterUser();
  const { setSize } = useWindowSize();
  const { nfts } = useSolanaNfts();
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

  try {
    return (
      <>
        <div>
          <Alert />
          <Notification />
          <Sidenav />
          <Header />
          <div className="mx-2 md:mx-4 lg:ml-80 py-4 px-3 md:px-6">
            {/* <button
              onClick={async () => {
                if (!wallet) return;
                const sig = await sendTokensToUser(wallet, 50);
              }}
            >
              Sign transaction
            </button> */}
            {children}
          </div>
        </div>
      </>
    );
  } catch (error) {
    return <div>We found an error here {JSON.stringify(error)}</div>;
  }
};
