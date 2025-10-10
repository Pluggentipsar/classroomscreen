const ARASAAC_API_BASE = 'https://api.arasaac.org/v1';
const ARASAAC_STATIC_BASE = 'https://static.arasaac.org/pictograms';

class ArasaacService {
  constructor() {
    this.defaultLanguage = 'en';
    this.cache = new Map();
  }

  async searchPictograms(query, language = this.defaultLanguage) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cacheKey = `search_${language}_${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `${ARASAAC_API_BASE}/pictograms/${language}/search/${encodedQuery}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ARASAAC API error: ${response.status}`);
      }

      const pictograms = await response.json();
      
      const results = pictograms.map(p => ({
        id: p._id,
        keywords: p.keywords?.map(k => k.keyword) || [],
        source: 'arasaac',
        url: this.buildPictogramUrl(p._id, { resolution: 500 }),
        thumbnailUrl: this.buildPictogramUrl(p._id, { resolution: 300 }),
        highResUrl: this.buildPictogramUrl(p._id, { resolution: 2500 }),
        categories: p.categories || [],
        schematic: p.schematic || false,
        created: p.created,
        lastUpdated: p.lastUpdated
      }));

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error searching ARASAAC pictograms:', error);
      return [];
    }
  }

  async getBestSearch(query, language = this.defaultLanguage) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `${ARASAAC_API_BASE}/pictograms/${language}/bestsearch/${encodedQuery}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ARASAAC API error: ${response.status}`);
      }

      const pictograms = await response.json();
      
      return pictograms.map(p => ({
        id: p._id,
        keywords: p.keywords?.map(k => k.keyword) || [],
        source: 'arasaac',
        url: this.buildPictogramUrl(p._id, { resolution: 500 }),
        thumbnailUrl: this.buildPictogramUrl(p._id, { resolution: 300 }),
        highResUrl: this.buildPictogramUrl(p._id, { resolution: 2500 }),
        categories: p.categories || [],
        schematic: p.schematic || false
      }));
    } catch (error) {
      console.error('Error in best search:', error);
      return [];
    }
  }

  async getNewPictograms(numItems = 30, language = this.defaultLanguage) {
    const cacheKey = `new_${language}_${numItems}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `${ARASAAC_API_BASE}/pictograms/${language}/new/${numItems}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ARASAAC API error: ${response.status}`);
      }

      const pictograms = await response.json();
      
      const results = pictograms.map(p => ({
        id: p._id,
        keywords: p.keywords?.map(k => k.keyword) || [],
        source: 'arasaac',
        url: this.buildPictogramUrl(p._id, { resolution: 500 }),
        thumbnailUrl: this.buildPictogramUrl(p._id, { resolution: 300 }),
        highResUrl: this.buildPictogramUrl(p._id, { resolution: 2500 }),
        categories: p.categories || [],
        created: p.created,
        lastUpdated: p.lastUpdated
      }));

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error fetching new pictograms:', error);
      return [];
    }
  }

  async getPictogramById(id, language = this.defaultLanguage) {
    try {
      const url = `${ARASAAC_API_BASE}/pictograms/${language}/${id}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ARASAAC API error: ${response.status}`);
      }

      const p = await response.json();
      
      return {
        id: p._id,
        keywords: p.keywords?.map(k => k.keyword) || [],
        source: 'arasaac',
        url: this.buildPictogramUrl(p._id, { resolution: 500 }),
        thumbnailUrl: this.buildPictogramUrl(p._id, { resolution: 300 }),
        highResUrl: this.buildPictogramUrl(p._id, { resolution: 2500 }),
        categories: p.categories || [],
        schematic: p.schematic || false,
        created: p.created,
        lastUpdated: p.lastUpdated,
        desc: p.desc
      };
    } catch (error) {
      console.error('Error fetching pictogram by ID:', error);
      return null;
    }
  }

  buildPictogramUrl(id, options = {}) {
    const {
      resolution = 500,
      plural = false,
      color = null,
      backgroundColor = null,
      action = null,
      skin = null,
      hair = null,
      identifier = null,
      identifierPosition = null
    } = options;

    const parts = [id];
    
    if (action) parts.push(`action-${action}`);
    if (plural) parts.push('plural');
    if (color === false || color === 'nocolor') parts.push('nocolor');
    if (hair) parts.push(`hair-${hair}`);
    if (skin) parts.push(`skin-${skin}`);
    if (identifier) {
      parts.push(`identifier-${identifier}`);
      if (identifierPosition) parts.push(`identifierPosition-${identifierPosition}`);
    }
    
    parts.push(resolution);
    
    const filename = parts.join('_') + '.png';
    return `${ARASAAC_STATIC_BASE}/${id}/${filename}`;
  }

  clearCache() {
    this.cache.clear();
  }
}

const arasaacService = new ArasaacService();
