/* eslint-disable react/no-unescaped-entities */
import NextImage from 'next/image';
import { useModal } from "hooks/useModal";
import { useState } from "react";
import { createQuest } from "utils/firebase/quest";
import ModalWrapper from "./ModalWrapper";
import { Close } from "icons/close";
import RangeSelect from 'components/RangeSelect';

const CreatePromoteEventModal = () => {
    const { setModal } = useModal();

    const [title, setTiltle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [link, setLink] = useState<string>("");
    const [totalReward, setTotalReward] = useState<number>(50);

    const createEvent = async () => {
        if(title == '') {
            console.error("Please set title");
            return;
        }
        if(link == '') {
            console.error("Please set link");
            return;
        }

        await createQuest({
            title,
            description,
            link,
            isPromote: true,
            rewardAmount: 25,
            totalReward,
            rewarded: 0,
        });
        setModal(false);
    };

    return (
        <ModalWrapper>
            <div className="relative bg-[#1D0808] rounded-[16px] py-[56px] px-[72px] flex flex-col items-center ">
                <div className="w-full flex flex-row justify-start items-center gap-1 mb-10">
                    <h1 className="text-[36px] leading-[47px]">
                        Promote Tweet
                    </h1>
                    <NextImage
                        src="/gold-treasure-icon.png"
                        width={65}
                        height={65}
                    />
                </div>
                <div
                    className="absolute right-[72px] top-[50px] hover:cursor-pointer"
                    onClick={() => setModal(false)}
                >
                    <Close />
                </div>
                <div className="grid grid-cols-1 gap-8 w-full mb-[73px]">
                    <input
                        className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black bg-white"
                        placeholder="Tilte"
                        value={title}
                        onChange={(e) => setTiltle(e.target.value)}
                    />
                    <textarea
                        className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black bg-white"
                        placeholder="Description..."
                        value={description}
                        rows={5}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black bg-white"
                        placeholder="Link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />
                </div>
                <div className='w-full flex flex-col gap-[23px] mb-[86px]'>
                    <div className='w-full flex flex-row justify-between items-center'>
                        <h3 className='text-white text-[24px] leading-[31px] font-bold'>Reward Amount</h3>
                        <p className='text-white text-[15px] leading-[24px] font-bold'>5000 GOLD = 5 Solana</p>
                    </div>
                    <RangeSelect top={30000} bottom={50} value={totalReward} onChange={setTotalReward} unit='' />
                    <p className='text-white text-[15px] leading-[24px] font-bold'>Note: 8% Fee with each promotion</p>
                </div>
                <button
                    className="bg-[#262121] border-[3px] border-[#E0CECE] rounded-[20px] py-5 px-9 text-[24px] leading-[31px] text-white"
                    type="button"
                    onClick={createEvent}
                >
                    Create Promotion
                </button>
            </div>
        </ModalWrapper>
    );
};

export default CreatePromoteEventModal;
