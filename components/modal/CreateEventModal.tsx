/* eslint-disable react/no-unescaped-entities */
import { useModal } from "hooks/useModal";
import { useState } from "react";
import { createQuest } from "utils/firebase/quest";
import { Deadlines } from "../../utils/constants";
import ModalWrapper from "./ModalWrapper";

const CreateEventModal = () => {
    const { setModal } = useModal();

    const [title, setTiltle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [deadline, setDeadline] = useState<Deadline>(Deadlines[0]);
    const [link, setLink] = useState<string>('');
    const [rewardAmount, setRewardAmount] = useState<number>(0);

    const createEvent = async () => {
        await createQuest({title, description, deadline, link, rewardAmount });
        setModal(false);
    }
    
    return (
        <ModalWrapper>
            <div className="bg-[#1D0808] rounded-[16px] py-[56px] px-[72px] flex flex-col items-center">
                <h1 className="w-full text-[36px] leading-[47px] mb-10">Create New Event</h1>
                <div className="grid grid-cols-1 gap-8 w-full mb-10">
                    <input 
                        className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black" 
                        placeholder="Tilte" 
                        value={title} 
                        onChange={(e) => setTiltle(e.target.value)} 
                    />
                    <textarea
                        className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black" 
                        placeholder="Description..." 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                    />
                    <div className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black bg-white text-gray-400">
                        Deadline
                        <div className="w-full flex flex-row justify-center items-center gap-[18px] mb-[30px]">
                            {Deadlines.map(item => (
                                <div 
                                    key={item}
                                    className={`py-2 px-5 bg-[#973131] text-white rounded-[20px] border-[3px] hover:cursor-pointer hover:border-black ${item == deadline?'border-black':''}`}
                                    onClick={() => setDeadline(item)}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <input 
                        className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black" 
                        placeholder="Link" 
                        value={link} 
                        onChange={(e) => setLink(e.target.value)} 
                    />
                    <input 
                        className="rounded-[20px] py-[6px] px-[25px] text-[24px] leading-[32px] text-black" 
                        placeholder="Reward Amount"
                        type='number'
                        value={rewardAmount} 
                        onChange={(e) => setRewardAmount(parseFloat(e.target.value))} 
                    />
                </div>
                <button 
                    className="bg-[#262121] border-[3px] border-[#E0CECE] rounded-[20px] py-5 px-9 text-[24px] leading-[31px] text-white" 
                    type="button" 
                    onClick={createEvent}
                >
                    Create Event
                </button>
            </div>
        </ModalWrapper>
    );
};

export default CreateEventModal;