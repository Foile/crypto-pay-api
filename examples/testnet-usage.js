/* eslint-disable no-console */
const { CryptoPay } = require('@foile/crypto-pay-api');

const token = '42:YOURTOKEN';

(async function run() {
  // Set hostname to testnet
  const cryptoPay = new CryptoPay(token, { hostname: 'testnet-pay.crypt.bot' });

  const app = await cryptoPay.getMe();
  console.log(app);
})();
