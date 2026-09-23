interface CachedContent {
  id: string;
  type: 'photo' | 'music';
  url: string;
  title?: string;
  cachedAt: number;
  blob?: Blob;
}

const CACHE_NAME = 'break-content-cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const contentCache = {
  async get(id: string): Promise<CachedContent | null> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(id);
      
      if (!response) return null;
      
      const data = await response.json();
      
      // Check if cache is expired
      if (Date.now() - data.cachedAt > CACHE_EXPIRY) {
        await this.remove(id);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting cached content:', error);
      return null;
    }
  },

  async set(content: Omit<CachedContent, 'cachedAt'>): Promise<void> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const data: CachedContent = {
        ...content,
        cachedAt: Date.now(),
      };
      
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      await cache.put(content.id, response);
    } catch (error) {
      console.error('Error caching content:', error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(id);
    } catch (error) {
      console.error('Error removing cached content:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await caches.delete(CACHE_NAME);
    } catch (error) {
      console.error('Error clearing content cache:', error);
    }
  },

  async getAll(): Promise<CachedContent[]> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const contents: CachedContent[] = [];
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          if (Date.now() - data.cachedAt <= CACHE_EXPIRY) {
            contents.push(data);
          }
        }
      }
      
      return contents;
    } catch (error) {
      console.error('Error getting all cached content:', error);
      return [];
    }
  },

  async preloadContent(contents: Omit<CachedContent, 'cachedAt'>[]): Promise<void> {
    try {
      await Promise.all(contents.map((content) => this.set(content)));
    } catch (error) {
      console.error('Error preloading content:', error);
    }
  },
};
