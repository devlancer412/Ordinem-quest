import { useEffect, useState } from "react";
import { getAllUsers } from "utils/firebase";

const formatWalletString = (str: string) => {
    return str.substring(0, 4) + "..." + str.substring(str.length - 4, str.length);
}

const GlobalState = () => {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const users = await getAllUsers();
            setUsers(users);
        })();
    }, []);

    console.log(users);

    return <div className="global-state w-full h-full py-[23px]">
        <table className="w-full h-full rounded-[20px]">
            <thead>
                <tr>
                    <th></th>
                    <th>Wallet ID</th>
                    <th>Total Gold Earned</th>
                    <th>Total Solana Revenue</th>
                    <th>Total Raids</th>
                </tr>
            </thead>
            <tbody>
                {users?.map((user, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{formatWalletString(user?.wallet ?? '')}</td>
                        <td>{user?.tokensEarned ?? 0}</td>
                        <td>{user?.swapedSol ?? 0}</td>
                        <td>{(user?.followCount ?? 0) + (user?.likeCount ?? 0) + (user?.replyCount ?? 0)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default GlobalState;
