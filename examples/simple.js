/* eslint-disable no-console */
const { CryptoPay } = require('@foile/crypto-pay-api');

const token = '42:YOURTOKEN';

(async function run() {
  const cryptoPay = new CryptoPay(token);

  // A simple method for testing your app's authentication token
  const app = await cryptoPay.getMe();
  console.log(app);
})();
