import fetch from 'node-fetch';
import {Players, Queue} from '../models';
import config from '../config/config';
import logger from './logger';

class Notification {
    constructor(max = 300) {
        this._busy = false;
        this._message = null;
        this._max = max;
        this._time = 1000;
        this._count = 3;
        this._stack = [];
    }

    async _getPlayersFromStack(dateStart, ids, count) {
        return (await Players.find({
            id: {
                $nin: ids
            },
            dateLastMessage: {
                $lt: dateStart,
            },
            createdAt: {
                $lte: dateStart
            }
        }, {id: 1, _id: 0})
            .limit(count))
            .map(e => e.id);
    }

    async _shiftPlayersById(ids) {
        await Players.updateMany({
            id: {
                $in: ids
            }
        }, {
            $set: {
                dateLastMessage: new Date()
            }
        });
    }

    async _shiftMessageById(id) {
        await Queue.remove({
            _id: id
        });
    }

    _getMessageFromStack() {
        return Queue.findOne({}).skip(0).limit(1);
    }

    async send(message) {
        await Queue.create({message});

        this.resume();
    }

    // делает запрос в случае не занятого пула
    async resume() {
        if (this._busy) {
            return false;
        }

        this._busy = true;
        this._message = await this._getMessageFromStack();

        if (!this._message) {
            this._busy = false;
            logger.info('server stop', 'message of undefined');
            return false;
        }

        const COUNT = this._max * this._count - this._stack.length;
        if (COUNT) {
            this._stack = this._stack.concat(await this._getPlayersFromStack(new Date(this._message.createdAt), this._stack, COUNT));
        }

        if (!this._stack.length) {
            await this._shiftMessageById(this._message._id);
            this._busy = false;
            this.resume();
            return false;
        }

        logger.info('start', this._stack.length);

        let idsAny = [];
        for (let i = 0; i < this._count; i++) {
            const IDS = this._stack.slice(i * this._max, 300 * (i + 1));

            if (IDS.length) {
                idsAny.push(IDS);
            }
        }

        const RESULT = await Promise.all(idsAny.map(async (ids) => {
            try {
                const RES = await fetch(config.API + '/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ids,
                        text: this._message
                    })
                }).then(res => res.json());

                return {
                    ids,
                    code: RES.code,
                    got: RES.ids
                }
            } catch (err) {
                logger.debug(config.API, err.toString());
                return {code: 1};
            }
        }));

        // invalid
        if (RESULT.find(({code}) => code === 3)) {
            logger.info('invalid date', this._message.message);

            await this._shiftMessageById(this._message._id);
            this._busy = false;
            this.resume();
            return false;
        }

        // const IDSGOTMESSAGE = RESULT.filter(({code}) => code === 0)
        //     .map(({got}) => got) // only with notification

        const IDSMESSAGE = RESULT.filter(({code}) => code === 0)
            .map(({ids}) => ids)
            .reduce((prev, next) => prev.concat(next), []);

        if (IDSMESSAGE.length) {
            IDSMESSAGE.forEach(id => this._stack.splice(this._stack.findIndex(e => e === id), 1));
            await this._shiftPlayersById(IDSMESSAGE);
        }

        // server error
        if (RESULT.find(({code}) => code === 1)) {
            logger.info('api server error');
            this._busy = false;

            return false;
        }

        // Too frequently
        if (RESULT.find(({code}) => code === 2) || idsAny.length === this._count) {
            return setTimeout(() => {
                this._busy = false;
                logger.info('too frequently');
                this.resume();
            }, this._time);
        }

        this._busy = false;
        this.resume();
    }
}

const notification = new Notification();
notification.resume();

export default notification;