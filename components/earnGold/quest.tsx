import CreateEventModal from "components/modal/CreateEventModal";
import { useEvents } from "hooks/useEvents";
import { useModal } from "hooks/useModal";
import { useTwitterUser } from "hooks/useTwitterUser";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUserData } from "utils/firebase";
import { updateQuests, deleteQuest } from "utils/firebase/quest";

const DailyQuest = () => {
  const { setModal } = useModal();
  const { quests } = useEvents();
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

  return (
    <>
      <div className="bg-[#48111180] border-2 border-white px-5 py-3 rounded-md min-h-[20rem] w-full grid grid-cols-1 gap-5">
        <div className="text-2xl -mb-5 flex items-center">Daily Quest</div>
        {isLoading ? (
          "Fetching Quests..."
        ) : (
          <>
            {quests.map((quest, index) => (
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
                  <p className="absolute bg-white rounded-full py-[2px] px-[14px] text-red-700 text-[12px] uppercase right-2 top-3 font-bold">
                    LIVE
                  </p>
                  {user?.isAdmin ? (
                    <button
                      className="bg-white rounded-full py-[2px] px-[14px] text-red-700 text-[12px] uppercase"
                      onClick={() => deleteQuestById(quest._id)}
                    >
                      Delete
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
                <Link href={quest.link}>
                  <button className="absolute bg-white rounded-tl-[16px]  py-1 px-4 right-0 bottom-0 text-gray-600 border-2 border-white font-bold">
                    Click here to join &gt;
                  </button>
                </Link>
              </div>
            ))}
            {user?.isAdmin ? (
              <div
                className="w-full bg-[#FFFFFF80] border-2 border-white rounded-[16px] py-6 px-9 text-black text-[24px] leading-[32px] text-center hover:cursor-pointer"
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
