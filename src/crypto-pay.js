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
  BUSD: 'BUSD',
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
   * @param {string} asset - Currency code. Supported assets: `BTC`, `TON`, `ETH` (only testnet), `USDT`, `USDC`, `BUSD`
   * @param {string} amount - Amount of the invoice in float. For example: `125.50`
   * @param {Object} [options]
   * @param {string} [options.description] - Optional. Description of invoice. Up to 1024 symbols
   * @param {string} [options.hidden_message] - Optional. The message will show when the user pays your invoice
   * @param {string} [options.paid_btn_name] - Optional. Paid button name. This button will be shown when your invoice was paid
   * Supported names: `viewItem` - View Item, `openChannel` - Open Channel, openBot - Open Bot, callback - Return
   * @param {string} [options.paid_btn_url] - Optional. Paid button URL. You can set any payment success link (for example link on your bot)
   * @param {string} [options.payload] - Optional. Some data. User ID, payment id, or any data you want to attach to the invoice; up to 4kb
   * @param {boolean} [options.allow_comments] - Optional. Allow adding comments when paying an invoice. Default is true
   * @param {boolean} [options.allow_anonymous] - Optional. Allow pay invoice as anonymous. Default is true
   * @param {number} [options.expires_in] - Optional. You can set the expiration date of the invoice in seconds. Use this period: 1-2678400 seconds
   */
  // eslint-disable-next-line no-undef
  async createInvoice(asset, amount, options = {}) {
    return this.callApi('createInvoice', { asset, amount, ...options });
  }

  /**
   * Use this method to send coins from your app to the user. Returns object of completed transfer
   * @param {number} user_id - Telegram User ID
   * @param {string} asset - Currency code. Supported assets: `BTC`, `TON`, `ETH` (only testnet), `USDT`, `USDC`, `BUSD`
   * @param {string} amount - Amount of the transfer in float. For example: `125.50`
   * @param {string} spend_id - Uniq ID to make your request idempotent. Up to 64 symbols
   * @param {Object} [options]
   * @param {string} [options.comment] - Optional. The comment of the invoice. Up to 1024 symbols
   */
  async transfer(user_id, asset, amount, spend_id, options = {}) {
    return this.callApi('transfer', { user_id, asset, amount, spend_id, ...options });
  }

  /**
   * Use this method to get invoices of your app. On success, the returns array of invoices
   * @param {Object} [options]
   * @param {string} [options.asset] - Optional. Currency code.
   * Supported assets: `BTC`, `TON`, `ETH` (only testnet), `USDT`, `USDC`, `BUSD`. Default: all assets
   * @param {string} [options.invoice_ids] - Optional. Invoice IDs separated by comma
   * @param {string} [options.status] - Optional. Status of invoices. Available statusses: active or paid. Default: all statusses
   * @param {number} [options.offset] - Optional. Offset needed to return a specific subset of invoices. Default 0
   * @param {number} [options.count] - Optional. Number of invoices to return. Default 100, max 1000
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
