import Koa from 'koa';

export function adjustOsAndArch(): (ctx: Koa.Context, next: Koa.Next) => Promise<void> {
  return async (ctx, next) => {
    if (ctx.method === 'POST') {
        // adjust body os string "macos" to "apple"
        if (ctx.request.body && ctx.request.body.content && ctx.request.body.content.os) {
            if (ctx.request.body.content.os === "macos") {
                ctx.request.body.content.os = "apple";
            }
        }
        // adjust body arch string "x86_64" to "amd64"
        if (ctx.request.body && ctx.request.body.content && ctx.request.body.content.arch) {
            if (ctx.request.body.content.arch === "x86_64") {
                ctx.request.body.content.arch = "amd64";
            }
        }
    } else if (ctx.method === 'GET') {
        // adjust query os string "macos" to "apple"
        if (ctx.request.query.os) {
            if (ctx.request.query.os === "macos") {
                ctx.request.query.os = "apple";
            }
        }
        // adjust query arch string "x86_64" to "amd64"
        if (ctx.request.query.arch) {
            if (ctx.request.query.arch === "x86_64") {
                ctx.request.query.arch = "amd64";
            }
        }
    }


    await next();
  };
}