import axios from "axios";
import { differenceInDays, isYesterday } from "date-fns";
import { getDocs, query, where } from "firebase/firestore";
import { useAlert } from "hooks/useAlert";
import { useQuests } from "hooks/useQuests";
import { calculateLevels } from "utils/constants";
import { nftCollection, userCollection } from "./config";
import { getData, updateUser, updateUserData } from "./utils";

const { setUserToFollow, setEndedQuotas, setFollowableUserCount } = useQuests.getState();

const { open: openAlert } = useAlert.getState();

export async function getRandomUser(address: string, uid: string, updateFlag: boolean) {
  const user = getData(
    await getDocs(query(userCollection, where("wallet", "==", address)))
  )[0];
  let nfts = getData(
    await getDocs(query(nftCollection))
  );
  
  const level = calculateLevels(nfts.filter(nft => nft?.twitter === user.screenName).length ?? 1);
  // const today = await getCurrentTime();
  const today = new Date();

  if (user.followCount >= level) {
    if (
      isYesterday(user.lastFollowed.toDate()) ||
      differenceInDays(today, user.lastFollowed.toDate()) > 0
    ) {
      updateUser(user._id, {
        followCount: 0,
      });
    } else {
      const message = "Follow quota ended for today";
      openAlert({
        message,
        status: "error",
      });
      setEndedQuotas({
        follow: true,
      });
      throw new Error(message);
    }
  }

  let users = getData(
    await getDocs(query(userCollection, where("wallet", "!=", address)))
    // await getDocs(query(userCollection))
  );
  users = users.filter((user) => {
    let isFollower = false;
    if (user.followers) {
      isFollower = user.followers.includes(uid);
    }
    let hasNfts = nfts.filter(nft => nft?.twitter === user.screenName).length > 0;

    return hasNfts && !isFollower;
  });

  if(users.length == 0) {
    return;
  }

  let index = (user?.lastFollowIndex ?? -1);
  if(index < 0 || updateFlag) {
    index = Math.ceil(Math.random() * users.length) - 1;
    await updateUserData({
      lastFollowIndex: index,
    })
  }
  let userToFollow = users.splice(index, 1)[0];

  const result = await axios.get(
    `/api/get-twitter-data?user_id=${userToFollow?.uid}`
  );
  userToFollow = { ...userToFollow, ...result.data.data };

  setUserToFollow(userToFollow);
  setFollowableUserCount(users.length);
}

// export const fetchAndChangeUser = async () => {
//   const { indexOfUser, usersToFollow } = useQuests.getState();
//   const currentUserId = getCurrentUserId();

//   const currentUserData = await getCurrentUserData(currentUserId);
//   const nftCount = (await getNftsFromAddress(currentUserData?.wallet)).length;
//   if (
//     currentUserData.followCount >=
//     calculateLevels(nftCount ?? 1)
//   ) {
//     openAlert({
//       message: "Follow quota exceeds",
//       status: "error",
//     });
//     return;
//   }

//   const nextFollowIndex = (indexOfUser + 1) % usersToFollow.length;
//   const user = usersToFollow[nextFollowIndex];
//   if (!user) return;

//   await updateUserData({
//     lastFollowIndex: nextFollowIndex,
//   })

//   const result = await axios.get(`/api/get-twitter-data?user_id=${user.uid}`);
//   return {
//     ...user,
//     ...result.data.data,
//     image: result.data.data.profile_image_url_https.replace("_normal", ""),
//   };
// };
