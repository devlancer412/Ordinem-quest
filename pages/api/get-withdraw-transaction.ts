import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromAddress, updateUser } from '../../utils/firebase/utils';
import { decode } from 'bs58';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint, TokenAccountNotFoundError, TokenInvalidAccountOwnerError, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { rpcEndpoint } from "utils/constants";

async function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): Promise<PublicKey> {
    return await getAssociatedTokenAddress(tokenMintAddress, walletAddress);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user_wallet = req.body.user_wallet ?? req.query.user_wallet;

    if (!user_wallet) {
        res.json({
            status: "error",
            error: "Enter a valid id",
        });

        return;
    }

    try {
        const user = await getUserFromAddress(user_wallet);

        if (!user.tokensWithdrawable) {
            res.json({
                status: "error",
                error: "Don't have any token",
            });

            return;
        }

        updateUser(user._id, {
            tokensWithdrawable: 0,
        })
        
        const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

        const mintAddress = new PublicKey(process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS as string);
        const keypair = Keypair.fromSecretKey(decode(process.env.NEXT_PUBLIC_WALLET_PRIVATE as string));

        const fromAddress = keypair.publicKey;
        const toAddress = new PublicKey(user_wallet);

        const fromTokenAccount = await findAssociatedTokenAddress(
            fromAddress,
            mintAddress
        );
        const toTokenAccount = await findAssociatedTokenAddress(
            toAddress,
            mintAddress
        );

        const tx = new Transaction();

        try {
            await getAccount(connection, toTokenAccount);
        } catch (error: unknown) {
            if (
                error instanceof TokenAccountNotFoundError ||
                error instanceof TokenInvalidAccountOwnerError
            ) {
                tx.add(
                    createAssociatedTokenAccountInstruction(
                        fromAddress,
                        toTokenAccount,
                        toAddress,
                        mintAddress,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }
        }

        tx.add(
            createTransferCheckedInstruction(
                fromTokenAccount,
                mintAddress,
                toTokenAccount,
                fromAddress,
                user.tokensWithdrawable * 10 ** 8, // amount to transfer
                8 // decimals of token
            )
        );

        const { blockhash } = await connection.getLatestBlockhash();

        tx.feePayer = toAddress;
        tx.recentBlockhash = blockhash;

        tx.partialSign(keypair)

        const serializedTransaction = tx.serialize({
            // We will need Alice to deserialize and sign the transaction
            requireAllSignatures: false,
          });

        res.json({
            status: "ok",
            data: serializedTransaction.toString("base64"),
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