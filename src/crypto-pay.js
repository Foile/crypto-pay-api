/* eslint-disable camelcase */
const EventEmitter = require('events');
const Api = require('./api');
const Webhooks = require('./webhooks');

const Assets = Object.freeze({
  BTC: 'BTC',
  TON: 'TON',
  ETH: 'ETH',
  USDT: 'USDT',
  USDC: 'USDC',
});

const PaidButtonNames = Object.freeze({
  VIEW_ITEM: 'viewItem',
  OPEN_CHANNEL: 'openChannel',
  OPEN_BOT: 'openBot',
  CALLBACK: 'callback',
});

const UpdateTypes = ['invoice_paid'];

const defaultOptions = {
  updateVerification: true,
};

class CryptoPay {
  /**
   * First, you need to create your application and get an API token.
   * Open [@CryptoBot](http://t.me/CryptoBot?start=pay) or [@CryptoTestnetBot](http://t.me/CryptoTestnetBot?start=pay) (for testnet),
   * send a command `/pay` to create a new app and get API Token.
   * @param {string} token - Your API token
   * @param {Object} [options]
   * @param {string} [options.protocol] - All queries to the Crypto Pay API must be sent over **HTTPS**
   * @param {string} [options.hostname] - Use `pay.crypt.bot` for mainnet and `testnet-pay.crypt.bot` for testnet
   * @param {boolean} [options.updateVerification] - Allow verification to check update data by signature.Defaults to true
   * @param {Object} [options.webhook]
   * @param {string} options.webhook.serverHostname - Webhook server hostname
   * @param {number} [options.webhook.serverPort] - Webhook server port. Defaults to 80
   * @param {string} options.webhook.path - Webhook secret path
   * @param {Object} [options.webhook.tls] - Webhook TLS options
   */
  constructor(token, options) {
    this.options = { ...defaultOptions, ...options };

    const emitter = new EventEmitter();
    this.on = emitter.on.bind(emitter);
    this.once = emitter.once.bind(emitter);
    this.off = emitter.removeListener.bind(emitter);
    this.emit = emitter.emit.bind(emitter);

    const api = new Api(token, this.options);
    this.callApi = api.callApi.bind(api);

    if (this.options.webhook) {
      this.webhooks = new Webhooks(token, this.options, this.handleUpdate.bind(this));
    }
  }

  // API
  /**
   * A simple method for testing your app's authentication token.
   * Requires no parameters. Returns basic information about the app
   */
  getMe() {
    return this.callApi('getMe');
  }

  /**
   * Use this method to create a new invoice. Returns object of created invoice
   * @param {string} asset - Currency code. Supported assets: `BTC`, `TON`, `ETH`, `USDT` and `USDC`
   * @param {string} amount - Amount of the invoice in float. For example: `125.50`
   * @param {Object} [options]
   * @param {string} [options.description] - Optional. Description for the invoice. User will see this description when they pay the invoice. Up to 1024 characters
   * @param {string} [options.hidden_message] - Optional. Text of the message that will be shown to a user after the invoice is paid. Up to 2048 characters
   * @param {string} [options.paid_btn_name] - Optional. Name of the button that will be shown to a user after the invoice is paid.
   * Supported names: `viewItem` - View Item, `openChannel` - View Channel, openBot - Open Bot, callback - Return
   * @param {string} [options.paid_btn_url] - Optional. Required if paid_btn_name is used. URL to be opened when the button is pressed. You can set any success link (for example, a link to your bot). Starts with https or http
   * @param {string} [options.payload] - Optional. Any data you want to attach to the invoice (for example, user ID, payment ID, ect). Up to 4kb
   * @param {boolean} [options.allow_comments] - Optional. Allow a user to add a comment to the payment. Default is true
   * @param {boolean} [options.allow_anonymous] - Optional. Allow a user to pay the invoice anonymously. Default is true
   * @param {number} [options.expires_in] - Optional. You can set a payment time limit for the invoice in seconds. Values between 1-2678400 are accepted
   */
  // eslint-disable-next-line no-undef
  async createInvoice(asset, amount, options = {}) {
    return this.callApi('createInvoice', { asset, amount, ...options });
  }

  /**
   * Use this method to send coins from your app to the user. Returns object of completed transfer
   * @param {number} user_id - Telegram User ID
   * @param {string} asset - Currency code. Supported assets: `BTC`, `TON`, `ETH`, `USDT` and `USDC`
   * @param {string} amount - Amount of the transfer in float. The minimum and maximum amounts for each of the support asset roughly correspond to the limit of 1-25000 USD. Use getExchangeRates to convert amounts. For example: `125.50`
   * @param {string} spend_id - Uniq ID to make your request idempotent. Up to 64 symbols
   * @param {Object} [options]
   * @param {string} [options.comment] - Optional. Comment for the transfer. Users will see this comment when they receive a notification about the transfer. Up to 1024 symbols
   * @param {boolean} [options.disable_send_notification] - Optional. Pass true if the user should not receive a notification about the transfer. Default is false
   */
  async transfer(user_id, asset, amount, spend_id, options = {}) {
    return this.callApi('transfer', { user_id, asset, amount, spend_id, ...options });
  }

  /**
   * Use this method to get invoices of your app. On success, the returns array of invoices
   * @param {Object} [options]
   * @param {string} [options.asset] - Optional. Currency codes separated by comma.
   * Supported assets: `BTC`, `TON`, `ETH`, `USDT` and `USDC`. Defaults to all assets
   * @param {string} [options.invoice_ids] - Optional. Invoice IDs separated by comma
   * @param {string} [options.status] - Optional. Status of invoices to be returned. Available statuses: `active` and `paid`. Defaults to all statuses
   * @param {number} [options.offset] - Optional. Offset needed to return a specific subset of invoices. Default is 0
   * @param {number} [options.count] - Optional. Number of invoices to be returned. Values between 1-1000 are accepted. Default is 100
   */
  // eslint-disable-next-line no-undef, no-restricted-globals
  async getInvoices(options = {}) {
    return this.callApi('getInvoices', options);
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

  // Webhooks
  /**
   * Subscribe to an invoice paid event
   * @param {function} handler – Invoice paid handler
   */
  invoicePaid(handler) {
    return this.on('invoice_paid', handler);
  }

  /**
   * @private
   */
  handleUpdate(update) {
    const { update_type, ...data } = update;

    if (!UpdateTypes.some((key) => key === update_type)) return;

    this.emit(update_type, data);
  }
}

module.exports = { CryptoPay, Assets, PaidButtonNames };
