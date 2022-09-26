import { NextPage } from "next";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTwitterUser } from "hooks/useTwitterUser";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import PersonalState from "components/state/Personal";
import GlobalState from "components/state/Global";

const tabs = [
    {
        title: "Personal",
        component: <PersonalState />,
    },
    {
        title: "Global",
        component: <GlobalState />,
    },
];

const PersonalStatePage: NextPage = () => {
    const { currentUser } = useTwitterUser();
    const { allNfts } = useSolanaNfts();

    return (
        <div className="w-full flex flex-col items-center">
            <h1 className="my-10 text-center text-white font-bold text-[50px]">Leaderboard</h1>
            <div className="w-full bg-[#2E2E2E95] rounded-[30px] py-5 px-[110px] h-[60vh] flex flex-col items-center">
                <Tab.Group defaultIndex={0}>
                    <Tab.List className="w-full flex flex-row gap-3 justify-center">
                        {tabs.map((tab, i) => (
                            <Tab key={i} as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`text-white px-2 py-1 rounded-[15px] min-w-[160px] text-[30px] font-bold leading-[150%] ${selected
                                            ? "bg-[#B83434]"
                                            : "bg-transparent"
                                            }`}
                                    >
                                        {tab.title}
                                    </button>
                                )}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels className="w-full text-white flex-1 pb-[40px]">
                        {tabs.map((tab, i) => (
                            <Tab.Panel
                                className="w-full h-full flex justify-center items-center"
                                key={i}
                            >
                                {!currentUser ? (
                                    <div className="w-full min-h-[20rem] text-xl h-full flex text-center justify-center items-center">
                                        <h4>Login with twitter to access quests</h4>
                                    </div>
                                ) : allNfts?.length === 0 ? (
                                    <div className="w-full min-h-[20rem] text-xl h-full flex text-center justify-center items-center">
                                        <h4>
                                            You need to have Ordinem NFTs in order to take any quests
                                        </h4>
                                    </div>
                                ) : (
                                    <>
                                        {tab.component}
                                    </>
                                )}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>)
}

export default PersonalStatePage;