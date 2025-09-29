import Koa from 'koa';
import Router from '@koa/router';
import koaBody from 'koa-body';
import { authComponent } from './auth';
import { Storage } from './storage';
import { adjustOsAndArch } from './util';

async function startServer() {
    const app = new Koa();
    const router = new Router();

    let storage = new Storage('server.db');
    await storage.init();

    app.use(koaBody());

    app.use(authComponent(storage));
    app.use(adjustOsAndArch());

    // Define a simple route
    router.post('/version/auth', (ctx) => {
        ctx.body = {
            result: 1,
            request: ctx.request.body.content
        }
    });

    router.post('/version/url', async (ctx) => {
        const { version, os, arch, url, commit } = ctx.request.body.content;
        if (!version || !os || !arch || !url || !commit) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields' };
            return;
        }

        try {
            await storage.setVersionUrl(version, os, arch, url, commit);
            ctx.body = { result: 1 };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to set version URL' };
        }
    })

    router.post('/version/test', async (ctx) => {
        const { version, os, arch, tested } = ctx.request.body.content;
        if (!version || !os || !arch || typeof tested !== 'boolean') {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields' };
            return;
        }

        try {
            await storage.setVersionTestResult(version, os, arch, tested);
            ctx.body = { result: 1 };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to set version test result' };
        }
    });

    router.post('/version/publish', async (ctx) => {
        const { version, os, arch, published } = ctx.request.body.content;
        if (!version || !os || !arch || typeof published !== 'boolean') {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields' };
            return;
        }

        try {
            await storage.setVersionPublishResult(version, os, arch, published);
            ctx.body = { result: 1 };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to set version publish result' };
        }
    });

    router.post('/version/pack', async (ctx) => {
        const { version, os, arch, packed } = ctx.request.body.content;
        if (!version || !os || !arch || typeof packed !== 'boolean') {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields' };
            return;
        }

        try {
            await storage.setVersionPackResult(version, os, arch, packed);
            ctx.body = { result: 1 };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to set version pack result' };
        }
    });

    router.post('/version/packtest', async (ctx) => {
        const { version, os, arch, tested } = ctx.request.body.content;
        if (!version || !os || !arch || typeof tested !== 'boolean') {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields' };
            return;
        }

        try {
            await storage.setVersionPackTestResult(version, os, arch, tested);
            ctx.body = { result: 1 };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to set version pack test result' };
        }
    });

    router.get("/version", async (ctx) => {
        const query = ctx.request.query;
        let pageNum = parseInt(query.page as string) || 1;
        let pageSize = parseInt(query.size as string) || 0;

        let os;
        if (typeof query.os === 'string') {
            os = [query.os];
        } else {
            os = query.os;
        }

        let arch;
        if (typeof query.arch === 'string') {
            arch = [query.arch];
        } else {
            arch = query.arch;
        }


        let notest = query.notest === 'true' ? true : false;
        let nopub = query.nopub === 'true' ? true : false;
        let nopack = query.nopack === 'true' ? true : false;

        let versions = await storage.getVersions(pageNum, pageSize, query.version as string, os, arch, query.commit as string, notest, nopub, nopack);

        ctx.body = {
            items: versions,
            pageNum: pageNum,
            pageSize: pageSize,
        };
    });

    router.get("/version/total", async (ctx) => {
        ctx.body = {
            total: await storage.getVersionCount()
        }
    })

    router.get("/version/latest/commit", async (ctx) => {
        ctx.body = await storage.getLatestCommit()
    })

    app.use(router.routes()).use(router.allowedMethods());

    app.listen(9800, "localhost", () => {
        console.log('Server is running on http://localhost:9800');
    });
}

startServer();
