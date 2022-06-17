import { createClient, RedisClientType } from "redis";

class redis {
  private static client: RedisClientType;
  private constructor() {}
  public static getRedisInstance(): RedisClientType {
    if (!this.client) {
      this.client = createClient();
    }
    return this.client;
  }
}

export default redis.getRedisInstance();
