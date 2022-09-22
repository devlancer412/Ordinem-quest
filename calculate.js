const result = Math.round((5 / 10) * 100);
const nfts = 2;
const tokenAmt = 5;

for (let i = 2; i <= 12; i++) {
    const amount = tokenAmt + ((i - 1) * tokenAmt) / 10
  console.log(i, '==' , amount, ' Dec:', amount* 10 **8);
}

// const { isYesterday } = require("date-fns");

// console.log(isYesterday(new Date('2022-09-13T11:24:00')));
