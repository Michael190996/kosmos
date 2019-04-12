import dotenv from 'dotenv';

const CONFIG = dotenv.config();

export default {
    MONGO: CONFIG.parsed.MONGO,
    KOAPORT: CONFIG.parsed.KOAPORT,
    PROD: !!CONFIG.parsed.PROD,
    API: CONFIG.parsed.API
}