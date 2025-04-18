const { createClient } = require("redis");

let client = null;
const redisHost = process.env.REDIS_HOST || 'YOUR-REDIS-HOST';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || 'YOUR-REDIS-PASSWORD';
const redisUser = process.env.REDIS_USER || '';
const redisTls = process.env.REDIS_TLS === 'true';

//if (!client) { 
  client = createClient({
    url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    socket: {
      connectTimeout: 10000, // Set timeout to 10 seconds
    },
  });
  client.on("error", (error) => {
    console.error("Redis client error:", error);
  });
  client.on("connect", () => {
    console.log('Redis URL:', `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
    console.log("Connected to Redis");
  });
  (async () => {
    try {
      await client.connect();
    } catch (error) {
      console.error("Error connecting to Redis:", error);
    }
  })();
//}

module.exports = client;