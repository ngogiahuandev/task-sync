import Redis from "ioredis";

const url = process.env.REDIS_URL;
if (!url) {
  throw new Error(
    "REDIS_URL is not set. For Docker use redis://redis:6379; for local dev use redis://127.0.0.1:6379"
  );
}

export const redis = new Redis(url);

redis.on("connect", () => {
  console.log("[redis] connected to", url);
});
redis.on("error", (err) => {
  console.error("[redis] error:", err.message);
});
