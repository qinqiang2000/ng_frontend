'use strict';

const crypto = require('crypto');
const Service = require('egg').Service;
const fs = require('fs');

class PiaozoneService extends Service {
    md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    async getToken() {
        const { ctx } = this;
        const { baseUrl, clientId, clientSecret } = ctx.app.config.authConfig;
        const url = `${baseUrl}/base/oauth/token`;
        const timestamp = +new Date();
        const sign = this.md5(clientId + clientSecret + timestamp);
        const res = await ctx.curl(url, {
            method: 'POST',
            dataType: 'json',
            contentType: 'json',
            data: {
                client_id: clientId,
                timestamp: timestamp,
                sign: sign
            }
        })
        const resData = res.data;
        return resData;
    }

    async getFileBase64(file) {
        const { ctx } = this;
        const base64Str = fs.readFileSync(file, 'base64');
        return base64Str;
    }

    async recognizeInvoice(file) {
        const { ctx } = this;
        const { baseUrl } = ctx.app.config.authConfig;
        const tokenRes = await this.getToken();
        const token = tokenRes.access_token;
        const fileType = file.name.split('.').pop();
        const url = `${baseUrl}/m3/bill/invoice/img/analyze/multiple/info?access_token=${token}&type=${fileType}`;
        const base64Str = fs.readFileSync(file.filepath, 'base64');
        const res = await ctx.curl(url, {
            method: 'POST',
            dataType: 'json',
            contentType: 'text/plain',
            data: base64Str
        });
        return res.data;
    }
}

module.exports = PiaozoneService;