const test = require('ava');
const Api = require('../src/api');

const token = '42:QWERTY';
const testMethod = 'test';

test('should contain the token in the header', async (t) => {
  const cryptoPay = new Api(token);
  const { headers } = cryptoPay.buildRequest(testMethod);
  if (headers && headers['Crypto-Pay-API-Token'] === token) t.pass();
});

test('should change default protocol option in the request', async (t) => {
  const protocol = 'ftp';
  const cryptoPay = new Api(token, { protocol });
  const { body } = cryptoPay.buildRequest(testMethod);
  t.true(RegExp(`^${protocol}://`).test(body));
});

test('should change hostname option in the request', async (t) => {
  const hostname = 'testnet-pay.crypt.bot';
  const cryptoPay = new Api(token, { hostname });
  const { body } = cryptoPay.buildRequest(testMethod);
  t.true(RegExp(`://${hostname}/`).test(body));
});

test('should trim protocol in hostname option', async (t) => {
  const hostname = 'testnet-pay.crypt.bot';
  const wrongHostname = `ssh://${hostname}`;
  const cryptoPay = new Api(token, { hostname: wrongHostname });
  const { body } = cryptoPay.buildRequest(testMethod);
  t.true(RegExp(`https://${hostname}/`).test(body));
});

test('should remove empty params in the request', async (t) => {
  const params = { a: undefined, b: null, c: '' };
  const cryptoPay = new Api(token);
  const { body } = cryptoPay.buildRequest(testMethod, params);
  t.true(RegExp(`/${testMethod}$`).test(body));
});

test('should contain params in the request', async (t) => {
  const params = { a: 1, b: 'btc' };
  const cryptoPay = new Api(token);
  const { body } = cryptoPay.buildRequest(testMethod, params);
  t.true(RegExp(`/${testMethod}\\?a=1&b=btc`).test(body));
});
