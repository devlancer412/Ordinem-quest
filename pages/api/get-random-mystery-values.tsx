import type { NextApiRequest, NextApiResponse } from "next";
import { baseStr } from "utils/constants";
import crypto from 'crypto';
import { getUserFromAddress, updateUser } from "utils/firebase";
import { increment } from "firebase/firestore";

const availableItems: RollItem[] = [
    {
        type: 'Nothing',
        amount: 0,
    },
    {
        type: 'Nothing',
        amount: 1,
    },
    {
        type: 'Nothing',
        amount: 2,
    },
    {
        type: 'Nothing',
        amount: 3,
    },
    {
        type: 'Nothing',
        amount: 4,
    },
    {
        type: 'Gold',
        amount: 50,
    },
    {
        type: 'Gold',
        amount: 100,
    },
    {
        type: 'Gold',
        amount: 150,
    },
    {
        type: 'Gold',
        amount: 200,
    },
    {
        type: 'Gold',
        amount: 250,
    },
    {
        type: 'Sol',
        amount: 0.5,
    },
    {
        type: 'Sol',
        amount: 1,
    },
    {
        type: 'Sol',
        amount: 2,
    },
]

const between = (min: number, max: number) => {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user_wallet = req.body.user_wallet ?? req.query.user_wallet;
    const user = await getUserFromAddress(user_wallet);

    const rollbase = (user?.rollbase ?? 0);

    let items: RollItem[] = [];
    
    for (let i = 0; i < 50; i++) {
        const random = 13 - Math.floor(Math.pow(between(1, 2743), 1 / 3));
        const hashValue = crypto.createHash('sha256').update(`${baseStr}${user_wallet}${rollbase}${random}`).digest().toString('hex');
        const newItem = { ...availableItems[random], hash: hashValue };
        items.push(newItem);
    }

    return res.json({ items })
}

export default handler;