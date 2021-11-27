/* eslint-disable camelcase */
import url from 'url';
import fetch from 'node-fetch';

export const Assets = Object.freeze({
  BTC: 'BTC',
  TON: 'TON',
  ETH: 'ETH',
  USDT: 'USDT',
  USDC: 'USDC',
  BUSD: 'BUSD',
});

export const PaidButtonNames = Object.freeze({
  VIEW_ITEM: 'viewItem',
  OPEN_CHANNEL: 'openChannel',
  OPEN_BOT: 'openBot',
  CALLBACK: 'callback',
});

const defaultOptions = {
  protocol: 'https',
  hostname: 'pay.crypt.bot',
};

export class CryptoPay {
  /**
   * First, you need to create your application and get an API token. Open [@CryptoBot](http://t.me/CryptoBot?start=pay) or [@CryptoTestnetBot](http://t.me/CryptoTestnetBot?start=pay) (for testnet), send a command `/pay` to create a new app and get API Token.
   * @param {string} token - Your API token
   * @param {Object} [options]
   * @param {string} [options.protocol] - All queries to the Crypto Pay API must be sent over **HTTPS**
   * @param {string} [options.hostname] - Use `pay.crypt.bot` for mainnet and `testnet-pay.crypt.bot` for testnet
   */
  constructor(token, options) {
    this.token = token;
    if (options && options.hostname) {
      // Trim protocol
      const hostname = options.hostname.match(/(\w*:\/\/)?(.+)/)[2];
      options.hostname = hostname;
    }
    this.options = { ...defaultOptions, ...options };
  }

  buildRequest(method, params = {}) {
    // Remove empty params
    Object.keys(params).forEach(
      // eslint-disable-next-line no-param-reassign
      (key) => [undefined, null, ''].some((empty) => params[key] === empty) && delete params[key],
    );

    return url.format({ ...this.options, pathname: `app${this.token}/${method}`, query: params }, {});
  }

  async makeRequest(request) {
    const res = await fetch(request);
    const data = await res.json();
    if (!data.ok) {
      let message = 'API call failed';
      if (data.error) {
        message += `: ${JSON.stringify(data.error)}`;
      }
      throw new Error(message);
    }

    return data.result;
  }

  async callApi(method, params) {
    const request = this.buildRequest(method, params);
    return this.makeRequest(request);
  }

  /**
   * A simple method for testing your app's authentication token. Requires no parameters. Returns basic information about the app
   */
  getMe() {
    return this.callApi('getMe');
  }

  /**
   * Use this method to create a new invoice. Returns object of created invoice
   * @param {string} asset - Currency code. Supported assets: `BTC`, `TON`, `ETH` (only testnet), `USDT`, `USDC`, `BUSD`
   * @param {string} amount - Amount of invoice. For example: `125.50`
   * @param {Object} [options]
   * @param {string} [options.description] - Optional. Description of invoice. Up to 1024 symbols
   * @param {string} [options.paid_btn_name] - Optional. Paid button name. This button will be shown when your invoice was paid
   * Supported names: `viewItem` - View Item, `openChannel` - Open Channel, openBot - Open Bot, callback - Return
   * @param {string} [options.paid_btn_url] - Optional. Paid button URL. You can set any payment success link (for example link on your bot)
   * @param {string} [options.payload] - Optional. Some data. User ID, payment id, or any data you want to attach to the invoice; up to 1kb
   */
  // eslint-disable-next-line no-undef
  async createInvoice(asset, amount, options = { description, paidBtnName, paidBtnUrl, payload }) {
    return this.callApi('createInvoice', { asset, amount, ...options });
  }

  /**
   * Use this method to get invoices of your app. On success, the returns array of invoices
   * @param {Object} [options]
   * @param {string} [options.asset] - Optional. Currency code. Supported assets: `BTC`, `TON`, `ETH` (only testnet), `USDT`, `USDC`, `BUSD`. Default: all assets
   * @param {string} [options.invoice_ids] - Optional. Invoice IDs separated by comma
   * @param {string} [options.status] - Optional. Status of invoices. Available statusses: active or paid. Default: all statusses
   * @param {number} [options.offset] - Optional. Offset needed to return a specific subset of invoices. Default 0
   * @param {number} [options.count] - Optional. Number of invoices to return. Default 100, max 1000
   */
  // eslint-disable-next-line no-undef, no-restricted-globals
  async getInvoices(options = { asset, invoice_ids, status, offset, count }) {
    return this.callApi('getInvoices', options);
  }

  /**
   * Use this method to get paid and unconfirmed invoices of your app. On success, the returns array of paid and unconfirmed invoices
   * @param {Object} [options]
   * @param {number} [options.offset] - Optional. Offset needed to return a specific subset of  invoices. Default 0
   * @param {number} [options.count] - Optional. Number of invoices to return. Default 100, max 1000
   */
  // eslint-disable-next-line no-undef
  async getPayments(options = { offset, count }) {
    return this.callApi('getPayments', options);
  }

  /**
   * Use this method to confirm paid invoice of your app. On success, the return confirmed invoice
   * @param {number} invoice_id - Invoice ID you want to confirm
   */
  async confirmPayment(invoice_id) {
    return this.callApi('confirmPayment', { invoice_id });
  }

  /**
   * Use this method to get balance of your app. Returns array of assets
   */
  async getBalance() {
    return this.callApi('getBalance');
  }

  /**
   * Use this method to get exchange rates of supported currencies. Returns array of currencies
   */
  async getExchangeRates() {
    return this.callApi('getExchangeRates');
  }

  /**
   * Use this method to supported currencies. Returns array of currencies
   */
  async getCurrencies() {
    return this.callApi('getCurrencies');
  }
}
