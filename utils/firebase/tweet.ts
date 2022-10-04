import { calculateLevels, getCurrentTime } from "utils/constants";
import { getDocs, query, where } from "firebase/firestore";
import axios from "axios";
import { differenceInDays, isYesterday } from "date-fns";
import {
  getData,
  openAlert,
  updateUser,
  updateUserData,
} from "./utils";
import { nftCollection, userCollection } from "./config";
import { useQuests } from "hooks/useQuests";

const { setEndedQuotas, setOrdinemUsers, setTweet } = useQuests.getState();
export async function getRandomTweet(address: string, uid: string, updateFlag: boolean) {
  const quotas = {
    like: false,
    comment: false,
  };
  const user = getData(
    await getDocs(query(userCollection, where("wallet", "==", address)))
  )[0];
  let nfts = getData(
    await getDocs(query(nftCollection))
  );

  const level = calculateLevels(nfts.filter(nft => nft?.twitter === user.screenName).length ?? 1);
  const today = await getCurrentTime();

  if (user.likeCount >= level) {
    if (
      isYesterday(user.lastLiked.toDate()) ||
      differenceInDays(today, user.lastLiked.toDate()) > 0
    ) {
      updateUser(user._id, {
        likeCount: 0,
      });
    } else {
      quotas.like = true;
    }
  }
  if (user.replyCount >= level) {
    if (
      isYesterday(user.lastReplied.toDate()) ||
      differenceInDays(today, user.lastReplied.toDate()) > 0
    ) {
      updateUser(user?._id, {
        replyCount: 0,
      });
    } else {
      quotas.comment = true;
    }
  }
  setEndedQuotas(quotas);

  if (quotas.like && quotas.comment) {
    const message = "Likes and Reply quotas expired for today";
    openAlert({
      message,
      status: "error",
    });
    throw new Error(message);
  } else if (quotas.like || quotas.comment) {
    const ended = quotas.like ? "Likes" : "Reply";
    const message = `Quota for ${ended} expired`;
    openAlert({
      message,
      status: "error",
    });
  }

  let users = getData(
    await getDocs(query(userCollection, where("wallet", "!=", address)))
    // await getDocs(query(userCollection))
  );

  users = users.filter((user) => nfts.filter((nft) => nft.twitter == user.screenName).length);

  let tweet = null;

  if (!users.length) {
    return;
  }

  let retryTime = 0;
  while (!tweet && retryTime <= 30) {
    retryTime++;
    let index = user?.lastTweetUserIndex ?? -1;
    if (retryTime > 1 || index < 0 || updateFlag) {
      index = Math.ceil(Math.random() * users.length) - 1;
    }
    const randomUser = users[index];
    const currentUserId = randomUser.uid;

    let result: any = {};
    if (retryTime == 1 && user?.lastTweetIndex && user?.lastTweetIndex >= 0 && !updateFlag) {
      result = await axios.get(
        `/api/get-twitter-random-tweet?user_id=${currentUserId}&tweet_id=${user?.lastTweetIndex}`
      );
    } else {
      result = await axios.get(
        `/api/get-twitter-random-tweet?user_id=${currentUserId}`
      );
    }
    console.dir(result.data, {depth: 3})
    const tweetData = result.data.data;
    if (!tweetData || !tweetData.id_str) {
      continue;
    }
    const likeVerify = await axios.get(
      `/api/verify-like?user_id=${currentUserId}&tweet_id=${tweetData.id_str}`
    );
    if (likeVerify.data.data) {
      continue;
    }

    const replyVerify = await axios.get(
      `/api/verify-reply?user_id=${currentUserId}&tweet_id=${tweetData.id_str}`
    );
    if (replyVerify.data.data) {
      continue;
    }


    await updateUserData({
      lastTweetUserIndex: index,
      lastTweetIndex: result.data.index,
    })

    tweet = result.data.data;
    break;
  }

  if (retryTime > 30) {
    return false;
  }

  setOrdinemUsers(users);
  setTweet(tweet.id_str);
  return true;
}

// export const fetchAndChangeTweet = async () => {
//   const { ordinemUsers: users } = useQuests.getState();

//   const index = Math.ceil(Math.random() * users.length) - 1;
//   const _user = users[index];

//   if (!_user) return;
//   const currentUserId = getCurrentUserId();
//   const currentUserData = await getCurrentUserData();
//   const nftCount = (await getNftsFromAddress())
//   const level = calculateLevels(currentUserData.nftCount ?? 1);
//   const quota = {
//     like: false,
//     comment: false,
//   };
//   if (currentUserData.likeCount >= level) {
//     quota.like = true;
//   }
//   if (currentUserData.replyCount >= level) {
//     quota.comment = true;
//   }
//   setEndedQuotas(quota);
//   if (quota.comment && quota.like) return;

//   const result = await axios.get(
//     `/api/get-twitter-random-tweet?user_id=${_user.uid}`
//   );
//   const tweetData = result.data.data;
//   if (!tweetData) {
//     return false;
//   }

//   const likeVerify = await axios.get(
//     `/api/verify-like?user_id=${currentUserId}&tweet_id=${tweetData.id_str}`
//   );
//   if (likeVerify.data.data) {
//     false;
//   }

//   const replyVerify = await axios.get(
//     `/api/verify-reply?user_id=${currentUserId}&tweet_id=${tweetData.id_str}`
//   );
//   if (replyVerify.data.data) {
//     return false;
//   }

//   if (tweetData && tweetData.id_str) {
//     setTweet(tweetData.id_str);

//     return true;
//   } else {
//     return false;
//   }
// };
