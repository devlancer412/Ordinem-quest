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

        const depositAmount = price - user.tokensWithdrawable;

        const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

        const mintAddress = new PublicKey(process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS as string);
        const keypair = Keypair.fromSecretKey(decode(process.env.NEXT_PUBLIC_WALLET_PRIVATE as string));

        const fromAddress = new PublicKey(user_wallet);
        const toAddress = keypair.publicKey;

        const fromTokenAccount = await findAssociatedTokenAddress(
            fromAddress,
            mintAddress
        );
        const toTokenAccount = await findAssociatedTokenAddress(
            toAddress,
            mintAddress
        );

        const tx = new Transaction();

        tx.add(
            createTransferCheckedInstruction(
                fromTokenAccount,
                mintAddress,
                toTokenAccount,
                fromAddress,
                depositAmount * 10 ** 8, // amount to transfer
                8, // decimals of token
                [],
                TOKEN_PROGRAM_ID
            )
        );

        const { blockhash } = await connection.getLatestBlockhash();

        tx.feePayer = toAddress;
        tx.recentBlockhash = blockhash;

        const serializedTransaction = tx.serialize();

        res.json({
            status: "ok",
            needTx: true,
            tx: serializedTransaction.toString("base64"),
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