const {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} = require("firebase/firestore");
const { initializeApp } = require("firebase/app");

const firebaseConfig = {
  apiKey: "AIzaSyDaUnotOtJseK7qi3Wt35UbJ3UAtcfjmVw",
  authDomain: "solana-nfts.firebaseapp.com",
  projectId: "solana-nfts",
  storageBucket: "solana-nfts.appspot.com",
  messagingSenderId: "259626375319",
  appId: "1:259626375319:web:83bf74f2c1684dd6c471d2",
  measurementId: "G-6BV70P11LT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userCollection = collection(db, "users");
const nftCollection = collection(db, "nfts");

const getData = (docs) =>
  docs.docs.map((doc) => ({ ...doc.data(), _id: doc.id }));

async function randomUserFunc() {
  const address = "5NJVqHANi3T2Fkk4VvnqSGthQTPc2juDv3vvpKULky5y";
  const uid = "1468617619062558720";
  let users = getData(
    await getDocs(query(userCollection))
  );
  let nfts = getData(
    await getDocs(query(nftCollection))
  );

  let index = Math.ceil(Math.random() * users.length) - 1;
  users = [...users.splice(index, 1), ...users];

  const searchedUsers = new Set();
  let randomUser;
  let hasNft = false;

  while (!hasNft && searchedUsers.size !== users.length) {
    randomUser = users.pop();
    searchedUsers.add(randomUser._id);

    if (randomUser.followers && randomUser.followers.includes(uid)) {
      console.log("includes id");
      continue;
    }
    hasNft = nfts.filter(nft => nft.twitter == randomUser.screenName).length > 0;
  }

  logUser(users);
}

function logUser(users) {
  console.log(users.map((user) => user.uid));
}

async function getallUsers() {
  let users = getData(await getDocs(query(userCollection)));
  const available = {};
  for (let i = 0; i < users.length; i++) {
    if (!available[users[i].uid]) {
      available[users[i].uid] = 1;
    } else {
      available[users[i].uid] += 1;
    }
  }

  const values = Object.keys(available).filter((key, i) => available[key] > 1)
  console.log(
    values, values.length
  );
}
getallUsers();
