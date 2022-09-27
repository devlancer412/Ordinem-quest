import {
  doc,
  DocumentData,
  getDocs,
  increment,
  query,
  QuerySnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAlert } from "hooks/useAlert";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import { useTwitterUser } from "hooks/useTwitterUser";
import { intersectionWith } from "lodash";
import { db, nftCollection, userCollection } from "./config";

const { open: openAlert } = useAlert.getState();
const { removeUser, changeUser } = useTwitterUser.getState();

export { openAlert, removeUser, changeUser };

export const getData = (
  docs: QuerySnapshot<DocumentData>
): { _id: string;[key: string]: any }[] =>
  docs.docs.map((doc) => ({ ...doc.data(), _id: doc.id }));

export async function getFirebaseNfts() {
  return getData(
    await getDocs(
      query(nftCollection)
    )
  );
}

export async function getUserData(uid: string) {
  return getData(
    await getDocs(query(userCollection, where("uid", "==", uid)))
  )[0];
}

export const getCurrentUserId = () =>
  useTwitterUser.getState().currentUser?.providerData[0].uid;

export async function getCurrentUserData(uid?: string) {
  const currentUserId = getCurrentUserId();

  let docs = await getDocs(
    query(userCollection, where("uid", "==", uid ?? currentUserId))
  );
  return getData(docs)[0];
}

export async function updateUser(userId: string, payload: any) {
  await updateDoc(doc(db, "users", userId), payload);
}

export async function updateNFT(nftId: string, payload: any) {
  await updateDoc(doc(db, "nfts", nftId), payload);
}

export async function updateUserData(payload: any) {
  const user = await getCurrentUserData();

  updateUser(user._id, payload);
}

export async function updateNftXP(amount: number) {
  const { nfts, selectedNft } = useSolanaNfts.getState();

  if (!nfts || !nfts.length) {
    return;
  }

  const nft = nfts[selectedNft];

  if (!nft.XP || Number(nft?.XP) + amount < (nft.level + 1) * 100) {
    await updateNFT(nft._id, {
      XP: increment(amount),
    });
    return;
  }

  updateNFT(nft._id, {
    XP: increment(amount),
    level: increment(1),
  });
  await updateNfts();
}

export async function updateNfts() {
  const { nfts, setNfts } = useSolanaNfts.getState();
  const totalNfts = await getFirebaseNfts();
  const updated = intersectionWith(totalNfts, nfts as Array<any>, (a: any, b: any) => a.mint == b.mint)
  setNfts(updated.map((nft: any) => nft as NFT));
}

export async function getUserFromAddress(address: string) {
  return getData(
    await getDocs(query(userCollection, where("wallet", "==", address)))
  )[0];
}

export async function getNftFromMint(mint: string) {
  return getData(
    await getDocs(query(nftCollection, where("mint", "==", mint)))
  )[0];
}

export async function getAllUsers() {
  return getData(
    await getDocs(query(userCollection))
  )
}