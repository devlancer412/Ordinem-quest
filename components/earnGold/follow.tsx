/* eslint-disable react/no-unescaped-entities */
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import Spinner from "components/Spinner";
import { arrayUnion, increment, serverTimestamp } from "firebase/firestore";
import { useNotification } from "hooks/useNotification";
import { useQuests } from "hooks/useQuests";
import { useTwitterUser } from "hooks/useTwitterUser";
import Image from "next/image";
import { useEffect, useState } from "react";
import { myLoader } from "utils/constants";
// import { TwitterFollowButton } from "react-twitter-embed";
import {
  getRandomUser,
  updateUser,
  updateUserData,
  updateNftXP,
} from "utils/firebase";
import { updateTokensToDB } from "utils/token";
import LoadingButton from "./LoadingButton";
import SuccessPopup from "./SuccessPopup";

let debounceCallback: NodeJS.Timeout;
const Follow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { userToFollow, quotasEnded, followableUsers } =
    useQuests();
  const wallet = useAnchorWallet();
  const { currentUser } = useTwitterUser();
  const { openNotification } = useNotification();

  const fetchUsers = async (updateFlag: boolean) => {
    if (!wallet || !currentUser) return;

    setIsLoading(true);
    try {
      await getRandomUser(
        wallet?.publicKey.toString(),
        currentUser?.providerData[0]?.uid,
        updateFlag
      );
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    clearTimeout(debounceCallback);
    debounceCallback = setTimeout(() => fetchUsers(false), 1000);
  }, [wallet]);

  const verifyUserFollow = async () => {
    if (!isVerifying) {
      setIsVerifying(true);
      try {
        const result = await axios.get(
          `/api/get-twitter-followers?user_id=${userToFollow.uid}`
        );
        const currentUserId = currentUser?.providerData[0]?.uid;
        const followId =
          currentUserId?.length == 19
            ? Math.floor(Number(currentUserId) / 100) * 100
            : Number(currentUserId);

        console.log(followId, result.data.data.ids);
        if (
          result.data.data &&
          result.data.data.ids &&
          result.data.data.ids.includes(followId)
        ) {
          setIsVerified(true);
          await updateUser(userToFollow._id, {
            followers: arrayUnion(currentUserId),
          });
          await updateUserData({
            followCount: increment(1),
            lastFollowed: serverTimestamp(),
          });
          await updateNftXP(50);
          const amount = await updateTokensToDB(
            wallet?.publicKey.toString() as string,
            5
          );

          openNotification(() => (
            <SuccessPopup goldRecieved={amount} quest="follow" />
          ));

          
          fetchAndChangeUser();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const fetchAndChangeUser = () => fetchUsers(true);

  if (!wallet) {
    return <div className="">Connect your wallet</div>;
  }

  if (isLoading) return <div>Loading ...</div>;

  if (quotasEnded.follow)
    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-center">
        <h4>Quota ended for today</h4>
        <p>Come again tomorrow to take up more follow quests</p>
      </div>
    );

  if (!userToFollow) return null;

  return (
    <>
      <div className="relative flex flex-col items-center h-full px-10 py-20 bg-[#161617af]">
        <Image src="/follow-border.png" className="w-[100%]" layout="fill" />
        <div className="flex flex-col items-center  my-2  h-full rounded-lg z-10">
          <Image
            src={userToFollow.image}
            className="rounded-full"
            alt={userToFollow.name ?? userToFollow.displayName}
            height={200}
            width={200}
            loader={myLoader}
          />
          <h1 className="mt-2 text-3xl font-bold text-center">
            {userToFollow.name ?? userToFollow.displayName}
          </h1>
          <h1 className="mt-2 text-2xl font-bold text-center text-[#666666]">
            @{userToFollow.screenName}
          </h1>

          {userToFollow.following && userToFollow.followers && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex flex-col items-center">
                <h6 className="text-xl">{userToFollow?.followers}</h6>
                <h5 className="text-gray-400">Followers</h5>
              </div>
              <div className="flex flex-col items-center">
                <h6 className="text-xl">{userToFollow?.following}</h6>
                <h5 className="text-gray-400">Followings</h5>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-center mt-6">
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://twitter.com/intent/follow?screen_name=${
                userToFollow.screen_name ?? userToFollow.screenName
              }`}
              className="flex justify-center bg-[#C62828] border-2 border-white text-white px-5 py-2 rounded-lg min-w-[130px] font-semibold"
            >
              Follow
            </a>
            {/* <TwitterFollowButton screenName={user?.screenName} options={{ showScreenName: "false", showCount: false, showIcon: false}}/> */}

            {isVerified ? (
              <h4>Verified</h4>
            ) : (
              <button
                onClick={verifyUserFollow}
                className={`bg-[#454545] border-2 border-white text-white px-5 min-w-[130px] py-2 rounded-lg duration-75 font-semibold ${
                  isVerifying && "opacity-60 pointer-events-none"
                }`}
              >
                {isVerifying ? <Spinner /> : "Verify"}
              </button>
            )}
          </div>

          {followableUsers > 1 && (
              <LoadingButton
                className="mt-4"
                text="Skip"
                onClick={fetchAndChangeUser}
              />
            )}
        </div>
      </div>
    </>
  );
};

export default Follow;
