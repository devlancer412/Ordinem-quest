import { Tab } from "@headlessui/react";
import Follow from "components/earnGold/follow";
import Knights from "components/earnGold/knights";
import DailyQuest from "components/earnGold/quest";
import Tweet from "components/earnGold/tweet";
import SelectKnightModal from "components/modal/SelectKnightModal";
import { useModal } from "hooks/useModal";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import { useTwitterUser } from "hooks/useTwitterUser";
import { Fragment, useEffect, useState } from "react";

export default function EarnGold() {
  const tabs = [
    {
      title: "Daily Quests",
      component: <DailyQuest />,
    },
    {
      title: "Follow",
      component: <Follow />,
    },
    {
      title: "Tweet",
      component: <Tweet />,
    },
    {
      title: "Select Knight",
      // component: <Knights />,
    },
  ];
  const { currentUser } = useTwitterUser();
  const { allNfts } = useSolanaNfts();
  const { showModal, setModal } = useModal();
  const [before, setBefore] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const classList = document.getElementsByClassName("full-body")[0].classList;
    classList.forEach((el) => {
      if (el.indexOf("bg-") == 0) {
        classList.remove(el);
      }
    });
    classList.add("bg-[url('/earn-gold.png')]");
  }, []);

  useEffect(() => {
    if (showModal == false) {
      setSelectedTab(before);
    }
  }, [showModal]);

  const onClickTab = (index) => {
    setSelectedTab(index);
    if (index == 3) {
      setModal(true);
    } else {
      setBefore(index);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
      <Tab.Group
        defaultIndex={0}
        selectedIndex={selectedTab}
        onChange={(i) => onClickTab(i)}
      >
        <Tab.List className="flex flex-nowrap md:flex-col gap-x-3 gap-y-6 sticky top-10 overflow-auto z-10">
          {tabs.map((tab, i) => (
            <Tab key={i} as={Fragment}>
              {({ selected }) => (
                <button
                  className={`text-white px-5 py-2 rounded-md border-2 border-white dark:border-white min-w-[145px] ${
                    selected
                      ? "bg-[#ff000033] text-gray-800 dark:text-white"
                      : "bg-[#26212180]"
                  }`}
                >
                  {tab.title}
                  {/* {tab?.comingSoon && (
                    <span className="rounded-lg ml-2 px-4 py-1 text-sm bg-gray-300 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      Soon
                    </span>
                  )} */}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="md:col-span-2 text-white">
          {tabs.map((tab, i) => (
            <Tab.Panel key={i}>
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
                <>{tab.component}</>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
      <SelectKnightModal />
    </div>
  );
}
