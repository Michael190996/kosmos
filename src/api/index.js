import Koa from 'koa';
import koaLogger from 'koa-logger';
import KoaRouter from 'koa-router';
import koaBodyparser from 'koa-bodyparser';
import logger from '../controllers/logger';

const koa = new Koa();

const router = new KoaRouter();

router.post('/send', (ctx, next) => {
    const {ids: IDS, text: MESSAGE} = ctx.request.body;
    const CODE = Number((Math.random() * (3 - 0) + 0).toFixed(0));

    console.log(IDS, MESSAGE);

    ctx.body = {
        code: CODE
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
