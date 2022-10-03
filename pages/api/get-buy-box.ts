import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromAddress, updateUser } from '../../utils/firebase/utils';
import { decode } from 'bs58';
import { createTransferCheckedInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { increment } from "firebase/firestore";

async function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): Promise<PublicKey> {
    return await getAssociatedTokenAddress(tokenMintAddress, walletAddress);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user_wallet = req.body.user_wallet ?? req.query.user_wallet;
    const price = req.body.price ?? req.query.price ?? 250;

    if (!user_wallet) {
        res.json({
            status: "error",
            error: "Enter a valid id",
        });

        return;
    }

    try {
        const user = await getUserFromAddress(user_wallet);

        if (user.tokensWithdrawable >= price) {
            updateUser(user._id, {
                tokensWithdrawable: increment(-price),
            });

            res.json({
                status: "ok",
                needTx: false,
            });

            return;
        }

        const depositAmount = price - (user?.tokensWithdrawable ?? 0);

        res.json({
            status: "ok",
            needTx: true,
            restAmount: depositAmount,
        });
        
        return;
    } catch (error: any) {
        console.log(error);
        res.json({
            status: "error",
            data: error.message || "Something went wrong",
        });
    }
};

export default handler;