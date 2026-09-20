import { Redis } from "@upstash/redis";

// Lee UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN automáticamente
// desde las variables de entorno.
export const redis = Redis.fromEnv();
