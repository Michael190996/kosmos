import Koa from 'koa';
import mongoose from 'mongoose';
import koaLogger from 'koa-logger';
import koaBodyparser from 'koa-bodyparser';
import router from './routes/routes';
import config from './config/config';
import logger from './controllers/logger';

export default (async () => {
    mongoose.Promise = global.Promise;
    mongoose.set('debug', !config.PROD);
    mongoose.set('useCreateIndex', true);

    const koa = new Koa();

    await mongoose.connect(config.MONGO);

    koa
        .use(koaLogger())
        .use(koaBodyparser())
        .use(router.routes())
        .use(router.allowedMethods());

    return koa.listen(config.KOAPORT, () => {
        logger.info(`Server start at localhost:${config.KOAPORT}`);
    });
})();