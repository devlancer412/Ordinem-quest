import CreateEventModal from "components/modal/CreateEventModal";
import Link from "next/link";
import axios from "axios";
import { useEvents } from "hooks/useEvents";
import { useModal } from "hooks/useModal";
import { useTwitterUser } from "hooks/useTwitterUser";
import { useEffect, useState } from "react";
import {
  getCurrentUserData,
  updateNftXP,
  updateUserData,
} from "utils/firebase";
import { updateQuests, deleteQuest } from "utils/firebase/quest";
import { arrayUnion, increment, serverTimestamp } from "firebase/firestore";
import { updateTokensToDB } from "utils/token";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNotification } from "hooks/useNotification";
import SuccessPopup from "./SuccessPopup";
import { toast } from "react-toastify";
import { PublicKey } from "@solana/web3.js";

const DailyQuest = () => {
  const { setModal } = useModal();
  const wallet = useWallet();
  const { quests } = useEvents();
  const { openNotification } = useNotification();
  const [user, setUser] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    await updateQuests();
    const user = await getCurrentUserData();
    setUser(user);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteQuestById = async (id: any) => {
    await deleteQuest(id);
    load();
  };

  const verifyQuest = async (quest: Quest) => {
    const tweetId = quest.link
      .split("/")
      [quest.link.split("/").length - 1].split("?")[0];
    console.log(tweetId);
    const result = await axios.get(
      `/api/verify-quest?user_id=${user.uid}&tweet_id=${tweetId}`
    );

    if (result?.data?.data == true) {
      console.log("verified");
      await updateUserData({
        quests: arrayUnion(quest?._id),
        questCount: increment(1),
        lastQuested: serverTimestamp(),
      });
      await updateNftXP(10 * quest.rewardAmount);
      await updateTokensToDB(
        (wallet.publicKey as PublicKey).toString(),
        quest.rewardAmount ?? 5
      );

      openNotification(() => (
        <SuccessPopup goldRecieved={quest.rewardAmount} quest="follow" />
      ));

      load();
    } else {
      toast.error(result?.data?.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
      <div className="bg-[#48111180] border-2 border-white px-5 py-3 rounded-md min-h-[20rem] w-full grid grid-cols-1 gap-5">
        <div className="text-2xl -mb-5 flex items-center">Daily Quest</div>
        {isLoading ? (
          "Fetching Quests..."
        ) : (
          <>
            {quests
              .filter(
                (quest: Quest) =>
                  !user?.quests || user.quests.indexOf(quest._id) < 0
              )
              .map((quest, index) => (
                <div
                  key={index}
                  className="relative w-full bg-[#81212199] border-2 border-white rounded-[16px] py-6 px-9 overflow-hidden h-[100px]"
                >
                  <h1 className="text-white text-[24px] leading-[32px] font-bold">
                    {quest.title}
                  </h1>
                  <p className="text-[#B9B8BC] text-[14px] leading-[18px]">
                    {quest.rewardAmount} Gold Available
                  </p>
                  <div className="absolute right-1 top-2 grid grid-cols-2 gap-1">
                    <button
                      className=" bg-white rounded-full py-[2px] px-[14px] text-red-700 text-[12px] uppercase font-bold text-center"
                      onClick={() => verifyQuest(quest)}
                    >
                      Verify
                    </button>
                    {user?.isAdmin ? (
                      <button
                        className="bg-white rounded-full py-[2px] px-[14px] text-red-700 text-[12px] uppercase font-bold"
                        onClick={() => deleteQuestById(quest._id)}
                      >
                        Delete
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                  <a target="_blank" href={quest.link} rel="noopener noreferrer">
                    <button className="absolute bg-white rounded-tl-[16px]  py-1 px-4 right-0 bottom-0 text-gray-600 border-2 border-white font-bold">
                      Click here to join &gt;
                    </button>
                  </a>
                </div>
              ))}
            {user?.isAdmin ? (
              <div
                className="w-full bg-[#FFFFFF80] border-2 border-white rounded-[16px] py-6 px-9 text-black text-[24px] leading-[32px] text-center hover:cursor-pointer h-[100px] flex justify-center items-center"
                onClick={() => setModal(true)}
              >
                CREATE NEW EVENT +
              </div>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
      <CreateEventModal />
    </>
  );
};

export default DailyQuest;
