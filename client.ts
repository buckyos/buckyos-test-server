import { env, argv, exit } from "node:process";
import * as crypto from "node:crypto";
import * as secp256k1 from "secp256k1";

function prepare(content: any, username: string, privateKey: Buffer) {
    const data = JSON.stringify(content);
    const msg = crypto.createHash('sha256').update(data).digest();

    let sign = secp256k1.ecdsaSign(msg, privateKey).signature;

    return {
        content: content,
        username: username,
        signature: Buffer.from(sign).toString('hex'),
    }
}

let username = env['USERNAME'];
let pk = env['PRIVATE_KEY'];
if (!username || !pk) {
    console.error("Usage: set USERNAME and PRIVATE_KEY environment variables");
    process.exit(1);
}

let privateKey = Buffer.from(pk, 'hex');
if (privateKey.length !== 32) {
    console.error("Private key must be 32 bytes long");
    process.exit(1);
}


console.log("Username:", username);
let endpoint = env['ENDPOINT'] || 'http://localhost:9800';

let argpoint = 2;

async function postData(path: string, content: any) {
    let body = prepare(content, username!, privateKey);
    let resp = await fetch(endpoint+path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    console.log("Response status:", resp.status);
    let respData = await resp.text();
    console.log("Response data:", respData);
}

async function setUrl() {
    let product = argv[argpoint++];
    let version = argv[argpoint++];
    let os = argv[argpoint++];
    let arch = argv[argpoint++];
    let url = argv[argpoint++];
    let commit = argv[argpoint++];
    if (!product || !version || !os || !arch || !url || !commit) {
        console.error("Usage: node client.js seturl <product> <version> <os> <arch> <url> <commit>");
        process.exit(1);
    }

    let content = {
        product: product,
        version: version,
        os: os,
        arch: arch,
        url: url,
        commit: commit,
    }

    await postData("/version/url", content);
}

async function setTest() {
    let product = argv[argpoint++];
    let version = argv[argpoint++];
    let os = argv[argpoint++];
    let arch = argv[argpoint++];
    let tested = argv[argpoint++] === "true";
    if (!product || !version || !os || !arch) {
        console.error("Usage: node client.js settest <product> <version> <os> <arch> <true|false>");
        process.exit(1);
    }

    let content = {
        product: product,
        version: version,
        os: os,
        arch: arch,
        tested: tested,
    }

    await postData("/version/test", content);
}

async function setPublish() {
    let product = argv[argpoint++];
    let version = argv[argpoint++];
    let os = argv[argpoint++];
    let arch = argv[argpoint++];
    let published = argv[argpoint++] === "true";
    if (!product || !version || !os || !arch) {
        console.error("Usage: node client.js setpublish <product> <version> <os> <arch> <true|false>");
        process.exit(1);
    }

    let content = {
        product: product,
        version: version,
        os: os,
        arch: arch,
        published: published,
    }

    await postData("/version/publish", content);
}

async function setPack() {
    let product = argv[argpoint++];
    let version = argv[argpoint++];
    let os = argv[argpoint++];
    let arch = argv[argpoint++];
    let packed = argv[argpoint++] === "true";
    if (!product || !version || !os || !arch) {
        console.error("Usage: node client.js setpack <product> <version> <os> <arch> <true|false>");
        process.exit(1);
    }

    let content = {
        product: product,
        version: version,
        os: os,
        arch: arch,
        packed: packed,
    }

    await postData("/version/pack", content);
}

async function setPackTested() {
    let product = argv[argpoint++];
    let version = argv[argpoint++];
    let os = argv[argpoint++];
    let arch = argv[argpoint++];
    let tested = argv[argpoint++] === "true";
    if (!product || !version || !os || !arch) {
        console.error("Usage: node client.js setpacktest <product> <version> <os> <arch> <true|false>");
        process.exit(1);
    }

    let content = {
        product: product,
        version: version,
        os: os,
        arch: arch,
        tested: tested,
    }

    await postData("/version/packtest", content);
}

async function test_auth() {
    let content = {
        msg: "this is a test message",
    }

    await postData("/version/auth", content)
}

async function run() {
    let method = argv[argpoint++];
    if (method === "seturl") {
        await setUrl();
    } else if (method === "settest") {
        await setTest();
    } else if (method === "setpublish") {
        await setPublish();
    } else if (method == "setpack") {
        await setPack();
    } else if (method == "setpacktest") {
        await setPackTested();
    } else if (method == "auth") {
        await test_auth();
    } else {
        console.error("Usage: node client.js <seturl|settest|setpublish|setpack|setpacktest>");
        process.exit(1);
    }
}

run().then(() => {
    exit(0);
});

