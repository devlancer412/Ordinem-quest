import { User } from "firebase/auth";
import { Deadlines } from "utils/constants";
export { }

declare global {
    type UserType = User & {
        screenName?: string;
        followers?: number | string;
        following?: number | string;
        profile_image?: string;
    };

    type NFT = {
        name: string;
        standard: string;
        symbol: string;
        image: string;
        twitter?: string;
        mint?: string;
        [key: string]: any;
    };

    type Deadline = typeof Deadlines[number];

    type Quest = {
        title: string;
        description: string;
        deadline: Deadline;
        link: string;
        rewardAmount: number;
        createdTime?: string;
        [key: string]: any;
    }
}