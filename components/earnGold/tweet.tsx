import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { arrayUnion, increment, serverTimestamp } from "firebase/firestore";
import { useNotification } from "hooks/useNotification";
import { useTwitterUser } from "hooks/useTwitterUser";
import { useEffect, useState } from "react";
import {
  fetchAndChangeTweet,
  getRandomTweet,
  updateNftXP,
  updateUserData,
} from "utils/firebase";
import { updateTokensToDB } from "utils/token";
import LoadingButton from "./LoadingButton";
import SuccessPopup from "./SuccessPopup";
import { Tweet as TweetWidget } from "react-twitter-widgets";
import { useQuests } from "hooks/useQuests";
import Image from "next/image";

const Tweet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTweetLoading, setIsTweetLoading] = useState(true);
  const [loadTweet, setLoadTweet] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(false);

  const [isVerified, setIsVerified] = useState({
    like: false,
    comment: false,
    retweet: false,
  });

  const { currentUser } = useTwitterUser();
  const wallet = useAnchorWallet();
  const walletContextState = useWallet();

  const { openNotification } = useNotification();
  const { tweet_id, quotasEnded } = useQuests();

  const changeTweet = async () => {
    setButtonClicked(true);
    const changed = await fetchAndChangeTweet();
    if (changed) {
      setIsVerified({ like: false, comment: false, retweet: false });
      setLoadTweet(true);
      setButtonClicked(false);
      setIsTweetLoading(true);
    }
  };

  useEffect(() => {
    if (wallet && currentUser && !tweet_id.length) {
      (async () => {
        setIsLoading(true);
        try {
          await getRandomTweet(
            wallet?.publicKey.toString(),
            currentUser?.providerData[0]?.uid
          );
        } catch (error) {
          console.log(error);
        }
        setIsLoading(false);
      })();
    }
  }, [wallet]);

  const sendTokens = async (quest: string, amount?: number) => {
    if (!wallet) return;
    const _amount = await updateTokensToDB(
      wallet.publicKey.toString(),
      amount ?? 5
    );

    openNotification(() => (
      <SuccessPopup goldRecieved={_amount} quest={quest} />
    ));
  };

  const verifyLike = async () => {
    try {
      setButtonClicked(true);
      const currentUserId = currentUser?.providerData[0].uid;
      const result = await axios.get(
        `/api/verify-like?user_id=${currentUserId}&tweet_id=${tweet_id}`
      );

      console.log(result.data.data);

      if (result.data.data === true) {
        setIsVerified((state) => ({ ...state, like: true }));
        await updateUserData({
          likes: arrayUnion(tweet_id),
          likeCount: increment(1),
          lastLiked: serverTimestamp(),
        });
        await updateNftXP(50);

        sendTokens("like", 5);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setButtonClicked(false);
    }
  };

  const verifyReply = async () => {
    try {
      setButtonClicked(true);
      const currentUserId = currentUser?.providerData[0].uid;
      const result = await axios.get(
        `/api/verify-reply?user_id=${currentUserId}&tweet_id=${tweet_id}`
      );

      if (result.data.data === true) {
        setIsVerified((state) => ({ ...state, comment: true }));
        await updateUserData({
          replies: arrayUnion(tweet_id),
          replyCount: increment(1),
          lastReplied: serverTimestamp(),
        });
        await updateNftXP(100);

        sendTokens("reply", 10);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setButtonClicked(false);
    }
  };

  if (!wallet) {
    return <div className="">Connect your wallet</div>;
  }

  if (isLoading) return <div>Loading ...</div>;

  if (tweet_id.length === 0)
    return (
      <div>
        <h5>No User found in the database that has NFT</h5>
      </div>
    );

  if (quotasEnded.like && quotasEnded.comment)
    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-center">
        <h4>Quotas ended for today</h4>
        <p>Come again tomorrow to take up more like and reply quests</p>
      </div>
    );

  return (
    <>
      <div className="relative py-24">
        <Image src="/tweet-bg.png" className="w-[100%] -z-10" layout="fill" />
        <div className="z-10">
          <div className="max-h-[20rem] mb-4 overflow-x-hidden overflow-y-scroll">
            <div className="flex justify-center rounded-lg overflow-hidden px-[23%]">
              <TweetWidget
                tweetId={tweet_id}
                onLoad={() => {
                  setIsTweetLoading(false);
                  setLoadTweet(false);
                }}
              />
            </div>
          </div>
          {loadTweet && (
            <div className="min-h-[10rem] w-full flex items-center justify-center text-center">
              <h5 className="text-2xl">Loading tweet...</h5>
            </div>
          )}
          {!isTweetLoading && (
            <div className="flex flex-col gap-4 justify-stretch mt-8">
              {!quotasEnded.like && (
                <div className="flex items-center justify-center gap-8 w-full">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://twitter.com/intent/like?tweet_id=${tweet_id}`}
                    className="text-white rounded-[16px] min-w-[130px] max-w-[130px] h-[65px] bg-[#C62828] border-2 border-white drop-shadow-lg flex justify-center text-[20px] items-center"
                  >
                    Like
                  </a>
                  <div>
                    {isVerified.like ? (
                      <h5>Like verified</h5>
                    ) : (
                      <LoadingButton
                        className={`${
                          buttonClicked
                            ? "pointer-events-none cursor-not-allowed"
                            : ""
                        } text-white rounded-[16px] min-w-[130px] max-w-[130px] h-[65px] bg-[#454545] border-2 border-white drop-shadow-lg flex justify-center text-[20px] font-normal items-center`}
                        text="Verify Like"
                        onClick={verifyLike}
                      />
                    )}
                  </div>
                </div>
              )}
              {!quotasEnded.comment && (
                <div className="flex items-center justify-center gap-8 w-full">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://twitter.com/intent/tweet?in_reply_to=${tweet_id}`}
                    className="text-white rounded-[16px] min-w-[130px] max-w-[130px] h-[65px] bg-[#C62828] border-2 border-white drop-shadow-lg flex justify-center text-[20px] items-center"
                  >
                    Comment
                  </a>
                  <div>
                    {isVerified.comment ? (
                      <h5>Reply verified</h5>
                    ) : (
                      <LoadingButton
                        className={`${
                          buttonClicked
                            ? "pointer-events-none cursor-not-allowed"
                            : ""
                        } text-white rounded-[16px] min-w-[130px] max-w-[130px] h-[65px] bg-[#454545] border-2 border-white drop-shadow-lg flex justify-center text-[20px] font-normal items-center`}
                        text="Verify Comment"
                        onClick={verifyReply}
                      />
                    )}
                  </div>
                </div>
              )}

              <LoadingButton
                className={`${
                  buttonClicked ? "pointer-events-none cursor-not-allowed" : ""
                }`}
                text="Skip"
                onClick={changeTweet}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tweet;
