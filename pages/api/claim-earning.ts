import type { NextApiRequest, NextApiResponse } from "next";
import { baseStr } from "utils/constants";
import crypto from 'crypto';
import { getUserFromAddress} from "utils/firebase";
import { increment } from "firebase/firestore";
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { decode } from "bs58";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, TokenAccountNotFoundError, TokenInvalidAccountOwnerError, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const availableItems: RollItem[] = [
    {
        type: 'Nothing',
        amount: 0,
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
        amount: 200,
    },
    {
        type: 'Gold',
        amount: 500,
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
    {
        type: 'Sol',
        amount: 5,
    },
]

async function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): Promise<PublicKey> {
    return await getAssociatedTokenAddress(tokenMintAddress, walletAddress);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user_wallet = req.body.user_wallet ?? req.query.user_wallet;
    const type = req.body.type ?? req.query.type;
    const amount = parseFloat(req.body.amount ?? req.query.amount);
    const hash = req.body.hash ?? req.query.hash;

    if (type == 'Nothing') {
        res.json({
            success: 'error',
            data: 'Invalid Input',
        })
        return;
    }

    const user = await getUserFromAddress(user_wallet);

    const rollbase = user?.rollbase ?? 0;

    let index = 0;
    for (; index < 9; index++) {
        if (availableItems[index].type == type && availableItems[index].amount == amount) {
            break;
        }
    }

    console.log('result', `${baseStr}${user_wallet}${rollbase}${index}`);
    const hashValue = crypto.createHash('sha256').update(`${baseStr}${user_wallet}${rollbase}${index}`).digest().toString('hex');

    if (hashValue != hash) {
        res.json({
            success: 'error',
            data: 'Invalid hash',
        })
        return;
    }

    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    const tx = new Transaction();

    const mintAddress = new PublicKey(process.env.NEXT_PUBLIC_MINT_TOKEN_ADDRESS as string);
    const keypair = Keypair.fromSecretKey(decode(process.env.NEXT_PUBLIC_WALLET_PRIVATE as string));

    const fromAddress = keypair.publicKey;
    const toAddress = new PublicKey(user_wallet);

    if (type == 'Gold') {
        const fromTokenAccount = await findAssociatedTokenAddress(
            fromAddress,
            mintAddress
        );
        const toTokenAccount = await findAssociatedTokenAddress(
            toAddress,
            mintAddress
        );

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
                amount * 10 ** 8, // amount to transfer
                8, // decimals of token
                [],
                TOKEN_PROGRAM_ID
            )
        );
    } else {
        tx.add(
            SystemProgram.transfer({
                fromPubkey: fromAddress,
                toPubkey: toAddress,
                lamports: amount * LAMPORTS_PER_SOL,
            })
        )
    }

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
}

export default handler;