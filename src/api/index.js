import Koa from 'koa';
import koaLogger from 'koa-logger';
import KoaRouter from 'koa-router';
import koaBodyparser from 'koa-bodyparser';
import logger from '../controllers/logger';

const koa = new Koa();

const router = new KoaRouter();

router.post('/send', (ctx, next) => {
    const CODE = Number((Math.random() * (3 - 0) + 0).toFixed(0));

    ctx.body = {
        code: 0
    };
});

koa
    .use(koaLogger())
    .use(koaBodyparser())
    .use(router.routes())
    .use(router.allowedMethods());

koa.listen(3001, () => {
    logger.info('app', 'Api server start at localhost:3001');
});