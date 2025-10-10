const PEXELS_API_BASE = 'https://api.pexels.com/v1';

class PexelsService {
  constructor() {
    this.apiKey = null;
    this.cache = new Map();
    this.initApiKey();
  }

  async initApiKey() {
    try {
      const response = await fetch('/api/pexels-key');
      if (response.ok) {
        const data = await response.json();
        this.apiKey = data.apiKey;
      }
    } catch (error) {
      console.error('Error loading Pexels API key:', error);
    }
  }

  async searchPhotos(query, language = 'sv', perPage = 30) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    if (!this.apiKey) {
      console.warn('Pexels API key not loaded yet');
      return [];
    }

    const cacheKey = `search_${language}_${query}_${perPage}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `${PEXELS_API_BASE}/search?query=${encodedQuery}&per_page=${perPage}&locale=${language}-SE`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      
      const results = data.photos.map(photo => ({
        id: photo.id,
        keywords: [photo.alt || query],
        source: 'pexels',
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        highResUrl: photo.src.original,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        avgColor: photo.avg_color,
        width: photo.width,
        height: photo.height
      }));

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error searching Pexels photos:', error);
      return [];
    }
  }

  async getCuratedPhotos(perPage = 30) {
    if (!this.apiKey) {
      console.warn('Pexels API key not loaded yet');
      return [];
    }

    const cacheKey = `curated_${perPage}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `${PEXELS_API_BASE}/curated?per_page=${perPage}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      
      const results = data.photos.map(photo => ({
        id: photo.id,
        keywords: [photo.alt || 'Photo'],
        source: 'pexels',
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        highResUrl: photo.src.original,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        avgColor: photo.avg_color,
        width: photo.width,
        height: photo.height
      }));

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error fetching curated Pexels photos:', error);
      return [];
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

const pexelsService = new PexelsService();
