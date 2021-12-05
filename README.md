![CryptoPay](media/header.svg)

# @foile/crypto-pay-api

**[Crypto Pay](http://t.me/CryptoBot/?start=pay)** is a payment system based on [@CryptoBot](http://t.me/CryptoBot), which allows you to accept payments in cryptocurrency using the API.

This library help you to work with **Crypto Pay** via [Crypto Pay API](https://telegra.ph/Crypto-Pay-API-11-25).

## Install

```sh
npm i @foile/crypto-pay-api
```

## Usage

### API

First, you need to create your application and get an API token. Open [@CryptoBot](http://t.me/CryptoBot?start=pay) or [@CryptoTestnetBot](http://t.me/CryptoTestnetBot?start=pay) (for testnet), send a command `/pay` to create a new app and get API Token.

Next step: try to call a simple `getMe()` method to check that everything is working welll:

```js
const { CryptoPay } = require('@foile/crypto-pay-api');
  
const cryptoPay = new CryptoPay(token);
const app = await cryptoPay.getMe();
console.log(app);
```

You can setup net `hostname` (defaults to `pay.crypt.bot`) and `protocol` in optional param:

```js
const cryptoPay = new CryptoPay(token, {
  hostname: 'testnet-pay.crypt.bot',
  protocol: 'https'
});
```

Net     | Bot                                                         | Hostname
------- | ----------------------------------------------------------- |------------------------
mainnet | [@CryptoBot](http://t.me/CryptoBot?start=pay)               | `pay.crypt.bot`
testnet | [@CryptoTestnetBot](http://t.me/CryptoTestnetBot?start=pay) | `testnet-pay.crypt.bot`

> All queries to the Crypto Pay API must be sent over **HTTPS**

You can find all available methods in [next chapter](#Methods).

Also, you can get supported [assets](#Assets) and [paid button names](#Paid-Button-Names):

```js
const { CryptoPay, Assets, PaidButtonNames } = require('@foile/crypto-pay-api');

const cryptoPay = new CryptoPay(token);
cryptoPay.createInvoice(Assets.BTC, 1, {
  description: 'kitten',
  paid_btn_name: PaidButtonNames.VIEW_ITEM,
  paid_btn_url: 'http://placekitten.com/150',
});
```

Look full code in the [examples directory](https://github.com/Foile/crypto-pay-api/tree/main/examples).

### Webhooks

Use Webhooks to get updates for the app.

If you'd like to make sure that the Webhook request comes from Crypto Pay, we recommend using a secret path in the URL, e.g. `https://www.example.com/<secret>`.

> Webhooks will send may at least one time

```js
const cryptoPay = new CryptoPay(token, {
  webhook: {
    serverHostname: 'localhost',
    serverPort: 4200,
    path: '/secret-path'
  },
});

cryptoPay.on('invoice_paid', update => console.log(update.payload));
```

You can use pretty simple alias methods named from update names:

```js
cryptoPay.invoicePaid(update => console.log(update.payload));
```

See all available updates [here](#Update-Types).

## Methods

**API**

* [getMe](#getMe)
* [createInvoice](#createInvoice)
* [getInvoices](#getInvoices)
* [getPayments](#getPayments)
* [confirmPayment](#confirmPayment)
* [getBalance](#getBalance)
* [getExchangeRates](#getExchangeRates)
* [getCurrencies](#getCurrencies)

**Updates**

* [on](#on)
  * [invoicePaid](#invoicePaid)
* [once](#once)
* [off](#off)

### getMe

A simple method for testing your app's authentication token. Requires no parameters. Returns basic information about the app.

```js
cryptoPay.getMe();
```

### createInvoice

Use this method to create a new invoice. Returns object of created invoice.

* **asset** (string)
Currency code. Supported assets: `BTC`, `TON`, `ETH` (only testnet), `USDT`, `USDC`, `BUSD`.
* **amount** (string)
Amount of the invoice in float. For example: `125.50`
* **description** (string)
*Optional*. Description of the invoice. Up to 1024 symbols.
* **paid_btn_name** (string) default - `callback`
*Optional*. Paid button name. This button will be shown when your invoice was paid. Supported names:

  * `viewItem` - View Item
  * `openChannel` - Open Channel
  * `openBot` - Open Bot
  * `callback` - Return

* **paid_btn_url** (string)
*Optional but requried when you use paid_btn_name*. Paid button URL. You can set any payment success link (for example link on your bot). Start with https or http.
* **payload** (string, up to 1kb)
*Optional*. Some data. User ID, payment id, or any data you want to attach to the invoice.
* **allow_comments** (boolean)
*Optional*. Allow adding comments when paying an invoice. Default is true.
* **allow_anonymous** (boolean)
*Optional*. Allow pay invoice as anonymous. Default is true.

```js
cryptoPay.createInvoice(Assets.BTC, 1, {
  description: 'kitten',
  paid_btn_name: PaidButtonNames.VIEW_ITEM,
  paid_btn_url: 'http://placekitten.com/150',
});
```

### getInvoices

Use this method to get invoices of your app. On success, the returns array of invoices.

* **asset** (string)
*Optional*. Currency code. Supported assets: `BTC`, `TON`, `ETH` (only testnet), `USDT`, `USDC`, `BUSD`. Default: all assets.
* **invoice_ids** (string)
*Optional*. Invoice IDs separated by comma.
* **status** (string)
*Optional*. Status of invoices. Available statusses: active or paid. Default: all statusses.
* **offset** (number)
*Optional*. Offset needed to return a specific subset of  invoices. Default 0.
* **count** (number)
*Optional*. Number of invoices to return. Default 100, max 1000.

```js
cryptoPay.getInvoices({ asset: Assets.BTC, count: 10 });
```

### getBalance

Use this method to get balance of your app. Returns array of assets.

```js
cryptoPay.getBalance();
```

### getExchangeRates

Use this method to get exchange rates of supported currencies. Returns array of currencies.

```js
cryptoPay.getExchangeRates();
```

### getCurrencies

Use this method to supported currencies. Returns array of currencies.

```js
cryptoPay.getCurrencies();
```

### on

Adds handler to the choosen [update type](#Update-Types).

```js
cryptoPay.on('invoice_paid', update => console.log(update.payload));
```

### invoicePaid

Adds handler to `invoice_paid` update.

```js
cryptoPay.invoicePaid(update => console.log(update.payload));
```

### once

Adds a one-time handler to the choosen [update type](#Update-Types).

```js
cryptoPay.once('invoice_paid', update => console.log(update.payload));
```

### off

Removes the specified listener from the listener array for the event named eventName.

```js
const subscriber = (update) => console.log(update.payload)

cryptoPay.on('invoice_paid', subscriber);

setTimeout(
  () => cryptoPay.off('invoice_paid', subscriber),
  10000
);
```

## Update Types

* [invoice_paid](#getMe)

## Constants

### Assets

constant      | value
------------- | ------
`Assets.BTC`  | `BTC`
`Assets.TON`  | `TON`
`Assets.ETH`  | `ETH`
`Assets.USDT` | `USDT`
`Assets.USDC` | `USDC`
`Assets.BUSD` | `BUSD`

### Paid Button Names

constant                       | value
------------------------------ | -------------
`PaidButtonNames.VIEW_ITEM`    | `viewItem`
`PaidButtonNames.OPEN_CHANNEL` | `openChannel`
`PaidButtonNames.OPEN_BOT`     | `openBot`
`PaidButtonNames.CALLBACK`     | `callback`
