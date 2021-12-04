const fetch = require('node-fetch');
const url = require('url');

const defaultApiOptions = {
  protocol: 'https',
  hostname: 'pay.crypt.bot',
};

class Api {
  constructor(token, options) {
    this.token = token;
    if (options && options.hostname) {
      // Trim protocol
      const hostname = options.hostname.match(/(\w*:\/\/)?(.+)/)[2];
      options.hostname = hostname;
    }
    this.options = { ...defaultApiOptions, ...options };
  }

  buildRequest(method, params = {}) {
    // Remove empty params
    Object.keys(params).forEach(
      // eslint-disable-next-line no-param-reassign
      (key) => [undefined, null, ''].some((empty) => params[key] === empty) && delete params[key],
    );

    const request = {
      headers: { 'Crypto-Pay-API-Token': this.token },
      body: url.format({ ...this.options, pathname: `api/${method}`, query: params }, {}),
    };
    return request;
  }

  async makeRequest({ body, headers }) {
    const res = await fetch(body, { headers });
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
}

module.exports = Api;
