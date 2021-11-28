const test = require('ava');
const { CryptoPay } = require('./index');

const token = '42:QWERTY';
const testMethod = 'test';

test('should contain the token in the request', async (t) => {
  const cryptoPay = new CryptoPay(token);
  const request = cryptoPay.buildRequest(testMethod);
  t.true(RegExp(`/app${token}/`).test(request));
});

test('should change default protocol option in the request', async (t) => {
  const protocol = 'ftp';
  const cryptoPay = new CryptoPay(token, { protocol });
  const request = cryptoPay.buildRequest(testMethod);
  t.true(RegExp(`^${protocol}://`).test(request));
});

test('should change hostname option in the request', async (t) => {
  const hostname = 'testnet-pay.crypt.bot';
  const cryptoPay = new CryptoPay(token, { hostname });
  const request = cryptoPay.buildRequest(testMethod);
  t.true(RegExp(`://${hostname}/`).test(request));
});

test('should trim protocol in hostname option', async (t) => {
  const hostname = 'testnet-pay.crypt.bot';
  const wrongHostname = `ssh://${hostname}`;
  const cryptoPay = new CryptoPay(token, { hostname: wrongHostname });
  const request = cryptoPay.buildRequest(testMethod);
  t.true(RegExp(`https://${hostname}/`).test(request));
});

test('should remove empty params in the request', async (t) => {
  const params = { a: undefined, b: null, c: '' };
  const cryptoPay = new CryptoPay(token);
  const request = cryptoPay.buildRequest(testMethod, params);
  t.true(RegExp(`/${testMethod}$`).test(request));
});

test('should contain params in the request', async (t) => {
  const params = { a: 1, b: 'btc' };
  const cryptoPay = new CryptoPay(token);
  const request = cryptoPay.buildRequest(testMethod, params);
  t.is(request, `https://pay.crypt.bot/app${token}/${testMethod}?a=1&b=btc`);
});
