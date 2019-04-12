import {configure, getLogger} from 'log4js';

configure('./log4js.json');

const logger = getLogger();
logger.level = 'debug';

export default logger;