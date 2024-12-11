import redis from "redis";

export const redisClient = redis.createClient();
await redisClient.connect();

export async function getCacheSize(prefix: string) {
    let sentinel = 0;
    let count = 0;

    do {
        const { cursor, keys } = await redisClient.scan(sentinel, { MATCH: `${prefix}*`, COUNT: 100 })
        sentinel = cursor;
        count += keys.length;
    } while (sentinel !== 0);

    return count;
}

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});
