import Koa from 'koa';

function adjustStr(input: string): string {
    input = input.toLowerCase();
    if (input === "macos") {
        return "apple";
    } else if (input === "x86_64") {
        return "amd64";
    }

    return input;
}

export function adjustOsAndArch(): (ctx: Koa.Context, next: Koa.Next) => Promise<void> {
  return async (ctx, next) => {
    if (ctx.method === 'POST') {
        // adjust body os string "macos" to "apple"
        if (ctx.request.body && ctx.request.body.content && ctx.request.body.content.os) {
            ctx.request.body.content.os = adjustStr(ctx.request.body.content.os);
        }
        // adjust body arch string "x86_64" to "amd64"
        if (ctx.request.body && ctx.request.body.content && ctx.request.body.content.arch) {
            ctx.request.body.content.arch = adjustStr(ctx.request.body.content.arch);
        }
    } else if (ctx.method === 'GET') {
        // adjust query os string "macos" to "apple"
        if (ctx.request.query.os) {
            if (typeof ctx.request.query.os === "string") {
                ctx.request.query.os = adjustStr(ctx.request.query.os);
            } else if (Array.isArray(ctx.request.query.os)) {
                ctx.request.query.os = ctx.request.query.os.map(adjustStr);
            }
        }
        // adjust query arch string "x86_64" to "amd64"
        if (ctx.request.query.arch) {
            if (typeof ctx.request.query.arch === "string") {
                ctx.request.query.arch = adjustStr(ctx.request.query.arch);
            } else if (Array.isArray(ctx.request.query.arch)) {
                ctx.request.query.arch = ctx.request.query.arch.map(adjustStr);
            }
        }
    }


    await next();
  };
}