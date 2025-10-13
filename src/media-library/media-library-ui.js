class MediaLibraryUI {
  constructor() {
    this.dialog = null;
    this.currentView = 'search';
    this.currentSource = 'pexels';
    this.searchResults = [];
    this.selectedItem = null;
    this.selectedItems = [];
    this.onSelectCallback = null;
    this.searchTimeout = null;
    this.currentQuery = '';
    this.allowMultiple = false;
    this.pexelsOptions = {};
    this.currentOrientation = '';
  }

  open(options = {}) {
    const { onSelect, allowMultiple = false, title = 'Symbolbibliotek', pexelsOptions = {} } = options;

    this.onSelectCallback = onSelect;
    this.allowMultiple = allowMultiple;
    this.selectedItems = [];
    this.pexelsOptions = pexelsOptions;
    this.currentOrientation = '';

    if (!this.dialog || !this.dialog.querySelector('.multi-select-confirm-btn')) {
      if (this.dialog) {
        this.dialog.remove();
      }
      this.createDialog(title);
    }

    // Set default filter state
    this.dialog.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.orientation === '');
    });

    // Show filter bar for Pexels source
    const filterBar = this.dialog.querySelector('#filterBar');
    if (this.currentSource === 'pexels') {
      filterBar.style.display = 'block';
    }

    this.updateMultiSelectButton();
    this.dialog.showModal();
    this.switchView('search');
    this.loadDefaultContent();

    const searchInput = this.dialog.querySelector('#mediaLibrarySearch');
    if (searchInput) {
      searchInput.focus();
    }
  }

  close() {
    if (this.dialog) {
      this.dialog.close();
    }
  }

  createDialog(title) {
    this.dialog = document.createElement('dialog');
    this.dialog.id = 'mediaLibraryDialog';
    this.dialog.className = 'media-library-dialog';
    
    this.dialog.innerHTML = `
      <div class="media-library-container">
        <header class="media-library-header">
          <h2>${title}</h2>
          <button type="button" class="close-btn" aria-label="Stäng">×</button>
        </header>
        
        <nav class="media-library-tabs">
          <button type="button" class="tab-btn active" data-view="search">
            <span class="icon">🔍</span>
            Sök
          </button>
          <button type="button" class="tab-btn" data-view="recent">
            <span class="icon">🕐</span>
            Senaste
          </button>
          <button type="button" class="tab-btn" data-view="favorites">
            <span class="icon">⭐</span>
            Favoriter
          </button>
          <button type="button" class="tab-btn" data-view="collections">
            <span class="icon">📁</span>
            Samlingar
          </button>
        </nav>

        <div class="media-library-content">
          <div class="search-view view-panel active" data-view="search">
            <div class="search-source-tabs">
              <button type="button" class="source-tab active" data-source="pexels">
                📷 Foton (Svenska)
              </button>
              <button type="button" class="source-tab" data-source="arasaac">
                🎨 Piktogram (English)
              </button>
            </div>
            <div class="search-bar">
              <input
                type="text"
                id="mediaLibrarySearch"
                placeholder="Sök efter bilder på svenska..."
                autocomplete="off"
              />
              <button type="button" class="clear-search-btn" style="display: none;">×</button>
            </div>
            <div class="filter-bar" id="filterBar" style="display: none;">
              <div class="filter-group">
                <label>Orientering:</label>
                <button type="button" class="filter-btn" data-orientation="">Alla</button>
                <button type="button" class="filter-btn" data-orientation="landscape">Horisontell</button>
                <button type="button" class="filter-btn" data-orientation="portrait">Vertikal</button>
                <button type="button" class="filter-btn" data-orientation="square">Kvadratisk</button>
              </div>
            </div>
            <div class="results-container">
              <div class="results-grid" id="searchResults"></div>
              <div class="loading-indicator" style="display: none;">
                <div class="spinner"></div>
                Söker...
              </div>
              <div class="empty-state" style="display: none;">
                Inga resultat hittades
              </div>
            </div>
          </div>

          <div class="recent-view view-panel" data-view="recent">
            <div class="view-header">
              <h3>Senast använda</h3>
              <button type="button" class="clear-recent-btn">Rensa</button>
            </div>
            <div class="results-grid" id="recentResults"></div>
            <div class="empty-state" style="display: none;">
              Inga senast använda symboler
            </div>
          </div>

          <div class="favorites-view view-panel" data-view="favorites">
            <div class="view-header">
              <h3>Favoriter</h3>
            </div>
            <div class="results-grid" id="favoritesResults"></div>
            <div class="empty-state" style="display: none;">
              Inga favoriter sparade
            </div>
          </div>

          <div class="collections-view view-panel" data-view="collections">
            <div class="view-header">
              <h3>Samlingar</h3>
              <button type="button" class="create-collection-btn">+ Skapa samling</button>
            </div>
            <div class="collections-list" id="collectionsList"></div>
            <div class="empty-state" style="display: none;">
              Inga samlingar skapade
            </div>
          </div>
        </div>
        
        <div class="multi-select-fab" style="display: none;">
          <button type="button" class="multi-select-confirm-btn">
            ✓ Lägg till <span class="selected-count">0</span> valda
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.dialog);
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.dialog.querySelector('.close-btn').addEventListener('click', () => this.close());
    
    const confirmBtn = this.dialog.querySelector('.multi-select-confirm-btn');
    confirmBtn.addEventListener('click', () => {
      if (this.selectedItems.length > 0 && this.onSelectCallback) {
        this.selectedItems.forEach(item => mediaStorage.addToRecent(item));
        this.onSelectCallback(this.selectedItems);
        this.close();
      }
    });
    
    this.dialog.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
      });
    });
    
    this.dialog.querySelectorAll('.source-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const source = e.currentTarget.dataset.source;
        this.switchSource(source);
      });
    });

    this.dialog.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orientation = e.currentTarget.dataset.orientation;
        this.setOrientationFilter(orientation);
      });
    });
    
    const searchInput = this.dialog.querySelector('#mediaLibrarySearch');
    searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    const clearSearchBtn = this.dialog.querySelector('.clear-search-btn');
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      this.clearSearchResults();
      this.loadDefaultContent();
    });
    
    this.dialog.querySelector('.clear-recent-btn').addEventListener('click', () => {
      mediaStorage.clearRecent();
      this.loadRecent();
    });
    
    this.dialog.querySelector('.create-collection-btn').addEventListener('click', () => {
      this.createCollectionPrompt();
    });
    
    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) {
        this.close();
      }
    });
  }

  switchView(view) {
    this.currentView = view;
    
    this.dialog.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    this.dialog.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.view === view);
    });
    
    if (view === 'recent') {
      this.loadRecent();
    } else if (view === 'favorites') {
      this.loadFavorites();
    } else if (view === 'collections') {
      this.loadCollections();
    }
  }

  switchSource(source) {
    this.currentSource = source;

    this.dialog.querySelectorAll('.source-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.source === source);
    });

    const filterBar = this.dialog.querySelector('#filterBar');
    if (source === 'pexels') {
      filterBar.style.display = 'block';
    } else {
      filterBar.style.display = 'none';
    }

    const searchInput = this.dialog.querySelector('#mediaLibrarySearch');
    if (source === 'pexels') {
      searchInput.placeholder = 'Sök efter bilder på svenska...';
    } else {
      searchInput.placeholder = 'Search for pictograms in English...';
    }

    if (searchInput.value.trim()) {
      this.handleSearch(searchInput.value);
    } else {
      this.loadDefaultContent();
    }
  }

  setOrientationFilter(orientation) {
    this.currentOrientation = orientation;

    this.dialog.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.orientation === orientation);
    });

    const searchInput = this.dialog.querySelector('#mediaLibrarySearch');
    if (searchInput.value.trim()) {
      this.handleSearch(searchInput.value);
    } else {
      this.loadDefaultContent();
    }
  }

  handleSearch(query) {
    const clearBtn = this.dialog.querySelector('.clear-search-btn');
    clearBtn.style.display = query.length > 0 ? 'block' : 'none';

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (query.trim().length < 2) {
      this.clearSearchResults();
      this.loadDefaultContent();
      return;
    }

    this.currentQuery = query;

    this.searchTimeout = setTimeout(async () => {
      this.showLoading(true);

      let results = [];
      if (this.currentSource === 'pexels') {
        const options = { ...this.pexelsOptions };
        if (this.currentOrientation) {
          options.orientation = this.currentOrientation;
        }
        results = await pexelsService.searchPhotos(query, 'sv', 30, options);
      } else {
        results = await arasaacService.searchPictograms(query, 'en');
      }

      if (this.currentQuery === query) {
        this.displaySearchResults(results);
        this.showLoading(false);
      }
    }, 300);
  }

  async loadDefaultContent() {
    this.showLoading(true);
    let results = [];

    if (this.currentSource === 'pexels') {
      const options = { ...this.pexelsOptions };
      if (this.currentOrientation) {
        options.orientation = this.currentOrientation;
      }
      results = await pexelsService.getCuratedPhotos(30, options);
    } else {
      results = await arasaacService.getNewPictograms(24, 'en');
    }

    this.displaySearchResults(results);
    this.showLoading(false);
  }

  displaySearchResults(results) {
    const container = this.dialog.querySelector('#searchResults');
    const emptyState = this.dialog.querySelector('.search-view .empty-state');
    
    if (results.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = results.map(item => this.createItemCard(item)).join('');
    
    container.querySelectorAll('.media-item').forEach(el => {
      const id = el.dataset.id;
      const source = el.dataset.source;
      const item = results.find(r => String(r.id) === String(id) && r.source === source);
      
      if (!item) return;
      
      el.querySelector('.media-item-select-btn').addEventListener('click', () => {
        this.selectItem(item);
      });
      
      el.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(item, el);
      });
      
      el.querySelector('.add-to-collection-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.addToCollectionPrompt(item);
      });
    });
  }

  createItemCard(item) {
    const isFav = mediaStorage.isFavorite(item.id, item.source);
    const keywords = item.keywords?.slice(0, 3).join(', ') || '';
    const photographer = item.photographer ? `<div class="media-item-credit">📷 ${item.photographer}</div>` : '';
    
    return `
      <div class="media-item" data-id="${item.id}" data-source="${item.source}">
        <div class="media-item-image">
          <img src="${item.thumbnailUrl || item.url}" alt="${keywords}" loading="lazy" />
        </div>
        <div class="media-item-info">
          <div class="media-item-keywords">${keywords}</div>
          ${photographer}
          <div class="media-item-actions">
            <button type="button" class="favorite-btn ${isFav ? 'active' : ''}" 
                    title="${isFav ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}">
              ${isFav ? '⭐' : '☆'}
            </button>
            <button type="button" class="add-to-collection-btn" title="Lägg till i samling">
              📁
            </button>
            <button type="button" class="media-item-select-btn">Välj</button>
          </div>
        </div>
      </div>
    `;
  }

  selectItem(item) {
    if (this.allowMultiple) {
      const index = this.selectedItems.findIndex(i => String(i.id) === String(item.id) && i.source === item.source);
      if (index >= 0) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(item);
      }
      this.updateMultiSelectButton();
      this.updateItemSelection();
    } else {
      mediaStorage.addToRecent(item);
      if (this.onSelectCallback) {
        this.onSelectCallback(item);
      }
      this.close();
    }
  }

  updateMultiSelectButton() {
    const fab = this.dialog?.querySelector('.multi-select-fab');
    const count = this.dialog?.querySelector('.selected-count');
    
    if (fab && count) {
      const hasSelection = this.allowMultiple && this.selectedItems.length > 0;
      fab.style.display = hasSelection ? 'flex' : 'none';
      count.textContent = this.selectedItems.length;
    }
  }

  updateItemSelection() {
    this.dialog.querySelectorAll('.media-item').forEach(el => {
      const id = el.dataset.id;
      const source = el.dataset.source;
      const isSelected = this.selectedItems.some(i => String(i.id) === String(id) && i.source === source);
      el.classList.toggle('selected', isSelected);
    });
  }

  toggleFavorite(item, element) {
    const isFav = mediaStorage.isFavorite(item.id, item.source);
    const btn = element.querySelector('.favorite-btn');
    
    if (isFav) {
      mediaStorage.removeFromFavorites(item.id, item.source);
      btn.classList.remove('active');
      btn.textContent = '☆';
      btn.title = 'Lägg till i favoriter';
    } else {
      mediaStorage.addToFavorites(item);
      btn.classList.add('active');
      btn.textContent = '⭐';
      btn.title = 'Ta bort från favoriter';
    }
    
    if (this.currentView === 'favorites') {
      this.loadFavorites();
    }
  }

  loadRecent() {
    const recent = mediaStorage.getRecent(50);
    const container = this.dialog.querySelector('#recentResults');
    const emptyState = this.dialog.querySelector('.recent-view .empty-state');
    
    if (recent.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = recent.map(item => this.createItemCard(item)).join('');
    
    this.attachItemCardListeners(container, recent);
  }

  loadFavorites() {
    const favorites = mediaStorage.getFavorites();
    const container = this.dialog.querySelector('#favoritesResults');
    const emptyState = this.dialog.querySelector('.favorites-view .empty-state');
    
    if (favorites.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = favorites.map(item => this.createItemCard(item)).join('');
    
    this.attachItemCardListeners(container, favorites);
  }

  loadCollections() {
    const collections = mediaStorage.getCollections();
    const container = this.dialog.querySelector('#collectionsList');
    const emptyState = this.dialog.querySelector('.collections-view .empty-state');
    
    if (collections.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = collections.map(col => this.createCollectionCard(col)).join('');
    
    container.querySelectorAll('.collection-card').forEach(el => {
      const name = el.dataset.name;
      const collection = collections.find(c => c.name === name);
      
      el.addEventListener('click', () => {
        this.openCollection(collection);
      });
      
      el.querySelector('.delete-collection-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Radera samlingen "${name}"?`)) {
          mediaStorage.deleteCollection(name);
          this.loadCollections();
        }
      });
    });
  }

  createCollectionCard(collection) {
    const itemCount = collection.items?.length || 0;
    const preview = collection.items?.slice(0, 3) || [];
    
    return `
      <div class="collection-card" data-name="${collection.name}">
        <div class="collection-preview">
          ${preview.map(item => `
            <img src="${item.thumbnailUrl || item.url}" alt="" />
          `).join('')}
          ${itemCount === 0 ? '<div class="empty-collection">Tom samling</div>' : ''}
        </div>
        <div class="collection-info">
          <div class="collection-name">${collection.name}</div>
          <div class="collection-count">${itemCount} ${itemCount === 1 ? 'symbol' : 'symboler'}</div>
        </div>
        <button type="button" class="delete-collection-btn" title="Radera">🗑️</button>
      </div>
    `;
  }

  openCollection(collection) {
    const dialog = document.createElement('dialog');
    dialog.className = 'collection-detail-dialog';
    dialog.innerHTML = `
      <div class="collection-detail-container">
        <header>
          <h2>${collection.name}</h2>
          <button type="button" class="close-btn">×</button>
        </header>
        <div class="collection-items-grid">
          ${collection.items.map(item => this.createItemCard(item)).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    dialog.showModal();
    
    dialog.querySelector('.close-btn').addEventListener('click', () => {
      dialog.close();
      dialog.remove();
    });
    
    this.attachItemCardListeners(dialog.querySelector('.collection-items-grid'), collection.items);
  }

  attachItemCardListeners(container, items) {
    container.querySelectorAll('.media-item').forEach(el => {
      const id = el.dataset.id;
      const source = el.dataset.source;
      const item = items.find(r => String(r.id) === String(id) && r.source === source);
      
      if (!item) return;
      
      el.querySelector('.media-item-select-btn').addEventListener('click', () => {
        this.selectItem(item);
      });
      
      el.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(item, el);
      });
      
      el.querySelector('.add-to-collection-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.addToCollectionPrompt(item);
      });
    });
  }

  createCollectionPrompt() {
    const name = prompt('Namn på samling:');
    if (name && name.trim()) {
      const result = mediaStorage.createCollection(name.trim());
      if (result.success) {
        this.loadCollections();
      } else {
        alert(result.error);
      }
    }
  }

  addToCollectionPrompt(item) {
    const collections = mediaStorage.getCollections();
    
    if (collections.length === 0) {
      const name = prompt('Skapa en ny samling:');
      if (name && name.trim()) {
        mediaStorage.addToCollection(name.trim(), item);
        alert(`Symbol tillagd i "${name.trim()}"`);
      }
      return;
    }
    
    const collectionNames = collections.map(c => c.name);
    const choices = collectionNames.join('\n');
    const selected = prompt(`Välj samling eller skriv ett nytt namn:\n\n${choices}`);
    
    if (selected && selected.trim()) {
      mediaStorage.addToCollection(selected.trim(), item);
      alert(`Symbol tillagd i "${selected.trim()}"`);
    }
  }

  showLoading(show) {
    const loading = this.dialog.querySelector('.loading-indicator');
    if (loading) {
      loading.style.display = show ? 'flex' : 'none';
    }
  }

  clearSearchResults() {
    const container = this.dialog.querySelector('#searchResults');
    const emptyState = this.dialog.querySelector('.search-view .empty-state');
    container.innerHTML = '';
    emptyState.style.display = 'none';
  }
}

const mediaLibraryUI = new MediaLibraryUI();
