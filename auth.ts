import Koa from 'koa';
import { Storage } from './storage';
import secp256k1 from 'secp256k1';
import crypto from 'node:crypto'

export function authComponent(storage: Storage): (ctx: Koa.Context, next: Koa.Next) => Promise<void> {
  return async (ctx, next) => {
    // Implement authentication logic here
    if (ctx.method === 'POST') {
        // check user`s token
        const body = ctx.request.body;
        if (!body || ! body.content || !body.username || !body.signature || !body.content.product) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid request body' };
            return;
        }

        let infos = await storage.getUserInfo(body.username);
        if (!infos) {
            ctx.status = 401;
            ctx.body = { error: 'User not found' };
            return;
        }
        let [privateKey, scopes] = infos;
        // check scopes
        if (!scopes.includes(body.content.product)) {
            ctx.status = 403;
            ctx.body = { error: 'Insufficient scopes' };
            return;
        }
        let publicKey = secp256k1.publicKeyCreate(Buffer.from(privateKey, 'hex'));

        let hash = crypto.createHash('sha256').update(JSON.stringify(body.content)).digest();

        if (!secp256k1.ecdsaVerify(Buffer.from(body.signature, 'hex'), hash, publicKey)) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid signature' };
            return;
        }
    }

    await next();
  };
}