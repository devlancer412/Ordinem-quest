import axios from "axios";
import { NETWORK, SOLANA_API_KEY } from "./constants";
import {
  db,
  getFirebaseNfts,
  getUserFromAddress,
  nftCollection,
  updateUser,
  updateNFT,
} from "utils/firebase";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import { differenceWith, intersectionWith } from "lodash";
import { addDoc, deleteDoc, doc } from "firebase/firestore";

const axiosInstance = axios.create({
  baseURL: "https://solana-gateway.moralis.io",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-Key": SOLANA_API_KEY as string,
  },
});

const { setTokens, setNfts } = useSolanaNfts.getState();

export class SolanaClient {
  async getAllNfts(publicKey: string) {
    try {
      setNfts(null!);
      const firebaseNfts = await getFirebaseNfts();

      // if (firebaseNfts && firebaseNfts.length) {
      //   setNfts(firebaseNfts as any);
      // }

      const nftTokens = await this.getNftTokens(publicKey);
      // const deleteDiff = differenceWith(
      //   firebaseNfts ?? [],
      //   nftTokens,
      //   (i: any, o: any) => i.mint === o.mint
      // );
      // if (deleteDiff.length) {
      //   deleteDiff.forEach(async (token) => {
      //     await deleteDoc(doc(db, "nfts", token._id));
      //   });
      // }

      const tokenDiff = differenceWith(
        nftTokens,
        firebaseNfts ?? [],
        (i: any, o: any) => i.mint === o.mint
      );

      const nfts = await Promise.all(
        tokenDiff.map((nft: any) => this.getNftMetadata(nft.mint))
      );

      const ordinemNfts = nfts.filter((nft) => nft !== null);

      if (NETWORK === "mainnet") {
        // const user = await getUserFromAddress(publicKey);
        // if (user) {
        //   updateUser(user._id, {
        //     hasNfts: ordinemNfts.length > 0,
        //     nftCount: ordinemNfts.length,
        //   });
        // }
        for (const token of ordinemNfts) {
          await addDoc(nftCollection, {
            ...token
          });
        };
      }

      const updatedFirebaseNfts = await getFirebaseNfts();
      const updatedNfts = intersectionWith(
        updatedFirebaseNfts,
        nftTokens,
        (i: any, o: any) => i.mint === o.mint
      );
      setNfts(updatedNfts.map((nft: any) => nft as NFT));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async getData(url: string) {
    return await (
      await axiosInstance.get(url)
    ).data;
  }

  async getGoldTokens(publicKey: string) {
    const user = await getUserFromAddress(publicKey);
    if (user && user.tokensWithdrawable) {
      setTokens(user.tokensWithdrawable);
      return;
    }

    const tokens = await this.getData(
      `/account/${NETWORK}/${publicKey}/tokens`
    );
    const token = tokens.find(
      (token: any) => token.mint === process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS
    );
    if (token) {
      setTokens(Number(token.amount.split(".")[0]));
    }
  }

  async getNftTokens(publicKey: string) {
    return this.getData(`/account/${NETWORK}/${publicKey}/nft`);
  }

  private async getNftMetadata(address: string) {
    const metadata = await this.getData(`nft/${NETWORK}/${address}/metadata`);
    if (
      NETWORK !== "devnet" &&
      !metadata.name.toLowerCase().includes("ordinem")
    )
      return null;

    const { data } = await axios.get(metadata?.metaplex.metadataUri);

    return {
      ...data,
      ...metadata,
      level: 0,
    };
  }

  public async updateNFTOwner(nfts: NFT[], owner: string) {
    for (const nft of nfts) {
      if (nft._id) {
        updateNFT(nft._id, {
          twitter: owner,
        });
      }
    }
  }
}

export default new SolanaClient();