import CreateEventModal from "components/modal/CreateEventModal";
import { useEvents } from "hooks/useEvents";
import { useModal } from "hooks/useModal";
import { useTwitterUser } from "hooks/useTwitterUser";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUserData } from "utils/firebase";
import { updateQuests } from "utils/firebase/quest";

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
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            <div className="w-full grid grid-cols-1 gap-5 py-10">
                {isLoading ? "Fetching Quests..." : <>
                    {quests.map(quest => <div className="relative w-full bg-[#D24B4B80] border-2 border-white rounded-[16px] py-6 px-9 overflow-hidden">
                        <h1 className="text-white text-[24px] leading-[32px]">{quest.title}</h1>
                        <p className="text-[#B9B8BC] text-[14px] leading-[18px]">{quest.rewardAmount} Gold Available</p>
                        <p className="absolute bg-white rounded-full py-[2px] px-[14px] text-red-700 text-[12px] uppercase right-2 top-1">LIVE</p>
                        <Link href={quest.link}>
                            <button className="absolute bg-white rounded-tl-[20px] rounded-br-[20px] py-3 px-4 -right-1 -bottom-1 text-gray-600">
                                Click here to join > 
                            </button>
                        </Link>
                    </div>)}
                    {user?.isAdmin ?
                        (
                            <div
                                className="w-full bg-[#FFFFFF80] border-2 border-white rounded-[16px] py-6 px-9 text-black text-[24px] leading-[32px] text-center hover:cursor-pointer"
                                onClick={() => setModal(true)}
                            >
                                CREATE NEW EVENT +
                            </div>
                        ) : <></>}
                </>}
            </div>
            <CreateEventModal />
        </>
    );
};

export default DailyQuest;
