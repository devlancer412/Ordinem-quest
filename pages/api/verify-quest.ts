import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BEARER_TOKEN = process.env.NEXT_PUBLIC_TWITTER_BEARER;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user_id = req.body.user_id ?? req.query.user_id;
    const tweet_id = req.body.tweet_id ?? req.query.tweet_id;

    if (!user_id || !user_id.trim()) {
        res.json({
            status: "error",
            error: "Enter a valid id",
        });

        return;
    }

    try {
        const likeResult = await axios.get(`https://api.twitter.com/2/users/${user_id}/liked_tweets`, {
            headers: {
                authorization: `Bearer ${BEARER_TOKEN}`,
            },
        });
        const liked = likeResult.data.data.filter((data: any) => data.id === tweet_id);

        if(liked.length == 0 ) {
            res.json({
                status: "ok",
                data: false,
                message: "You didn't do -like- to this quest."
            });
            return;
        }

        let params: any = { user_id };
        const replyResult = await axios.get('https://api.twitter.com/1.1/statuses/user_timeline.json', {
            params,
            headers: {
                authorization: `Bearer ${BEARER_TOKEN}`,
            },
        });
        const replyed = replyResult.data.filter(
            (data: any) =>
                data.in_reply_to_status_id_str &&
                data.in_reply_to_status_id_str === tweet_id
        );
        if(replyed.length == 0 ) {
            res.json({
                status: "ok",
                data: false,
                message: "You didn't do -comment- to this quest."
            });
            return;
        }

        const tweetResult = await axios.get(`https://api.twitter.com/2/tweets/${tweet_id}?user.fields=&place.fields=&tweet.fields=&expansions=author_id`, {
            headers: {
                authorization: `Bearer ${BEARER_TOKEN}`,
            },
        });

        const twitterId = tweetResult.data?.includes?.users[0]?.id;

        params.user_id = twitterId;
        const followingResult = await axios.get(`http://api.twitter.com/1.1/followers/ids.json`, {
            params,
            headers: {
                authorization: `Bearer ${BEARER_TOKEN}`,
            },
        })
        
        const { ids: followingIds } = followingResult.data;
        const followed = followingIds.filter((data: any) => data == user_id);

        if(followed.length == 0 ) {
            res.json({
                status: "ok",
                data: false,
                message: "You didn't do -follow- to this quest."
            });
            return;
        }

        res.json({
            status: "ok",
            data: true,
        });

    } catch (error: any) {
        // console.log(error);
        res.json({
            status: "error",
            data: error.message || "Something went wrong",
        });
    }
};

export default handler;