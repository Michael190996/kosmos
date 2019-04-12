import KoaRouter from 'koa-router';
import logger from '../controllers/logger';
import {Players, Queue} from '../models/index';
import notification from '../controllers/notification';

const router = new KoaRouter();

router.post('/reset', async (ctx, next) => {
    await Promise.all([
        Players.remove(),
        Queue.remove()
    ]);

    logger.info('reset');

    ctx.body = {};
});

router.post('/userSave', async (ctx, next) => {
    const {firstName: FIRSTNAME} = ctx.request.body;

    await Players.create({
        first_name: FIRSTNAME,
        dateLastMessage: new Date()
    });

    logger.info('create user', FIRSTNAME);

    ctx.body = {};
});

router.post('/send', async (ctx, next) => {
    const {template: TEMPLATE} = ctx.request.body;

    if (TEMPLATE === undefined) {
        return false;
    }

    await notification.send(TEMPLATE);

    logger.info('added to queue', TEMPLATE);

    ctx.body = {};
});

export default router;