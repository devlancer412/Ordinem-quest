import { User } from "firebase/auth";
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
}