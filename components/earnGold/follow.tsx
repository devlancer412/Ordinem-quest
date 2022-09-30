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

  const { fetchAndChangeUser, usersToFollow, indexOfUser, quotasEnded } =
    useQuests();
  const wallet = useAnchorWallet();
  const { currentUser } = useTwitterUser();
  const { openNotification } = useNotification();

  const user = usersToFollow[indexOfUser];

  const fetchUsers = async () => {
    if (!wallet || !currentUser || usersToFollow.length) return;

    setIsLoading(true);
    try {
      await getRandomUser(
        wallet?.publicKey.toString(),
        currentUser?.providerData[0]?.uid
      );
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    clearTimeout(debounceCallback);
    debounceCallback = setTimeout(fetchUsers, 1000);
  }, [wallet]);

  const verifyUserFollow = async () => {
    if (!isVerifying) {
      setIsVerifying(true);
      try {
        const result = await axios.get(
          `/api/get-twitter-followers?user_id=${user.uid}`
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
          await updateUser(user._id, {
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

  if (!user) return null;

  return (
    <>
      <div className="relative flex flex-col items-center h-full px-10 py-20 bg-[#161617af]">
        <Image src="/follow-border.png" className="w-[100%]" layout="fill" />
        <div className="flex flex-col items-center  my-2  h-full rounded-lg z-10">
          <Image
            src={user.image}
            className="rounded-full"
            alt={user.name ?? user.displayName}
            height={200}
            width={200}
          />
          <h1 className="mt-2 text-3xl font-bold">
            {user.name ?? user.displayName}
          </h1>

          {user.following && user.followers && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex flex-col items-center">
                <h6 className="text-xl">{user?.followers}</h6>
                <h5 className="text-gray-400">Followers</h5>
              </div>
              <div className="flex flex-col items-center">
                <h6 className="text-xl">{user?.following}</h6>
                <h5 className="text-gray-400">Followings</h5>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-center mt-6">
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://twitter.com/intent/follow?screen_name=${
                user.screen_name ?? user.screenName
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

          {usersToFollow.length > 0 &&
            indexOfUser !== usersToFollow.length - 1 && (
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
