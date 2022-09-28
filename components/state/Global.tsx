import { useEffect, useState } from "react";
import { getAllUsers } from "utils/firebase";

const initialData = [
  {
    wallet: "5NJV..ky5y",
    earnedGold: "585,000",
    solValue: 10,
    totalRaids: "1,528",
  },
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
];

const GlobalState = () => {
  const [users, setUsers] = useState<any[]>(initialData);

  // useEffect(() => {
  //     (async () => {
  //         const users = await getAllUsers();
  //         console.log(users);
  //         setUsers(users);
  //     })
  // }, []);

  // console.log(users);

  return (
    <div className="flex justify-center global-state w-full h-full py-[23px]">
      <table className="w-[80%] h-full rounded-[20px]">
        <thead>
          <tr>
            <th></th>
            <th>Wallet ID</th>
            <th>Total Gold Earned</th>
            <th>Total Solana Revenue</th>
            <th>Total Raids</th>
          </tr>
        </thead>
        <tbody className="max-h-[200px] overflow-y-scroll">
          {users?.map((user, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{user?.wallet ?? ""}</td>
              <td>{user?.earnedGold ?? ""}</td>
              <td>{user?.solValue ?? ""}</td>
              <td>{user?.totalRaids ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GlobalState;
