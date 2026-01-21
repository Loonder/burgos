import NodeCache from 'node-cache';
import { logger } from '../utils/logger';

class CacheService {
    private cache: NodeCache;

    constructor(ttlSeconds = 3600) { // Default 1 hour TTL
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
        logger.info('CacheService initialized');
    }

    get<T>(key: string): T | undefined {
        const value = this.cache.get<T>(key);
        if (value) {
            logger.debug(`Cache hit for key: ${key}`);
        }
        return value;
    }

    set<T>(key: string, value: T, ttl?: number): boolean {
        logger.debug(`Cache set for key: ${key}`);
        return this.cache.set(key, value, ttl || 3600);
    }

    del(key: string): number {
        logger.debug(`Cache del for key: ${key}`);
        return this.cache.del(key);
    }

    flush(): void {
        logger.info('Cache flushed');
        this.cache.flushAll();
    }
}

export const cacheService = new CacheService();
