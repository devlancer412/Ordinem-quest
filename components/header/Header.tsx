import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSideNav } from "hooks/useSideNav";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import React, { useState } from "react";
import { Hamburger } from "../../icons/hamburger";
import { Bell } from "../../icons/bell";
import { ConnectWallet } from "../connectWallet/connectWallet";
import { Transaction } from "@solana/web3.js";
import { getCurrentUserData, updateUser } from "utils/firebase";
import { useWindowSize } from "hooks/useWindowSize";
import { Popover } from "@headlessui/react";
import { useEvents } from "hooks/useEvents";
import { Timestamp } from "@firebase/firestore";
import TimeAgo from "react-timeago";

type Props = {
  withdrawGold: () => void;
};

const notifications = [];

export const Header: React.FC<Props> = ({ withdrawGold }) => {
  const [connectWalletDialogOpened, setConnectWalletDialogOpened] =
    useState(false);
  const { setSideNav } = useSideNav();
  const { setTokens } = useSolanaNfts();
  const { width } = useWindowSize();

  const handleConnectWalletDialogClose = () => {
    setConnectWalletDialogOpened(false);
  };

  const { quests } = useEvents();

  return (
    <>
      <div className="flex items-center justify-between w-full px-3 md:px-6 py-4 ml-0  lg:justify-end dark:bg-nav-dark-500 lg:dark:bg-transparent bg-white lg:bg-transparent items-center">
        <div className="flex mr-4 lg:hidden">
          <button onClick={() => setSideNav()} className="block lg:hidden">
            <Hamburger />
          </button>
          <div className="block ml-4 lg:hidden">
            <Link className="" href={"/"}>
              <a className="flex items-center">
                <div>
                  <span className="text-xl font-bold text-black dark:text-white">
                    Ordinem
                  </span>
                  <p className="text-xs text-[#7A797D]">
                    Knights of the round table.
                  </p>
                </div>
              </a>
            </Link>
          </div>
        </div>
        <div className="flex justify-end lg:justify-between w-full">
          <div className="hidden lg:block">
            <SearchComponent />
          </div>
          <div className="flex items-center gap-3">
            {width > 530 ? (
              <button
                className="text-sm rounded-full bg-[#F1F1F1] text-[#DF245C] hover:bg-primary-900 hover:text-white h-10 px-4 font-bold"
                onClick={withdrawGold}
              >
                Withdraw Gold
              </button>
            ) : (
              ""
            )}
            <WalletMultiButton className="text-sm rounded-full bg-[#F1F1F1] text-[#DF245C] hover:!bg-[#b30000] hover:text-white h-10 px-4 font-bold"></WalletMultiButton>
            <Popover className="relative">
              <Popover.Button className="rounded-full bg-[#F1F1F1] text-[#7A797D] hover:bg-primary-900 h-10 px-2 outline-0">
                <Bell />
              </Popover.Button>

              <Popover.Panel className="absolute z-50 flex flex-col right-0 notification-panel top-[calc(100%+10px)] w-[400px]">
                <div className="bg-white border-b-2 border-[#D9D8D8] px-3 py-3 font-bold text-[14px] text-black ">
                  Community Notification
                </div>
                <div className="bg-white h-[200px] px-2 py-2 flex flex-col gap-2">
                  {quests.length == 0 && (
                    <div className="h-full w-full flex justify-center items-center text-center">
                      <h5 className="text-[12px] text-[#747475]">
                        You don’t have any notifications.
                      </h5>
                    </div>
                  )}
                  {quests.length > 0 &&
                    quests.map((quest, index) => (
                      <div
                        className="w-full text-black border-emerald-300	 border-l-[5px] px-2 py-1"
                        key={index}
                      >
                        <div className="flex justify-between items-center">
                          <div>{quest.title}</div>
                          <TimeAgo
                            date={quest.createdTime.toDate()}
                            className="text-[12px]"
                          />
                        </div>
                        <div>
                          Complete raid now for {quest.rewardAmount} gold
                        </div>
                      </div>
                    ))}
                </div>
              </Popover.Panel>
            </Popover>
            {/* <div className="bg-white w-10 h-10 rounded-full flex justify-center items-center">
              <svg
                className="w-6 h-6 text-dark-text-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div> */}
          </div>
        </div>
      </div>

      <div className="lg:hidden py-4 px-3">
        <SearchComponent />
      </div>

      {/* Connect wallet model */}
      <ConnectWallet
        open={connectWalletDialogOpened}
        onClose={handleConnectWalletDialogClose}
      />
    </>
  );
};

let debounced: any;
const SearchComponent = () => {
  const { searchNfts } = useSolanaNfts();

  return (
    <div className="flex items-center rounded-full px-5 py-3 gap-2 bg-gray-100 text-gray-700 dark:bg-[#4D3A3A]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-dark-text-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        type="text"
        className="bg-transparent min-w-[12rem] outline-none text-[#B9B8BC] w-80"
        placeholder="Search NFT’s using name"
        onChange={(e) => {
          clearTimeout(debounced);
          debounced = setTimeout(() => {
            searchNfts(e.target.value);
          }, 1000);
        }}
      />
    </div>
  );
};
