class MediaStorage {
  constructor() {
    this.storageKey = 'classroomscreen_media_library';
    this.maxRecentItems = 50;
  }

  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return this.getDefaultData();
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading media library data:', error);
      return this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      favorites: [],
      recent: [],
      collections: {},
      settings: {
        defaultSource: 'arasaac',
        defaultResolution: 500,
        showCategories: true
      }
    };
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving media library data:', error);
      return false;
    }
  }

  addToFavorites(item) {
    const data = this.getData();
    
    const exists = data.favorites.find(f => 
      f.id === item.id && f.source === item.source
    );
    
    if (!exists) {
      data.favorites.unshift({
        id: item.id,
        source: item.source,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        highResUrl: item.highResUrl,
        keywords: item.keywords || [],
        categories: item.categories || [],
        addedAt: Date.now()
      });
      
      this.saveData(data);
    }
    
    return data.favorites;
  }

  removeFromFavorites(id, source) {
    const data = this.getData();
    data.favorites = data.favorites.filter(f => 
      !(f.id === id && f.source === source)
    );
    this.saveData(data);
    return data.favorites;
  }

  isFavorite(id, source) {
    const data = this.getData();
    return data.favorites.some(f => f.id === id && f.source === source);
  }

  getFavorites() {
    const data = this.getData();
    return data.favorites;
  }

  addToRecent(item) {
    const data = this.getData();
    
    data.recent = data.recent.filter(r => 
      !(r.id === item.id && r.source === item.source)
    );
    
    data.recent.unshift({
      id: item.id,
      source: item.source,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      highResUrl: item.highResUrl,
      keywords: item.keywords || [],
      usedAt: Date.now()
    });
    
    if (data.recent.length > this.maxRecentItems) {
      data.recent = data.recent.slice(0, this.maxRecentItems);
    }
    
    this.saveData(data);
    return data.recent;
  }

  getRecent(limit = 20) {
    const data = this.getData();
    return data.recent.slice(0, limit);
  }

  createCollection(name) {
    const data = this.getData();
    
    if (data.collections[name]) {
      return { success: false, error: 'Collection already exists' };
    }
    
    data.collections[name] = {
      name: name,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.saveData(data);
    return { success: true, collection: data.collections[name] };
  }

  deleteCollection(name) {
    const data = this.getData();
    delete data.collections[name];
    this.saveData(data);
    return true;
  }

  renameCollection(oldName, newName) {
    const data = this.getData();
    
    if (!data.collections[oldName]) {
      return { success: false, error: 'Collection not found' };
    }
    
    if (data.collections[newName]) {
      return { success: false, error: 'Collection with new name already exists' };
    }
    
    data.collections[newName] = {
      ...data.collections[oldName],
      name: newName,
      updatedAt: Date.now()
    };
    
    delete data.collections[oldName];
    this.saveData(data);
    return { success: true };
  }

  addToCollection(collectionName, item) {
    const data = this.getData();
    
    if (!data.collections[collectionName]) {
      const result = this.createCollection(collectionName);
      if (!result.success) return result;
      data.collections = this.getData().collections;
    }
    
    const collection = data.collections[collectionName];
    
    const exists = collection.items.find(i => 
      i.id === item.id && i.source === item.source
    );
    
    if (!exists) {
      collection.items.push({
        id: item.id,
        source: item.source,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        highResUrl: item.highResUrl,
        keywords: item.keywords || [],
        addedAt: Date.now()
      });
      
      collection.updatedAt = Date.now();
      this.saveData(data);
    }
    
    return { success: true, collection };
  }

  removeFromCollection(collectionName, id, source) {
    const data = this.getData();
    
    if (!data.collections[collectionName]) {
      return { success: false, error: 'Collection not found' };
    }
    
    const collection = data.collections[collectionName];
    collection.items = collection.items.filter(i => 
      !(i.id === id && i.source === source)
    );
    collection.updatedAt = Date.now();
    
    this.saveData(data);
    return { success: true, collection };
  }

  getCollections() {
    const data = this.getData();
    return Object.values(data.collections);
  }

  getCollection(name) {
    const data = this.getData();
    return data.collections[name] || null;
  }

  getSettings() {
    const data = this.getData();
    return data.settings;
  }

  updateSettings(settings) {
    const data = this.getData();
    data.settings = { ...data.settings, ...settings };
    this.saveData(data);
    return data.settings;
  }

  clearRecent() {
    const data = this.getData();
    data.recent = [];
    this.saveData(data);
    return true;
  }

  exportData() {
    return this.getData();
  }

  importData(importedData) {
    try {
      const data = this.getData();
      
      if (importedData.favorites) {
        data.favorites = [...data.favorites, ...importedData.favorites];
      }
      
      if (importedData.collections) {
        Object.assign(data.collections, importedData.collections);
      }
      
      this.saveData(data);
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }
}

const mediaStorage = new MediaStorage();
