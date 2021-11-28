/* eslint-disable no-console */
const { CryptoPay, Assets, PaidButtonNames } = require('@foile/crypto-pay-api');

const token = '42:YOURTOKEN';

(async function run() {
  const cryptoPay = new CryptoPay(token, { hostname: 'testnet-pay.crypt.bot' });

  // Create a new invoice with additional data
  const invoice = await cryptoPay.createInvoice(Assets.BTC, 1, {
    description: 'kitten',
    paid_btn_name: PaidButtonNames.VIEW_ITEM,
    paid_btn_url: 'http://placekitten.com/150',
  });
  console.log(invoice);
})();
