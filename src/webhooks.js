const { createHash, createHmac } = require('crypto');

const SIGNATURE_HEADER_NAME = 'crypto-pay-api-signature';

const defaultWebhooksOptions = Object.freeze({
  serverPort: 80,
});

class Webhooks {
  constructor(token, options, updateHandler) {
    this.token = token;
    this.options = { ...defaultWebhooksOptions, ...options.webhook, updateVerification: options.updateVerification };
    this.updateHandler = updateHandler;

    if (!this.options.serverHostname) throw new Error('Webhook server hostname is required');
    if (typeof this.options.serverHostname !== 'string') throw new Error('Webhook server hostname must be a string');
    if (typeof this.options.serverPort !== 'number') throw new Error('Webhook server port must be a number');
    if (!this.options.path) throw new Error('Webhook path is required');
    if (typeof this.options.path !== 'string') throw new Error('Webhook path must be a string');

    const cb = this.webhookCallbackFabric(this.options.path, this.handleRequest.bind(this));

    this.webhookServer = this.options.tls
      ? require('https').createServer(this.options.tls, cb)
      : require('http').createServer(cb);
    this.webhookServer.listen(this.options.serverPort, this.options.serverHostname);
  }

  handleRequest(update, headers) {
    if (this.options.updateVerification) {
      let signature;
      Object.keys(headers).find((name) => {
        if (name.toLowerCase() === SIGNATURE_HEADER_NAME) {
          signature = headers[name];
          return true;
        }
      });
      if (!signature || !this.verifyUpdate(update, signature)) throw new WebhookError(400, 'Wrong signature');
    }

    this.updateHandler(update);
  }

  verifyUpdate(update, signature) {
    const secret = createHash('sha256').update(this.token).digest();
    const serializedData = JSON.stringify(update);
    const hmac = createHmac('sha256', secret).update(serializedData).digest('hex');
    return hmac === signature;
  }

  webhookCallbackFabric(webhookPath, requestHandler) {
    return (req, res, next) => {
      if (req.method !== 'POST' || req.url !== webhookPath) {
        if (typeof next === 'function') {
          return next();
        }
        res.statusCode = 400;
        return res.end();
      }
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        let update = {};
        try {
          update = JSON.parse(body);
        } catch (error) {
          res.writeHead(415);
          res.end();
        }
        try {
          requestHandler(update, req.headers);
        } catch (error) {
          if (error.code) {
            res.writeHead(error.code, error.message);
          } else {
            res.writeHead(500);
          }
          res.end();
        }
        if (!res.finished) {
          res.end();
        }
      });
    };
  }
}

class WebhookError extends Error {
  constructor(code, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebhookError);
    }

    this.code = code;
  }
}

module.exports = Webhooks;
