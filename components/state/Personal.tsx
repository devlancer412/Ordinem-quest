import { useTwitterUser } from "hooks/useTwitterUser";
import { useEffect, useState } from "react";
import { getCurrentUserData } from "utils/firebase";

const PersonalState = () => {
    const {currentUser} = useTwitterUser();
    const [user, setUser] = useState<any>();

    useEffect(() => {
        (async () => {
            setUser(await getCurrentUserData());
        })();
    }, [])

    return <div className="w-full grid grid-cols-3">
        <div className="flex flex-col h-[160px] justify-between text-white text-center items-center font-bold leading-[150%]">
            <h5 className="text-[25px]">Total Raids Completed</h5>
            <h1 className="text-[100px]">142</h1>
        </div>
        <div className="flex flex-col h-[160px] justify-between text-white text-center items-center font-bold leading-[150%]">
            <h5 className="text-[25px]">Total Follows</h5>
            <h1 className="text-[100px]">{currentUser?.followers}</h1>
        </div>
        <div className="flex flex-col h-[160px] justify-between text-white text-center items-center font-bold leading-[150%]">
            <h5 className="text-[25px]">Total Gold Earned</h5>
            <h1 className="text-[100px]">{user?.tokensEarned}</h1>
        </div>
    </div>
}

export default PersonalState;