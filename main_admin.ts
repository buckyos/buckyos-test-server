import Koa from 'koa';
import Router from '@koa/router';
import koaBody from 'koa-body';
import { Storage } from './storage';

async function startServer() {
    const app = new Koa();
    const router = new Router();

    let storage = new Storage('server.db');
    await storage.init();

    app.use(koaBody());

    router.get("/cleanup", async (ctx) => {
        try {
            await storage.cleanupVersions(ctx.request.query.product as string);
            ctx.body = { result: 1 };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to cleanup versions' };
        }
    });

    app.use(router.routes()).use(router.allowedMethods());

    app.listen(9801, "localhost", () => {
        console.log('Cleanup server is running on http://localhost:9801');
    });
}

startServer();