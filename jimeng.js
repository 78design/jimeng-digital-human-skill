/**
 * 即梦数字人 OmniHuman1.5 API 调用模块
 * 
 * 使用方式：
 *   const jimeng = require('./jimeng');
 *   const result = await jimeng.generateVideo(imageUrl, audioUrl, prompt);
 */

"use strict";

const crypto = require("crypto");
const util = require("util");
const url = require("url");
const fs = require("fs");
const { execSync } = require("child_process");

// 从环境变量读取密钥，不硬编码
const ACCESS_KEY_ID = process.env.VOLCENGINE_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.VOLCENGINE_SECRET_ACCESS_KEY || '';

const SERVICE_NAME = 'cv';
const REGION = 'cn-north-1';
const API_HOST = 'https://visual.volcengineapi.com';
const REQ_KEY = 'jimeng_realman_avatar_picture_omni_v15';

const HEADER_KEYS_TO_IGNORE = new Set([
    "authorization", "content-type", "content-length",
    "user-agent", "presigned-expires", "expect",
]);

// ---- 签名工具函数 ----

function getDateTimeNow() {
    const now = new Date();
    return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function getBodySha(body) {
    const h = crypto.createHash('sha256');
    if (typeof body === 'string') h.update(body);
    else if (body instanceof url.URLSearchParams) h.update(body.toString());
    else if (util.isBuffer(body)) h.update(body);
    return h.digest('hex');
}

function hmac(secret, s) {
    return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
}

function hash(s) {
    return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function uriEscape(str) {
    try {
        return encodeURIComponent(str)
            .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
            .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
    } catch (e) { return ''; }
}

function queryParamsToString(params) {
    return Object.keys(params).sort().map((key) => {
        const val = params[key];
        if (typeof val === 'undefined' || val === null) return undefined;
        const escapedKey = uriEscape(key);
        if (!escapedKey) return undefined;
        if (Array.isArray(val)) return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
        return `${escapedKey}=${uriEscape(val)}`;
    }).filter((v) => v).join('&');
}

function getSignHeaders(originHeaders, needSignHeaders) {
    function trimHeaderValue(header) {
        return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
    }
    let h = Object.keys(originHeaders);
    if (Array.isArray(needSignHeaders)) {
        const needSignSet = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()));
        h = h.filter((k) => needSignSet.has(k.toLowerCase()));
    }
    h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));
    const signedHeaderKeys = h.slice().map((k) => k.toLowerCase()).sort().join(';');
    const canonicalHeaders = h
        .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
        .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
        .join('\n');
    return [signedHeaderKeys, canonicalHeaders];
}

function sign(params) {
    const {
        headers = {}, query = {}, region = '', serviceName = '',
        method = '', pathName = '/', accessKeyId = '', secretAccessKey = '',
        needSignHeaderKeys = [], bodySha,
    } = params;
    const datetime = headers["X-Date"];
    const date = datetime.substring(0, 8);
    const [signedHeaders, canonicalHeaders] = getSignHeaders(headers, needSignHeaderKeys);
    const canonicalRequest = [
        method.toUpperCase(), pathName,
        queryParamsToString(query) || '',
        `${canonicalHeaders}\n`, signedHeaders,
        bodySha || hash(''),
    ].join('\n');
    const credentialScope = [date, region, serviceName, "request"].join('/');
    const stringToSign = ["HMAC-SHA256", datetime, credentialScope, hash(canonicalRequest)].join('\n');
    const kDate = hmac(secretAccessKey, date);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, serviceName);
    const kSigning = hmac(kService, "request");
    const signature = hmac(kSigning, stringToSign).toString('hex');
    return [
        "HMAC-SHA256",
        `Credential=${accessKeyId}/${credentialScope},`,
        `SignedHeaders=${signedHeaders},`,
        `Signature=${signature}`,
    ].join(' ');
}

function qs(params) {
    return Object.keys(params).sort().map(k => {
        const v = params[k];
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    }).join('&');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- API请求 ----

async function sendRequest(action, bodyObj) {
    const bodyString = JSON.stringify(bodyObj);
    const bodySha = getBodySha(bodyString);
    const xDate = getDateTimeNow();

    const signParams = {
        headers: { ["X-Date"]: xDate, ["Content-Type"]: "application/json" },
        method: 'POST',
        query: { Version: '2022-08-31', Action: action },
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        serviceName: SERVICE_NAME,
        region: REGION,
        bodySha: bodySha,
    };

    for (const [key, val] of Object.entries(signParams.query)) {
        if (val === undefined || val === null) signParams.query[key] = '';
    }

    const authorization = sign(signParams);
    const queryString = qs(signParams.query);
    const fullUrl = `${API_HOST}/?${queryString}`;

    const tmpBody = '/tmp/jimeng_req_body.json';
    fs.writeFileSync(tmpBody, bodyString);

    const curlCmd = `curl -s -X POST "${fullUrl}" \
        -H "X-Date: ${xDate}" \
        -H "Content-Type: application/json" \
        -H "Authorization: ${authorization}" \
        -d @${tmpBody}`;

    try {
        const output = execSync(curlCmd, { timeout: 30000 }).toString();
        return JSON.parse(output);
    } catch (err) {
        return { error: err.message };
    }
}

// ---- 主接口 ----

/**
 * 生成数字人视频
 * @param {string} imageUrl - 人像图片URL
 * @param {string} audioUrl - 音频URL（≤35秒）
 * @param {string} prompt - 可选提示词
 * @returns {Promise<{success: boolean, videoUrl?: string, error?: string}>}
 */
async function generateVideo(imageUrl, audioUrl, prompt = '') {
    // 检查密钥
    if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
        return { success: false, error: '请配置环境变量 VOLCENGINE_ACCESS_KEY_ID 和 VOLCENGINE_SECRET_ACCESS_KEY' };
    }

    // 检查参数
    if (!imageUrl || !audioUrl) {
        return { success: false, error: '请提供 imageUrl 和 audioUrl' };
    }

    // 提交任务
    const submitBody = { req_key: REQ_KEY, image_url: imageUrl, audio_url: audioUrl };
    if (prompt) submitBody.prompt = prompt;

    const submitResult = await sendRequest('CVSubmitTask', submitBody);

    if (!submitResult || submitResult.code !== 10000) {
        return { success: false, error: submitResult?.message || '提交任务失败' };
    }

    const taskId = submitResult.data.task_id;

    // 轮询查询结果
    for (let i = 0; i < 60; i++) {
        await sleep(5000);

        const result = await sendRequest('CVGetResult', { req_key: REQ_KEY, task_id: taskId });

        if (!result) continue;

        if (result.code === 10000 && result.data?.status === 'done' && result.data?.video_url) {
            return { success: true, videoUrl: result.data.video_url };
        }

        if (result.code !== 10000) {
            return { success: false, error: result.message };
        }
    }

    return { success: false, error: '生成超时' };
}

module.exports = { generateVideo };