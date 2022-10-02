import { useTwitterUser } from "hooks/useTwitterUser";
import { useEffect, useState } from "react";
import { getCurrentUserData } from "utils/firebase";

const PersonalState = () => {
  const { currentUser } = useTwitterUser();
  const [user, setUser] = useState<any>();

  useEffect(() => {
    (async () => {
      setUser(await getCurrentUserData());
    })();
  }, []);

  return (
    <div className="w-[80%] grid md:grid-cols-3 grid-cols-1 lg:flex-row justify-around gap-10 py-[70px]">
      <div className="flex flex-col h-[160px] justify-between text-white text-center items-center font-bold leading-[150%]">
        <h5 className="text-[25px]">Total Raids Completed</h5>
        <h1 className="text-[100px] leading-none">{(user?.followCount ?? 0) + (user?.likeCount ?? 0) + (user?.replyCount ?? 0)}</h1>
      </div>
      <div className="flex flex-col h-[160px] justify-between text-white text-center items-center font-bold leading-[150%]">
        <h5 className="text-[25px]">Total Follows</h5>
        <h1 className="text-[100px] leading-none">
          {(user?.followCount ?? 0)}
        </h1>
      </div>
      <div className="flex flex-col h-[160px] justify-between text-white text-center items-center font-bold leading-[150%]">
        <h5 className="text-[25px]">Total Gold Earned</h5>
        <h1 className="text-[100px] leading-none">
          {user?.tokensEarned ?? 0}
        </h1>
      </div>
    </div>
  );
};

export default PersonalState;
