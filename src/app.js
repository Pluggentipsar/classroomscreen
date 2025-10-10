(function () {
  "use strict";

  var widgetLayer = document.getElementById("widgetLayer");
  var backgroundOverlay = document.getElementById("backgroundOverlay");
  var toolbar = document.querySelector(".smart-dock");
  var statusClock = document.getElementById("statusClock");
  var statusDate = document.getElementById("statusDate");
  var footerToggleBtn = document.getElementById("footerToggleBtn");
  var appShell = document.querySelector(".app-shell");
  var backgroundDialog = document.getElementById("backgroundDialog");
  var moreDialog = document.getElementById("moreDialog");
  var roomDialog = document.getElementById("roomDialog");
  var backgroundGrid = document.getElementById("backgroundGrid");
  var backgroundUrlInput = document.getElementById("backgroundUrlInput");
  var backgroundUrlButton = document.getElementById("backgroundUrlAddBtn");
  var backgroundFileInput = document.getElementById("backgroundFileInput");
  var backgroundFileButton = document.getElementById("backgroundFileButton");
  var backgroundMessage = document.getElementById("backgroundMessage");
  var moreGrid = document.getElementById("moreGrid");
  var launcherOverlay = document.getElementById("launcherOverlay");
  var launcherBackdrop = document.getElementById("launcherBackdrop");
  var launcherSearchInput = document.getElementById("launcherSearchInput");
  var launcherCloseBtn = document.getElementById("launcherCloseBtn");
  var launcherGrid = document.getElementById("launcherGrid");
  var launcherFavorites = document.getElementById("launcherFavorites");
  var launcherRecent = document.getElementById("launcherRecent");
  var dockMoreButton = document.getElementById("dockMoreButton");

  // Essential elements - viewer mode only needs widgetLayer and backgroundOverlay
  if (!widgetLayer || !backgroundOverlay) {
    console.error("Missing essential elements:", { widgetLayer: !!widgetLayer, backgroundOverlay: !!backgroundOverlay });
    return;
  }
  
  // Toolbar is optional in viewer mode
  if (!toolbar && !window.isViewerMode) {
    console.error("Missing toolbar element in non-viewer mode");
    return;
  }

  var STORAGE_KEY = "classroomscreen-state-v1";
  var SCREENS_KEY = "classroomscreen-screens-v1";
  var CURRENT_SCREEN_KEY = "classroomscreen-current-screen-v1";
  var FOOTER_COLLAPSED_KEY = "classroomscreen-footer-collapsed-v1";

  var BUILT_IN_BACKGROUNDS = [
    { id: "background-autumn", label: "H\u00f6stl\u00f6v", url: "https://images.unsplash.com/photo-1504199367641-aba8151af406?auto=format&fit=crop&w=1920&q=80", builtIn: true },
    { id: "background-sunset", label: "Pastellhimmel", url: "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1920&q=80", builtIn: true },
    { id: "background-lake", label: "Still sj\u00f6", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80", builtIn: true },
    { id: "background-chalk", label: "Gr\u00f6n tavla", url: "https://images.unsplash.com/photo-1596496051644-5419dced3e3f?auto=format&fit=crop&w=1920&q=80", builtIn: true }
  ];
  var BACKGROUND_STORAGE_KEY = "classroomscreen-custom-backgrounds-v1";
  var BACKGROUND_MAX_FILE_SIZE = 4 * 1024 * 1024;
  var backgrounds = BUILT_IN_BACKGROUNDS.slice();
  var customBackgrounds = [];

  var primaryWidgets = [
    "poll",
    "randomizer",
    "sound-level",
    "music",
    "image",
    "text",
    "work-sym",
    "traffic-light",
    "timetable",
    "timer",
    "clock"
  ];

  var moreWidgets = [
    "presentation",
    "pace-bar",
    "group-maker",
    "scoreboard",
    "hand-raise",
    "youtube",
    "qr-code",
    "step-instruction",
    "source-critique",
    "seating-chart",
    "attention-signal",
    "exit-ticket",
    "vocab-wall"
  ];

  var widgetIcons = {
    "music": "\uD83C\uDFB5",
    "presentation": "📽️",
    "pace-bar": "📊",
    "group-maker": "👥",
    "scoreboard": "🏆",
    "hand-raise": "✋",
    "youtube": "🎬",
    "seating-chart": "🪑",
    "attention-signal": "🔔",
    "qr-code": "📱",
    "step-instruction": "📝",
    "exit-ticket": "✅",
    "vocab-wall": "📚",
    "source-critique": "🔍"
  };

  var widgetNamesSwedish = {
    "background": "Bakgrund",
    "poll": "Omröstning",
    "randomizer": "Namnslumpare",
    "sound-level": "Ljudnivå",
    "music": "Musikspelare",
    "image": "Bild",
    "text": "Instruktioner",
    "work-sym": "Arbetssätt",
    "traffic-light": "Trafikljus",
    "timetable": "Schema",
    "timer": "Timer",
    "clock": "Klocka",
    "presentation": "Presentation",
    "pace-bar": "Lektionsprogress",
    "group-maker": "Gruppmakare",
    "scoreboard": "Poängtavla",
    "hand-raise": "Handuppräckning",
    "youtube": "YouTube",
    "qr-code": "QR-kod",
    "step-instruction": "Stegvis instruktion",
    "source-critique": "Källkritik-kort",
    "seating-chart": "Sittplatskarta",
    "attention-signal": "Uppmärksamhetssignal",
    "exit-ticket": "Exitbiljett",
    "vocab-wall": "Ordvägg"
  };

  var launcherRecentWidgets = [];
  var launcherFavoriteWidgets = ["background", "poll", "randomizer", "music", "timer"];

  var MUSIC_BASE_TRACKS = [
    { id: "music-track-1", title: "Lugn studiemusik (piano)", src: "Musik/Lugn studiemusik, piano.mp3", builtIn: true },
    { id: "music-track-2", title: "Lugn studiemusik", src: "Musik/Lugn studiemusik.mp3", builtIn: true }
  ];
  var MUSIC_MAX_FILE_SIZE = 4 * 1024 * 1024;

  function generateId(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8);
  }

  function cloneMusicTrack(track) {
    if (!track) { return null; }
    var cloned = {
      id: ensureString(track.id, generateId("music-track")),
      title: ensureString(track.title, "Sp\u00e5r"),
      builtIn: !!track.builtIn
    };
    if (cloned.builtIn) {
      cloned.src = ensureString(track.src, "");
    } else if (track.dataUrl) {
      cloned.dataUrl = ensureString(track.dataUrl, "");
    }
    if (!cloned.src && !cloned.dataUrl) {
      return null;
    }
    return cloned;
  }

  function createDefaultMusicPlaylist() {
    return MUSIC_BASE_TRACKS.map(function (track) {
      return {
        id: track.id,
        title: track.title,
        src: track.src,
        builtIn: true
      };
    });
  }

  function normalizeMusicPlaylist(rawList) {
    var list = ensureArray(rawList);
    var seen = {};
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = cloneMusicTrack(list[i]);
      if (!item) { continue; }
      if (seen[item.id]) { continue; }
      seen[item.id] = true;
      normalized.push(item);
    }
    if (!normalized.length) {
      normalized = createDefaultMusicPlaylist();
    }
    return normalized;
  }

  function ensureMusicBaseTracks(playlist) {
    var list = playlist.slice();
    var present = {};
    for (var i = 0; i < list.length; i += 1) {
      present[list[i].id] = true;
    }
    for (var j = 0; j < MUSIC_BASE_TRACKS.length; j += 1) {
      var base = MUSIC_BASE_TRACKS[j];
      if (!present[base.id]) {
        list.unshift({
          id: base.id,
          title: base.title,
          src: base.src,
          builtIn: true
        });
      }
    }
    return list;
  }

  function findMusicTrack(playlist, trackId) {
    for (var i = 0; i < playlist.length; i += 1) {
      if (playlist[i].id === trackId) {
        return playlist[i];
      }
    }
    return null;
  }

  function resolveMusicTrackId(trackId, playlist) {
    var track = findMusicTrack(playlist, trackId);
    if (track) {
      return track.id;
    }
    return playlist.length ? playlist[0].id : null;
  }

  var currentBackground = backgrounds[0].url;
  var manager = null;
  var currentScreenId = null;
  var adminDialog = null;
  var widgetsVisible = true;
  var uiVisible = true;
  var footerCollapsed = false;
  function storageEnabled() {
    try {
      var testKey = "__cls_check__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn("localStorage otillg\u00e4ngligt", error);
      return false;
    }
  }

  var canUseStorage = storageEnabled();

  if (canUseStorage) {
    customBackgrounds = loadCustomBackgrounds();
  } else {
    customBackgrounds = [];
  }
  refreshBackgroundLibrary();

  function ensureNumber(value, fallback) {
    return typeof value === "number" && isFinite(value) ? value : fallback;
  }

  function ensureArray(value) {
    return Object.prototype.toString.call(value) === "[object Array]" ? value.slice() : [];
  }

  function ensureString(value, fallback) {
    return typeof value === "string" ? value : fallback;
  }

  function cloneBackgroundEntry(entry) {
    if (!entry) { return null; }
    var id = ensureString(entry.id, generateId("background"));
    var label = ensureString(entry.label, "Bakgrund");
    var url = ensureString(entry.url, "");
    if (!url) { return null; }
    var result = {
      id: id,
      label: label,
      url: url,
      builtIn: !!entry.builtIn,
      custom: !!entry.custom
    };
    if (!result.builtIn) {
      result.custom = true;
    }
    return result;
  }

  function loadCustomBackgrounds() {
    try {
      var raw = window.localStorage.getItem(BACKGROUND_STORAGE_KEY);
      if (!raw) { return []; }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { return []; }
      var list = [];
      for (var i = 0; i < parsed.length; i += 1) {
        var item = cloneBackgroundEntry(parsed[i]);
        if (item) {
          item.builtIn = false;
          item.custom = true;
          list.push(item);
        }
      }
      return list;
    } catch (error) {
      console.warn("Kunde inte ladda egna bakgrunder", error);
      return [];
    }
  }

  function saveCustomBackgrounds(list) {
    if (!canUseStorage) { return; }
    try {
      window.localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      console.warn("Kunde inte spara egna bakgrunder", error);
    }
  }

  function refreshBackgroundLibrary() {
    backgrounds = BUILT_IN_BACKGROUNDS.slice();
    if (customBackgrounds && customBackgrounds.length) {
      backgrounds = backgrounds.concat(customBackgrounds);
    }
  }

  function findBackgroundByUrl(url) {
    if (!url) { return null; }
    for (var i = 0; i < backgrounds.length; i += 1) {
      if (backgrounds[i].url === url) {
        return backgrounds[i];
      }
    }
    return null;
  }

  var backgroundControlsInitialized = false;

  function showBackgroundMessage(text, type) {
    if (!backgroundMessage) { return; }
    if (!text) {
      backgroundMessage.textContent = "";
      backgroundMessage.removeAttribute("data-type");
      return;
    }
    backgroundMessage.textContent = text;
    backgroundMessage.setAttribute("data-type", type || "info");
  }

  function sanitizeBackgroundLabel(name) {
    var base = ensureString(name, "");
    base = base.replace(/\.[^\.]+$/, "");
    base = base.trim();
    if (!base) {
      base = "Egen bakgrund";
    }
    if (base.length > 36) {
      base = base.slice(0, 33) + "...";
    }
    return base;
  }

  function inferBackgroundLabelFromUrl(url) {
    try {
      var parsed = new URL(url);
      var segments = parsed.pathname.split("/").filter(function (part) { return part; });
      if (segments.length) {
        return sanitizeBackgroundLabel(decodeURIComponent(segments[segments.length - 1]));
      }
      return sanitizeBackgroundLabel(parsed.hostname);
    } catch (error) {
      return "Egen bakgrund";
    }
  }

  function addCustomBackgroundEntry(entry, options) {
    var normalized = cloneBackgroundEntry(entry);
    if (!normalized) {
      showBackgroundMessage("Ogiltig bakgrund.", "error");
      return false;
    }
    if (findBackgroundByUrl(normalized.url)) {
      showBackgroundMessage("Den h\u00e4r bakgrunden finns redan.", "error");
      return false;
    }
    normalized.builtIn = false;
    normalized.custom = true;
    customBackgrounds.unshift(normalized);
    saveCustomBackgrounds(customBackgrounds);
    refreshBackgroundLibrary();
    renderBackgroundGrid();
    if (!options || options.setActive !== false) {
      setBackground(normalized.url);
    } else {
      highlightActiveBackground();
    }
    if (!options || !options.skipMessage) {
      showBackgroundMessage('Bakgrunden "' + normalized.label + '" lades till.', "info");
    }
    return true;
  }

  function removeCustomBackground(id) {
    var index = -1;
    for (var i = 0; i < customBackgrounds.length; i += 1) {
      if (customBackgrounds[i].id === id) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      return;
    }
    var removed = customBackgrounds.splice(index, 1)[0];
    saveCustomBackgrounds(customBackgrounds);
    refreshBackgroundLibrary();
    renderBackgroundGrid();
    showBackgroundMessage("Bakgrunden togs bort.", "info");
    if (removed && removed.url === currentBackground) {
      if (backgrounds.length) {
        setBackground(backgrounds[0].url);
      }
    }
  }

  function renderBackgroundGrid() {
    if (!backgroundGrid) { return; }
    clearChildren(backgroundGrid);
    for (var i = 0; i < backgrounds.length; i += 1) {
      (function (item) {
        var wrapper = createElement("div", "background-item");
        var button = document.createElement("button");
        button.type = "button";
        button.className = "background-thumb";
        var img = document.createElement("img");
        img.src = item.url;
        img.alt = item.label;
        button.appendChild(img);
        if (item.url === currentBackground) {
          button.setAttribute("data-active", "true");
          wrapper.setAttribute("data-active", "true");
        }
        button.addEventListener("click", function () {
          setBackground(item.url);
          if (backgroundDialog && typeof backgroundDialog.close === "function") {
            backgroundDialog.close();
          }
        });
        wrapper.appendChild(button);

        var caption = createElement("div", "background-label");
        caption.textContent = item.label;
        wrapper.appendChild(caption);

        if (item.custom) {
          wrapper.setAttribute("data-custom", "true");
          var removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "background-remove";
          removeBtn.title = "Ta bort bakgrund";
          removeBtn.textContent = "\u00d7";
          removeBtn.addEventListener("click", function (event) {
            stopEvent(event);
            removeCustomBackground(item.id);
          });
          wrapper.appendChild(removeBtn);
        }

        backgroundGrid.appendChild(wrapper);
      })(backgrounds[i]);
    }
    highlightActiveBackground();
  }

  function handleBackgroundUrlSubmit() {
    if (!backgroundUrlInput) {
      return;
    }
    var value = backgroundUrlInput.value ? backgroundUrlInput.value.trim() : "";
    if (!value) {
      showBackgroundMessage("Klistra in en bildadress f\u00f6rst.", "error");
      return;
    }
    if (!/^https?:\/\//i.test(value)) {
      showBackgroundMessage("Ange en giltig webbadress som börjar med http eller https.", "error");
      return;
    }
    var entry = {
      id: generateId("background"),
      label: inferBackgroundLabelFromUrl(value),
      url: value,
      custom: true
    };
    if (addCustomBackgroundEntry(entry)) {
      backgroundUrlInput.value = "";
    }
  }

  function handleBackgroundFileSelection(fileList) {
    var files = fileList ? Array.prototype.slice.call(fileList) : [];
    if (!files.length) {
      return;
    }
    var index = 0;
    function processNext() {
      if (index >= files.length) {
        if (backgroundFileInput) {
          backgroundFileInput.value = "";
        }
        return;
      }
      var file = files[index];
      index += 1;
      if (file.size > BACKGROUND_MAX_FILE_SIZE) {
        showBackgroundMessage('Filen "' + file.name + '" är för stor (max 4 MB).', "error");
        processNext();
        return;
      }
      var reader = new FileReader();
      reader.onload = function (event) {
        var entry = {
          id: generateId("background"),
          label: sanitizeBackgroundLabel(file.name),
          url: event.target.result,
          custom: true
        };
        addCustomBackgroundEntry(entry);
        processNext();
      };
      reader.onerror = function () {
        showBackgroundMessage('Kunde inte läsa filen "' + file.name + '".', "error");
        processNext();
      };
      reader.readAsDataURL(file);
    }
    processNext();
  }

  function initBackgroundControls() {
    if (backgroundControlsInitialized) { return; }
    backgroundControlsInitialized = true;
    if (backgroundUrlButton && backgroundUrlInput) {
      backgroundUrlButton.addEventListener("click", function () {
        handleBackgroundUrlSubmit();
      });
      backgroundUrlInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          stopEvent(event);
          handleBackgroundUrlSubmit();
        }
      });
    }
    if (backgroundFileButton && backgroundFileInput) {
      backgroundFileButton.addEventListener("click", function () {
        backgroundFileInput.value = "";
        backgroundFileInput.click();
      });
      backgroundFileInput.addEventListener("change", function () {
        handleBackgroundFileSelection(backgroundFileInput.files);
      });
    }
  }

  function clearChildren(node) {
    while (node && node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function createElement(tag, className) {
    var element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    return element;
  }

  function stopEvent(event) {
    if (event) {
      if (typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      if (typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
    }
  }

  function findWidgetElement(node) {
    var current = node;
    while (current) {
      if (current.classList && current.classList.contains("widget")) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  function canViewerInteract(element) {
    if (!window.isViewerMode) {
      return true;
    }
    var widget = findWidgetElement(element);
    if (!widget) {
      return true;
    }
    return widget.getAttribute("data-viewer-control") !== "disabled";
  }

  function updateViewerInteractivity(widget, enabled) {
    if (!window.isViewerMode || !widget) {
      return;
    }
    var allow = !!enabled;
    widget.setAttribute("data-viewer-disabled", allow ? "false" : "true");
    var focusableSelectors = "button, input, select, textarea, [contenteditable='true'], [tabindex]";
    var interactive = widget.querySelectorAll(focusableSelectors);
    for (var i = 0; i < interactive.length; i += 1) {
      var element = interactive[i];
      var isFormControl = typeof element.disabled === "boolean";
      if (!allow) {
        if (isFormControl && !element.hasAttribute("data-viewer-original-disabled")) {
          element.setAttribute("data-viewer-original-disabled", element.disabled ? "true" : "false");
        }
        if (element.isContentEditable && !element.hasAttribute("data-viewer-original-contenteditable")) {
          element.setAttribute("data-viewer-original-contenteditable", element.getAttribute("contenteditable") || "");
        }
        if (!element.hasAttribute("data-viewer-original-tabindex")) {
          var originalTabIndex = element.getAttribute("tabindex");
          element.setAttribute("data-viewer-original-tabindex", originalTabIndex !== null ? originalTabIndex : "");
        }
        if (isFormControl) {
          element.disabled = true;
        }
        if (element.isContentEditable) {
          element.setAttribute("contenteditable", "false");
        }
        element.setAttribute("tabindex", "-1");
        element.setAttribute("data-viewer-disabled", "true");
      } else {
        if (isFormControl && element.hasAttribute("data-viewer-original-disabled")) {
          var wasDisabled = element.getAttribute("data-viewer-original-disabled") === "true";
          element.disabled = wasDisabled;
          element.removeAttribute("data-viewer-original-disabled");
        }
        if (element.hasAttribute("data-viewer-original-contenteditable")) {
          var original = element.getAttribute("data-viewer-original-contenteditable");
          if (original === "") {
            element.removeAttribute("contenteditable");
          } else {
            element.setAttribute("contenteditable", original);
          }
          element.removeAttribute("data-viewer-original-contenteditable");
        }
        if (element.hasAttribute("data-viewer-original-tabindex")) {
          var originalTabIndexValue = element.getAttribute("data-viewer-original-tabindex");
          if (originalTabIndexValue === "") {
            element.removeAttribute("tabindex");
          } else {
            element.setAttribute("tabindex", originalTabIndexValue);
          }
          element.removeAttribute("data-viewer-original-tabindex");
        } else if (element.getAttribute("tabindex") === "-1") {
          element.removeAttribute("tabindex");
        }
        element.removeAttribute("data-viewer-disabled");
      }
    }
  }
  var widgetFactory = {
    "clock": {
      title: "Klocka",
      defaults: function () {
        return null;
      },
      render: function (container) {
        var time = createElement("div", "clock-widget");
        var date = createElement("div", "text-muted");
        container.appendChild(time);
        container.appendChild(date);

        function update() {
          var now = new Date();
          time.textContent = now.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
          date.textContent = now.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" });
        }

        update();
        var intervalId = window.setInterval(update, 30000);
        container._cleanup = function () {
          window.clearInterval(intervalId);
        };
      },
      save: function () {
        return null;
      },
      destroy: function (widget) {
        var content = widget.querySelector(".widget-content");
        if (content && typeof content._cleanup === "function") {
          content._cleanup();
        }
      }
    },
    "timer": {
      title: "Timer",
      defaults: function () {
        return { minutes: 5, alertType: "sound" };
      },
      render: function (container, data, onChange) {
        var minutes = data && typeof data.minutes === "number" ? data.minutes : 5;
        var alertType = data && data.alertType ? data.alertType : "sound";
        var running = data && data.running === true ? true : false;
        var remaining = data && typeof data.remaining === "number" ? data.remaining : (minutes * 60);
        var state = {
          duration: minutes * 60,
          remaining: remaining,
          running: false, // Will be started by load() if needed
          interval: null,
          alertType: alertType,
          minutes: minutes
        };

        // Create progress ring SVG
        var radius = 64;
        var circumference = 2 * Math.PI * radius;
        var ringContainer = createElement("div", "progress-ring-container");
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "progress-ring");
        svg.setAttribute("width", "160");
        svg.setAttribute("height", "160");
        
        var bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bgCircle.setAttribute("class", "progress-ring-bg");
        bgCircle.setAttribute("cx", "80");
        bgCircle.setAttribute("cy", "80");
        bgCircle.setAttribute("r", String(radius));
        bgCircle.setAttribute("stroke-width", "10");
        bgCircle.setAttribute("fill", "none");
        
        var fillCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        fillCircle.setAttribute("class", "progress-ring-fill");
        fillCircle.setAttribute("cx", "80");
        fillCircle.setAttribute("cy", "80");
        fillCircle.setAttribute("r", String(radius));
        fillCircle.setAttribute("stroke-width", "12");
        fillCircle.setAttribute("fill", "none");
        fillCircle.setAttribute("stroke-dasharray", String(circumference));
        fillCircle.setAttribute("stroke-dashoffset", "0");
        
        svg.appendChild(bgCircle);
        svg.appendChild(fillCircle);
        
        // Display in center of ring
        var centerDiv = createElement("div", "progress-ring-center");
        var display = createElement("div", "big-digits");
        centerDiv.appendChild(display);
        
        ringContainer.appendChild(svg);
        ringContainer.appendChild(centerDiv);

        // Length control with +/- buttons
        var lengthControl = createElement("div", "timer-length-control");
        var lengthLabel = createElement("div", "timer-length-label");
        lengthLabel.textContent = "Längd";
        var lengthButtons = createElement("div", "timer-length-buttons");
        var minusBtn = createElement("button", "timer-length-btn");
        minusBtn.textContent = "−";
        minusBtn.type = "button";
        var lengthValue = createElement("div", "timer-length-value");
        lengthValue.textContent = minutes + " min";
        var plusBtn = createElement("button", "timer-length-btn");
        plusBtn.textContent = "+";
        plusBtn.type = "button";
        
        lengthButtons.appendChild(minusBtn);
        lengthButtons.appendChild(lengthValue);
        lengthButtons.appendChild(plusBtn);
        lengthControl.appendChild(lengthLabel);
        lengthControl.appendChild(lengthButtons);

        // Toggle switches for alert options
        var toggleGroup = createElement("div", "toggle-group");
        
        var soundToggle = createElement("label", "toggle-switch");
        var soundInput = createElement("div", "toggle-switch-input");
        if (alertType === "sound") soundInput.classList.add("active");
        var soundLabel = createElement("div", "toggle-switch-label");
        soundLabel.innerHTML = '<span style="font-size: 16px;">🔊</span> <span>Ljudsignal</span>';
        soundToggle.appendChild(soundInput);
        soundToggle.appendChild(soundLabel);
        
        var visualToggle = createElement("label", "toggle-switch");
        var visualInput = createElement("div", "toggle-switch-input");
        if (alertType === "visual") visualInput.classList.add("active");
        var visualLabel = createElement("div", "toggle-switch-label");
        visualLabel.innerHTML = '<span style="font-size: 16px;">💡</span> <span>Visuell puls</span>';
        visualToggle.appendChild(visualInput);
        visualToggle.appendChild(visualLabel);
        
        toggleGroup.appendChild(soundToggle);
        toggleGroup.appendChild(visualToggle);

        // Controls
        var controls = createElement("div", "timer-controls-row");
        var startStop = document.createElement("button");
        startStop.setAttribute("data-state", "start");
        startStop.innerHTML = "▶ Starta";
        var reset = document.createElement("button");
        reset.innerHTML = "↻ Återställ";

        controls.appendChild(startStop);
        controls.appendChild(reset);

        // Layout
        container.appendChild(ringContainer);
        container.appendChild(lengthControl);
        container.appendChild(toggleGroup);
        container.appendChild(controls);

        // +/- button listeners
        minusBtn.addEventListener("click", function () {
          if (window.isViewerMode) {
            var widget = container.closest(".widget");
            var viewerControlEnabled = widget && widget.getAttribute("data-viewer-control") === "enabled";
            if (!viewerControlEnabled) return;
          }
          if (state.running) return;
          state.minutes = Math.max(1, state.minutes - 1);
          state.duration = state.minutes * 60;
          state.remaining = state.duration;
          lengthValue.textContent = state.minutes + " min";
          updateDisplay();
          if (typeof onChange === "function") onChange();
        });
        
        plusBtn.addEventListener("click", function () {
          if (window.isViewerMode) {
            var widget = container.closest(".widget");
            var viewerControlEnabled = widget && widget.getAttribute("data-viewer-control") === "enabled";
            if (!viewerControlEnabled) return;
          }
          if (state.running) return;
          state.minutes = Math.min(99, state.minutes + 1);
          state.duration = state.minutes * 60;
          state.remaining = state.duration;
          lengthValue.textContent = state.minutes + " min";
          updateDisplay();
          if (typeof onChange === "function") onChange();
        });

        soundToggle.addEventListener("click", function () {
          if (window.isViewerMode) {
            var widget = container.closest(".widget");
            var viewerControlEnabled = widget && widget.getAttribute("data-viewer-control") === "enabled";
            if (!viewerControlEnabled) return;
          }
          state.alertType = "sound";
          soundInput.classList.add("active");
          visualInput.classList.remove("active");
          if (typeof onChange === "function") onChange();
        });

        visualToggle.addEventListener("click", function () {
          if (window.isViewerMode) {
            var widget = container.closest(".widget");
            var viewerControlEnabled = widget && widget.getAttribute("data-viewer-control") === "enabled";
            if (!viewerControlEnabled) return;
          }
          state.alertType = "visual";
          visualInput.classList.add("active");
          soundInput.classList.remove("active");
          if (typeof onChange === "function") onChange();
        });

        function updateDisplay() {
          var seconds = state.running ? state.remaining : state.duration;
          var m = Math.floor(seconds / 60);
          var s = seconds % 60;
          display.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
          
          // Update progress ring
          var progress = state.duration > 0 ? state.remaining / state.duration : 0;
          var offset = circumference * (1 - progress);
          fillCircle.setAttribute("stroke-dashoffset", String(offset));
          
          // Add warning class for last 10 seconds
          if (state.remaining <= 10 && state.remaining > 0) {
            fillCircle.classList.add("warning");
          } else {
            fillCircle.classList.remove("warning");
          }
        }

        function stopTimer() {
          state.running = false;
          startStop.setAttribute("data-state", "start");
          startStop.innerHTML = "▶ Starta";
          display.classList.remove("timer-pulse");
          fillCircle.classList.remove("warning", "danger");
          if (state.interval) {
            window.clearInterval(state.interval);
            state.interval = null;
          }
        }

        startStop.addEventListener("click", function () {
          if (window.isViewerMode) {
            var widget = container.closest(".widget");
            var viewerControlEnabled = widget && widget.getAttribute("data-viewer-control") === "enabled";
            if (!viewerControlEnabled) {
              console.log("Timer control blocked - viewer control disabled");
              return;
            }
          }

          if (state.running) {
            stopTimer();
            if (typeof onChange === "function") {
              onChange();
            }
            return;
          }
          state.running = true;
          state.remaining = state.duration;
          startStop.setAttribute("data-state", "stop");
          startStop.innerHTML = "⏸ Pausa";
          display.classList.remove("timer-pulse");
          fillCircle.classList.remove("warning", "danger");
          state.interval = window.setInterval(function () {
            state.remaining = Math.max(0, state.remaining - 1);
            updateDisplay();
            if (state.remaining === 0) {
              stopTimer();
              if (state.alertType === "sound") {
                try {
                  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3").play();
                } catch (error) {
                  console.warn("Timer-ljud kunde inte spelas", error);
                }
              } else {
                display.classList.add("timer-pulse");
                fillCircle.classList.add("danger");
              }
            }
          }, 1000);
          
          // Broadcast timer start
          if (typeof onChange === "function") {
            onChange();
          }
        });

        reset.addEventListener("click", function () {
          if (window.isViewerMode) {
            var widget = container.closest(".widget");
            var viewerControlEnabled = widget && widget.getAttribute("data-viewer-control") === "enabled";
            if (!viewerControlEnabled) {
              console.log("Timer reset blocked - viewer control disabled");
              return;
            }
          }

          stopTimer();
          state.duration = state.minutes * 60;
          state.remaining = state.duration;
          updateDisplay();
          if (typeof onChange === "function") {
            onChange();
          }
        });

        updateDisplay();
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        var minutes = state && state.minutes ? state.minutes : 5;
        var alertType = state && state.alertType ? state.alertType : "sound";
        var running = state && state.running ? true : false;
        var remaining = state && typeof state.remaining === "number" ? state.remaining : state.duration;
        return { 
          minutes: ensureNumber(minutes, 5), 
          alertType: alertType,
          running: running,
          remaining: remaining
        };
      },
      load: function (widget, data) {
        console.log("Timer load() called with data:", data);
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          console.log("Timer load() - no state found, aborting");
          return;
        }
        
        // Update state from synced data
        if (data.minutes !== undefined) {
          state.minutes = data.minutes;
          state.duration = data.minutes * 60;
          var lengthValue = content.querySelector(".timer-length-value");
          if (lengthValue) {
            lengthValue.textContent = data.minutes + " min";
          }
        }
        if (data.alertType !== undefined) {
          state.alertType = data.alertType;
          var soundInput = content.querySelector(".toggle-switch-input");
          var visualInput = content.querySelectorAll(".toggle-switch-input")[1];
          if (soundInput && visualInput) {
            if (data.alertType === "sound") {
              soundInput.classList.add("active");
              visualInput.classList.remove("active");
            } else {
              soundInput.classList.remove("active");
              visualInput.classList.add("active");
            }
          }
        }
        if (data.remaining !== undefined) {
          state.remaining = data.remaining;
        }
        
        // Handle running state
        var wasRunning = state.running;
        var shouldBeRunning = data.running === true;
        console.log("Timer load() - wasRunning:", wasRunning, "shouldBeRunning:", shouldBeRunning);
        
        if (shouldBeRunning && !wasRunning) {
          // Start timer
          console.log("Timer load() - STARTING timer with remaining:", state.remaining);
          state.running = true;
          var startStop = content.querySelector("button[data-state]");
          if (startStop) {
            startStop.setAttribute("data-state", "stop");
            startStop.innerHTML = "⏸ Pausa";
          }
          var display = content.querySelector(".big-digits");
          var fillCircle = content.querySelector(".progress-ring-fill");
          if (display) display.classList.remove("timer-pulse");
          if (fillCircle) fillCircle.classList.remove("warning", "danger");
          
          // Clear any existing interval
          if (state.interval) {
            window.clearInterval(state.interval);
          }
          
          // Start interval
          state.interval = window.setInterval(function () {
            state.remaining = Math.max(0, state.remaining - 1);
            var m = Math.floor(state.remaining / 60);
            var s = state.remaining % 60;
            if (display) {
              display.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
            }
            
            // Update progress ring
            if (fillCircle) {
              var circumference = 2 * Math.PI * 64;
              var progress = state.duration > 0 ? state.remaining / state.duration : 0;
              var offset = circumference * (1 - progress);
              fillCircle.setAttribute("stroke-dashoffset", String(offset));
              
              // Add warning class for last 10 seconds
              if (state.remaining <= 10 && state.remaining > 0) {
                fillCircle.classList.add("warning");
              } else {
                fillCircle.classList.remove("warning");
              }
            }
            
            if (state.remaining === 0) {
              state.running = false;
              if (startStop) {
                startStop.setAttribute("data-state", "start");
                startStop.innerHTML = "▶ Starta";
              }
              if (display) display.classList.remove("timer-pulse");
              if (fillCircle) fillCircle.classList.remove("warning", "danger");
              if (state.interval) {
                window.clearInterval(state.interval);
                state.interval = null;
              }
              
              if (state.alertType === "sound") {
                try {
                  new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3").play();
                } catch (error) {
                  console.warn("Timer-ljud kunde inte spelas", error);
                }
              } else {
                if (display) display.classList.add("timer-pulse");
                if (fillCircle) fillCircle.classList.add("danger");
              }
            }
          }, 1000);
        } else if (!shouldBeRunning && wasRunning) {
          // Stop timer
          state.running = false;
          var startStop = content.querySelector("button[data-state]");
          if (startStop) {
            startStop.setAttribute("data-state", "start");
            startStop.innerHTML = "▶ Starta";
          }
          var display = content.querySelector(".big-digits");
          var fillCircle = content.querySelector(".progress-ring-fill");
          if (display) display.classList.remove("timer-pulse");
          if (fillCircle) fillCircle.classList.remove("warning", "danger");
          if (state.interval) {
            window.clearInterval(state.interval);
            state.interval = null;
          }
        }
        
        // Update display
        var display = content.querySelector(".big-digits");
        var fillCircle = content.querySelector(".progress-ring-fill");
        var seconds = state.running ? state.remaining : state.duration;
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        if (display) {
          display.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
        }
        if (fillCircle) {
          var circumference = 2 * Math.PI * 64;
          var progress = state.duration > 0 ? state.remaining / state.duration : 0;
          var offset = circumference * (1 - progress);
          fillCircle.setAttribute("stroke-dashoffset", String(offset));
          
          if (state.remaining <= 10 && state.remaining > 0) {
            fillCircle.classList.add("warning");
          } else {
            fillCircle.classList.remove("warning");
          }
        }
      },
      destroy: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (state && state.interval) {
          window.clearInterval(state.interval);
        }
      }
    },
    "text": {
      title: "Instruktioner",
      defaults: function () {
        return { html: "<p>Dubbelklicka f\u00f6r att redigera instruktionerna.</p>" };
      },
      render: function (container, data, onChange) {
        var area = document.createElement("div");
        area.contentEditable = "true";
        area.innerHTML = ensureString(data && data.html, "");
        area.addEventListener("input", function () {
          if (typeof onChange === "function") {
            onChange();
          }
        });
        container.appendChild(area);
      },
      save: function (widget) {
        var area = widget.querySelector("[contenteditable='true']");
        return { html: area ? area.innerHTML : "" };
      }
    },
    "work-sym": {
      title: "Arbetss\u00e4tt",
      defaults: function () {
        return { active: "silent" };
      },
      render: function (container, data, onChange) {
        var options = [
          { id: "together", label: "Arbeta tillsammans" },
          { id: "ask", label: "Fr\u00e5ga grannen" },
          { id: "whisper", label: "Viskniv\u00e5" },
          { id: "silent", label: "Tystnad" }
        ];
        var active = data && data.active ? data.active : "silent";
        var grid = createElement("div", "work-symbols-grid");

        for (var i = 0; i < options.length; i += 1) {
          (function (opt) {
            var button = document.createElement("button");
            button.type = "button";
            button.setAttribute("data-id", opt.id);
            button.textContent = opt.label;
            if (opt.id === active) {
              button.setAttribute("data-active", "true");
            }
            button.addEventListener("click", function () {
              var nodes = grid.querySelectorAll("button[data-active]");
              for (var j = 0; j < nodes.length; j += 1) {
                nodes[j].removeAttribute("data-active");
              }
              button.setAttribute("data-active", "true");
              if (typeof onChange === "function") {
                onChange();
              }
            });
            grid.appendChild(button);
          })(options[i]);
        }

        container.appendChild(grid);
      },
      save: function (widget) {
        var activeButton = widget.querySelector(".work-symbols-grid button[data-active='true']");
        return { active: activeButton ? activeButton.getAttribute("data-id") : "silent" };
      }
    },
    "traffic-light": {
      title: "Trafikljus",
      defaults: function () {
        return { active: "green" };
      },
      render: function (container, data, onChange) {
        var holder = createElement("div", "traffic-light");
        var active = data && data.active ? data.active : "green";
        var colors = ["green", "yellow", "red"];

        for (var i = 0; i < colors.length; i += 1) {
          (function (color) {
            var button = document.createElement("button");
            button.type = "button";
            button.setAttribute("data-color", color);
            if (color === active) {
              button.setAttribute("data-active", "true");
            }
            button.addEventListener("click", function () {
              var nodes = holder.querySelectorAll("button[data-active]");
              for (var j = 0; j < nodes.length; j += 1) {
                nodes[j].removeAttribute("data-active");
              }
              button.setAttribute("data-active", "true");
              if (typeof onChange === "function") {
                onChange();
              }
            });
            holder.appendChild(button);
          })(colors[i]);
        }

        container.appendChild(holder);
      },
      save: function (widget) {
        var activeButton = widget.querySelector(".traffic-light button[data-active='true']");
        return { active: activeButton ? activeButton.getAttribute("data-color") : "green" };
      }
    },
    "timetable": {
      title: "Schema",
      defaults: function () {
        return { rows: ["08:30 – Matematik", "09:45 – Laboration", "11:30 – Lunch"] };
      },
      render: function (container, data, onChange) {
        var rows = ensureArray(data && data.rows);
        var list = createElement("div", "timetable-list");

        function addRow(value) {
          var input = document.createElement("input");
          input.type = "text";
          input.value = value || "";
          input.placeholder = "Tid – Aktivitet";
          input.addEventListener("input", function () {
            if (typeof onChange === "function") {
              onChange();
            }
          });
          list.appendChild(input);
        }

        if (rows.length) {
          for (var i = 0; i < rows.length; i += 1) {
            addRow(rows[i]);
          }
        } else {
          addRow("08:30 – Matematik");
        }

        var addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "Lägg till rad";
        addButton.addEventListener("click", function () {
          addRow("");
          if (typeof onChange === "function") {
            onChange();
          }
        });

        container.appendChild(list);
        container.appendChild(addButton);
      },
      save: function (widget) {
        var inputs = widget.querySelectorAll(".timetable-list input");
        var rows = [];
        for (var i = 0; i < inputs.length; i += 1) {
          var value = inputs[i].value.trim();
          if (value) {
            rows.push(value);
          }
        }
        return { rows: rows };
      }
    },
    "poll": {
      title: "Omröstning",
      defaults: function () {
        return { question: "Vad tyckte du om lektionen?", options: ["👍", "😐", "👎"], votes: [0, 0, 0] };
      },
      render: function (container, data, onChange) {
        var questionValue = ensureString(data && data.question, "Fråga");
        var optionsValue = ensureArray(data && data.options);
        var votesValue = ensureArray(data && data.votes);
        var options = optionsValue.length ? optionsValue : ["Ja", "Nej"];
        var votes = votesValue.length === options.length ? votesValue.slice() : []; 
        while (votes.length < options.length) {
          votes.push(0);
        }

        var state = { question: questionValue, options: options, votes: votes };

        var question = document.createElement("input");
        question.type = "text";
        question.value = state.question;
        question.placeholder = "Fråga";
        question.addEventListener("input", function () {
          state.question = question.value;
          if (typeof onChange === "function") { onChange(); }
        });

        var optionsHolder = createElement("div", "poll-options");
        var results = createElement("div", "poll-results");

        function renderOptions() {
          clearChildren(optionsHolder);
          for (var i = 0; i < state.options.length; i += 1) {
            (function (index) {
              var row = document.createElement("label");
              var textInput = document.createElement("input");
              textInput.type = "text";
              textInput.value = state.options[index];
              textInput.placeholder = "Alternativ";
              textInput.addEventListener("input", function () {
                state.options[index] = textInput.value;
                if (typeof onChange === "function") { onChange(); }
              });
              var voteButton = document.createElement("button");
              voteButton.type = "button";
              voteButton.textContent = "Rösta";
              voteButton.addEventListener("click", function () {
                state.votes[index] = ensureNumber(state.votes[index], 0) + 1;
                renderResults();
                if (typeof onChange === "function") { onChange(); }
              });
              row.appendChild(textInput);
              row.appendChild(voteButton);
              optionsHolder.appendChild(row);
            })(i);
          }
        }

        function renderResults() {
          clearChildren(results);
          var total = 0;
          for (var i = 0; i < state.votes.length; i += 1) {
            total += ensureNumber(state.votes[i], 0);
          }
          if (total === 0) { total = 1; }
          for (var j = 0; j < state.votes.length; j += 1) {
            var line = document.createElement("div");
            line.textContent = ensureString(state.options[j], "Alternativ") + " – " + ensureNumber(state.votes[j], 0);
            var bar = createElement("div", "poll-bar");
            var fill = document.createElement("span");
            fill.style.width = Math.round((ensureNumber(state.votes[j], 0) / total) * 100) + "%";
            bar.appendChild(fill);
            results.appendChild(line);
            results.appendChild(bar);
          }
        }

        var addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "Lägg till alternativ";
        addButton.addEventListener("click", function () {
          state.options.push("Nytt alternativ");
          state.votes.push(0);
          renderOptions();
          renderResults();
          if (typeof onChange === "function") { onChange(); }
        });

        var resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.textContent = "Nollställ";
        resetButton.addEventListener("click", function () {
          for (var i = 0; i < state.votes.length; i += 1) {
            state.votes[i] = 0;
          }
          renderResults();
          if (typeof onChange === "function") { onChange(); }
        });

        var actionRow = createElement("div", "poll-actions");
        actionRow.appendChild(addButton);
        actionRow.appendChild(resetButton);

        container.appendChild(question);
        container.appendChild(optionsHolder);
        container.appendChild(results);
        container.appendChild(actionRow);

        renderOptions();
        renderResults();
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return { question: "Fråga", options: ["Ja", "Nej"], votes: [0, 0] };
        }
        return {
          question: ensureString(state.question, "Fråga"),
          options: ensureArray(state.options),
          votes: ensureArray(state.votes)
        };
      }
    },
    "randomizer": {
      title: "Namnslumpare",
      defaults: function () {
        return { list: "Anna\nBjörn\nCarla\nDavid", history: [] };
      },
      render: function (container, data, onChange) {
        var state = {
          list: ensureString(data && data.list, ""),
          history: ensureArray(data && data.history)
        };

        var textarea = document.createElement("textarea");
        textarea.rows = 6;
        textarea.placeholder = "Namn, ett per rad";
        textarea.value = state.list;
        textarea.addEventListener("input", function () {
          state.list = textarea.value;
          if (typeof onChange === "function") { onChange(); }
        });

        var drawButton = document.createElement("button");
        drawButton.type = "button";
        drawButton.textContent = "Slumpa";

        var result = createElement("div", "randomizer-result");
        var history = createElement("div", "randomizer-history");

        function renderHistory() {
          history.textContent = state.history.length ? "Redan valda: " + state.history.join(", ") : "";
        }

        drawButton.addEventListener("click", function () {
          var names = state.list.split(/\n+/);
          var clean = [];
          for (var i = 0; i < names.length; i += 1) {
            var trimmed = names[i].trim();
            if (trimmed) {
              clean.push(trimmed);
            }
          }
          if (!clean.length) {
            result.textContent = "Lägg till namn först.";
            return;
          }
          var remaining = [];
          for (var j = 0; j < clean.length; j += 1) {
            if (state.history.indexOf(clean[j]) === -1) {
              remaining.push(clean[j]);
            }
          }
          if (!remaining.length) {
            state.history = [];
            remaining = clean.slice();
          }
          var chosen = remaining[Math.floor(Math.random() * remaining.length)];
          state.history.push(chosen);
          result.textContent = chosen;
          renderHistory();
          if (typeof onChange === "function") { onChange(); }
        });

        renderHistory();
        container.appendChild(textarea);
        container.appendChild(drawButton);
        container.appendChild(result);
        container.appendChild(history);
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return { list: "", history: [] };
        }
        return { list: ensureString(state.list, ""), history: ensureArray(state.history) };
      }
    },
    "sound-level": {
      title: "Ljudnivå",
      defaults: function () {
        return { threshold: 60, running: true };
      },
      render: function (container, data, onChange) {
        var state = {
          threshold: data && typeof data.threshold === "number" ? data.threshold : 60,
          running: data && typeof data.running === "boolean" ? data.running : true,
          level: 20,
          interval: null,
          overCounter: 0
        };

        var meter = createElement("div", "sound-meter");
        var fill = document.createElement("span");
        meter.appendChild(fill);

        var status = createElement("div", "sound-status");

        var controls = createElement("div", "sound-controls");
        var thresholdInput = document.createElement("input");
        thresholdInput.type = "range";
        thresholdInput.min = "30";
        thresholdInput.max = "90";
        thresholdInput.value = String(state.threshold);
        thresholdInput.addEventListener("input", function () {
          state.threshold = parseInt(thresholdInput.value, 10);
          if (typeof onChange === "function") { onChange(); }
        });

        var toggle = document.createElement("button");
        toggle.type = "button";
        toggle.textContent = state.running ? "Pausa mätning" : "Starta mätning";
        toggle.addEventListener("click", function () {
          state.running = !state.running;
          toggle.textContent = state.running ? "Pausa mätning" : "Starta mätning";
          if (typeof onChange === "function") { onChange(); }
        });

        controls.appendChild(thresholdInput);
        controls.appendChild(toggle);

        container.appendChild(meter);
        container.appendChild(status);
        container.appendChild(controls);

        function updateUI() {
          fill.style.width = state.level + "%";
          fill.setAttribute("data-state", state.level > state.threshold ? "alert" : "calm");
          status.textContent = state.level + " dB – " + (state.level > state.threshold ? "Högt" : "OK");
        }

        function sample() {
          if (!state.running) {
            return;
          }
          state.level = Math.round(Math.random() * 90);
          updateUI();
          if (state.level > state.threshold) {
            state.overCounter += 1;
            if (state.overCounter >= 5) {
              state.overCounter = 0;
              try {
                new Audio("https://assets.mixkit.co/sfx/preview/mixkit-soft-bells-notification-987.mp3").play();
              } catch (error) {
                console.warn("Ljudnivå-ljud kunde inte spelas", error);
              }
            }
          } else {
            state.overCounter = 0;
          }
        }

        updateUI();
        state.interval = window.setInterval(sample, 1200);
        container._state = state;
        container._cleanup = function () {
          window.clearInterval(state.interval);
        };
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return { threshold: 60, running: true };
        }
        return { threshold: ensureNumber(state.threshold, 60), running: !!state.running };
      },
      destroy: function (widget) {
        var content = widget.querySelector(".widget-content");
        if (content && typeof content._cleanup === "function") {
          content._cleanup();
        }
      }
    },
    "music": {
      title: "Musikspelare",
      defaults: function () {
        var defaults = createDefaultMusicPlaylist();
        return {
          playlist: defaults,
          currentTrackId: defaults.length ? defaults[0].id : null,
          volume: 0.7
        };
      },
      render: function (container, data, onChange) {
        var playlist = normalizeMusicPlaylist(data && data.playlist);
        playlist = ensureMusicBaseTracks(playlist);

        var volume = data && typeof data.volume === "number" ? Math.min(Math.max(data.volume, 0), 1) : 0.7;

        var state = {
          playlist: playlist,
          currentTrackId: resolveMusicTrackId(data && data.currentTrackId, playlist),
          volume: volume,
          audio: null
        };

        var wrapper = createElement("div", "music-widget");
        var current = createElement("div", "music-current");
        var titleEl = createElement("div", "music-current-title");
        current.appendChild(titleEl);
        wrapper.appendChild(current);

        var audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = "auto";
        audio.className = "music-audio";
        wrapper.appendChild(audio);

        var playlistEl = document.createElement("ul");
        playlistEl.className = "music-playlist";
        wrapper.appendChild(playlistEl);

        var uploadSection = createElement("div", "music-upload");
        var uploadInput = document.createElement("input");
        uploadInput.type = "file";
        uploadInput.accept = "audio/*";
        uploadInput.multiple = true;
        uploadInput.style.display = "none";

        var uploadButton = document.createElement("button");
        uploadButton.type = "button";
        uploadButton.className = "music-upload-btn";
        uploadButton.textContent = "Ladda upp l\u00e5t";
        uploadButton.addEventListener("click", function () {
          uploadInput.value = "";
          uploadInput.click();
        });

        var uploadHint = createElement("div", "music-upload-hint");
        uploadHint.textContent = "St\u00f6djer MP3, max 4 MB per fil.";

        uploadSection.appendChild(uploadButton);
        uploadSection.appendChild(uploadHint);
        uploadSection.appendChild(uploadInput);
        wrapper.appendChild(uploadSection);

        var message = createElement("div", "music-message");
        wrapper.appendChild(message);

        container.appendChild(wrapper);

        function updateMessage(text, type) {
          if (!text) {
            message.textContent = "";
            message.removeAttribute("data-type");
            return;
          }
          message.textContent = text;
          message.setAttribute("data-type", type || "info");
        }

        function updateAudioSource(autoPlay) {
          var track = findMusicTrack(state.playlist, state.currentTrackId);
          if (!track) {
            state.currentTrackId = resolveMusicTrackId(null, state.playlist);
            track = findMusicTrack(state.playlist, state.currentTrackId);
          }
          if (!track) {
            audio.removeAttribute("src");
            titleEl.textContent = "Ingen l\u00e5t tillg\u00e4nglig";
            return;
          }
          var source = track.dataUrl || track.src;
          if (!source) {
            return;
          }
          if (audio.src !== source) {
            audio.src = source;
          }
          titleEl.textContent = track.title;
          audio.volume = state.volume;
          if (autoPlay) {
            audio.play().catch(function () { /* ignorera */ });
          }
        }

        function renderPlaylist() {
          clearChildren(playlistEl);
          for (var i = 0; i < state.playlist.length; i += 1) {
            (function (track) {
              var item = document.createElement("li");
              var button = document.createElement("button");
              button.type = "button";
              button.className = "music-track";
              if (track.id === state.currentTrackId) {
                button.setAttribute("data-active", "true");
              }
              button.textContent = track.title;
              button.addEventListener("click", function () {
                state.currentTrackId = track.id;
                if (typeof onChange === "function") { onChange(); }
                renderPlaylist();
                updateAudioSource(true);
              });
              item.appendChild(button);

              if (!track.builtIn) {
                var removeBtn = document.createElement("button");
                removeBtn.type = "button";
                removeBtn.className = "music-remove";
                removeBtn.textContent = "\u00d7";
                removeBtn.title = "Ta bort l\u00e5t";
                removeBtn.addEventListener("click", function (event) {
                  stopEvent(event);
                  removeTrack(track.id);
                });
                item.appendChild(removeBtn);
              }

              playlistEl.appendChild(item);
            })(state.playlist[i]);
          }
        }

        function removeTrack(trackId) {
          var filtered = [];
          for (var i = 0; i < state.playlist.length; i += 1) {
            if (state.playlist[i].id !== trackId) {
              filtered.push(state.playlist[i]);
            }
          }
          state.playlist = normalizeMusicPlaylist(filtered);
          state.playlist = ensureMusicBaseTracks(state.playlist);
          state.currentTrackId = resolveMusicTrackId(state.currentTrackId, state.playlist);
          renderPlaylist();
          updateAudioSource(false);
          updateMessage("L\u00e5ten har tagits bort.", "info");
          if (typeof onChange === "function") { onChange(); }
        }

        function sanitizeTitle(name) {
          var withoutExtension = name.replace(/\.[^\.]+$/, "");
          var trimmed = withoutExtension.trim();
          return trimmed || "Egen l\u00e5t";
        }

        uploadInput.addEventListener("change", function () {
          var files = uploadInput.files ? Array.prototype.slice.call(uploadInput.files) : [];
          if (!files.length) {
            return;
          }
          var index = 0;
          function processNext() {
            if (index >= files.length) {
              uploadInput.value = "";
              return;
            }
            var file = files[index];
            index += 1;
            if (file.size > MUSIC_MAX_FILE_SIZE) {
              updateMessage("Filen \"" + file.name + "\" \u00e4r f\u00f6r stor (max 4 MB).", "error");
              processNext();
              return;
            }
            var reader = new FileReader();
            reader.onload = function (event) {
              var track = {
                id: generateId("music-track"),
                title: sanitizeTitle(file.name),
                dataUrl: event.target.result,
                builtIn: false
              };
              state.playlist.push(track);
              state.playlist = normalizeMusicPlaylist(state.playlist);
              state.playlist = ensureMusicBaseTracks(state.playlist);
              state.currentTrackId = track.id;
              renderPlaylist();
              updateAudioSource(true);
              updateMessage("L\u00e5ten \"" + track.title + "\" lades till.", "info");
              if (typeof onChange === "function") { onChange(); }
              processNext();
            };
            reader.onerror = function () {
              updateMessage("Kunde inte l\u00e4sa filen \"" + file.name + "\".", "error");
              processNext();
            };
            reader.readAsDataURL(file);
          }
          processNext();
        });

        audio.addEventListener("volumechange", function () {
          state.volume = audio.volume;
          if (typeof onChange === "function") { onChange(); }
        });

        state.audio = audio;
        container._state = state;

        renderPlaylist();
        updateAudioSource(false);
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          var defaults = createDefaultMusicPlaylist();
          return {
            playlist: defaults,
            currentTrackId: defaults.length ? defaults[0].id : null,
            volume: 0.7
          };
        }
        var playlist = normalizeMusicPlaylist(state.playlist);
        playlist = ensureMusicBaseTracks(playlist);
        var serialized = [];
        for (var i = 0; i < playlist.length; i += 1) {
          var track = playlist[i];
          var entry = {
            id: track.id,
            title: track.title
          };
          if (track.builtIn) {
            entry.src = track.src;
            entry.builtIn = true;
          } else if (track.dataUrl) {
            entry.dataUrl = track.dataUrl;
            entry.builtIn = false;
          }
          serialized.push(entry);
        }
        return {
          playlist: serialized,
          currentTrackId: resolveMusicTrackId(state.currentTrackId, playlist),
          volume: ensureNumber(state.volume, 0.7)
        };
      },
      destroy: function (widget) {
        var content = widget.querySelector(".widget-content");
        if (content && content._state && content._state.audio) {
          try {
            content._state.audio.pause();
          } catch (error) { /* ignorera */ }
          content._state.audio.removeAttribute("src");
        }
      }
    },
    "image": {
      title: "Bild",
      defaults: function () {
        return { images: [] };
      },
      render: function (container, data, onChange) {
        var state = {
          images: (data && Array.isArray(data.images)) ? data.images : (data && data.url ? [{url: data.url}] : []),
          currentIndex: 0
        };

        var controls = createElement("div", "image-widget-controls");
        
        var input = document.createElement("input");
        input.type = "url";
        input.placeholder = "Webbadress till bild";
        input.className = "image-url-input";

        var addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "Lägg till";
        addButton.className = "add-image-btn";

        var libraryButton = document.createElement("button");
        libraryButton.type = "button";
        libraryButton.textContent = "📚 Välj från bibliotek";
        libraryButton.className = "library-btn";
        libraryButton.title = "Välj bilder från biblioteket (välj flera!)";

        controls.appendChild(input);
        controls.appendChild(addButton);
        controls.appendChild(libraryButton);

        var carouselContainer = createElement("div", "image-carousel");
        var imageDisplay = createElement("div", "image-display");
        var currentImage = createElement("img", "carousel-image");
        imageDisplay.appendChild(currentImage);

        var prevBtn = createElement("button", "carousel-nav prev-btn");
        prevBtn.type = "button";
        prevBtn.innerHTML = "&#8249;";
        prevBtn.title = "Föregående bild";

        var nextBtn = createElement("button", "carousel-nav next-btn");
        nextBtn.type = "button";
        nextBtn.innerHTML = "&#8250;";
        nextBtn.title = "Nästa bild";

        var fullscreenBtn = createElement("button", "fullscreen-btn");
        fullscreenBtn.type = "button";
        fullscreenBtn.innerHTML = "⛶";
        fullscreenBtn.title = "Helskärm";

        var deleteBtn = createElement("button", "delete-image-btn");
        deleteBtn.type = "button";
        deleteBtn.innerHTML = "×";
        deleteBtn.title = "Ta bort denna bild";

        var indicator = createElement("div", "image-indicator");

        imageDisplay.appendChild(deleteBtn);
        imageDisplay.appendChild(fullscreenBtn);
        carouselContainer.appendChild(prevBtn);
        carouselContainer.appendChild(imageDisplay);
        carouselContainer.appendChild(nextBtn);
        carouselContainer.appendChild(indicator);

        function updateDisplay() {
          if (state.images.length === 0) {
            currentImage.style.display = "none";
            indicator.textContent = "Inga bilder - lägg till från biblioteket!";
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
            deleteBtn.style.display = "none";
            fullscreenBtn.style.display = "none";
            return;
          }

          currentImage.style.display = "block";
          currentImage.src = state.images[state.currentIndex].url;
          indicator.textContent = (state.currentIndex + 1) + " / " + state.images.length;
          
          prevBtn.style.display = state.images.length > 1 ? "block" : "none";
          nextBtn.style.display = state.images.length > 1 ? "block" : "none";
          deleteBtn.style.display = "block";
          fullscreenBtn.style.display = "block";
        }

        function addImage(url) {
          if (!url || !url.trim()) return;
          state.images.push({ url: url.trim() });
          state.currentIndex = state.images.length - 1;
          updateDisplay();
          if (typeof onChange === "function") { onChange(); }
        }

        addButton.addEventListener("click", function() {
          addImage(input.value);
          input.value = "";
        });

        input.addEventListener("keydown", function(event) {
          if (event.key === "Enter") {
            stopEvent(event);
            addImage(input.value);
            input.value = "";
          }
        });

        libraryButton.addEventListener("click", function() {
          if (typeof mediaLibraryUI !== "undefined") {
            mediaLibraryUI.open({
              title: "Välj bilder (välj flera!)",
              allowMultiple: true,
              onSelect: function(items) {
                var itemsArray = Array.isArray(items) ? items : [items];
                itemsArray.forEach(function(item) {
                  state.images.push({ url: item.url || item.highResUrl });
                });
                state.currentIndex = state.images.length - 1;
                updateDisplay();
                if (typeof onChange === "function") { onChange(); }
              }
            });
          }
        });

        prevBtn.addEventListener("click", function() {
          if (state.currentIndex > 0) {
            state.currentIndex--;
            updateDisplay();
          }
        });

        nextBtn.addEventListener("click", function() {
          if (state.currentIndex < state.images.length - 1) {
            state.currentIndex++;
            updateDisplay();
          }
        });

        deleteBtn.addEventListener("click", function() {
          if (state.images.length > 0) {
            state.images.splice(state.currentIndex, 1);
            if (state.currentIndex >= state.images.length) {
              state.currentIndex = Math.max(0, state.images.length - 1);
            }
            updateDisplay();
            if (typeof onChange === "function") { onChange(); }
          }
        });

        fullscreenBtn.addEventListener("click", function() {
          if (state.images.length > 0) {
            var fullscreenIndex = state.currentIndex;
            var overlay = createElement("div", "fullscreen-overlay");
            var fullImg = createElement("img", "fullscreen-image");
            fullImg.src = state.images[fullscreenIndex].url;
            
            var closeBtn = createElement("button", "fullscreen-close");
            closeBtn.type = "button";
            closeBtn.innerHTML = "×";
            closeBtn.title = "Stäng helskärm (ESC)";
            
            var indicator = createElement("div", "fullscreen-indicator");
            indicator.textContent = (fullscreenIndex + 1) + " / " + state.images.length;
            
            var prevFullBtn = createElement("button", "fullscreen-nav fullscreen-prev");
            prevFullBtn.type = "button";
            prevFullBtn.innerHTML = "&#8249;";
            prevFullBtn.title = "Föregående (←)";
            
            var nextFullBtn = createElement("button", "fullscreen-nav fullscreen-next");
            nextFullBtn.type = "button";
            nextFullBtn.innerHTML = "&#8250;";
            nextFullBtn.title = "Nästa (→)";
            
            function updateFullscreenImage() {
              fullImg.src = state.images[fullscreenIndex].url;
              indicator.textContent = (fullscreenIndex + 1) + " / " + state.images.length;
              prevFullBtn.style.display = state.images.length > 1 ? "flex" : "none";
              nextFullBtn.style.display = state.images.length > 1 ? "flex" : "none";
            }
            
            overlay.appendChild(fullImg);
            overlay.appendChild(closeBtn);
            overlay.appendChild(indicator);
            overlay.appendChild(prevFullBtn);
            overlay.appendChild(nextFullBtn);
            document.body.appendChild(overlay);

            function closeFullscreen() {
              document.body.removeChild(overlay);
              document.removeEventListener("keydown", handleKey);
            }

            function handleKey(e) {
              if (e.key === "Escape") {
                closeFullscreen();
              } else if (e.key === "ArrowLeft") {
                if (fullscreenIndex > 0) {
                  fullscreenIndex--;
                  updateFullscreenImage();
                }
              } else if (e.key === "ArrowRight") {
                if (fullscreenIndex < state.images.length - 1) {
                  fullscreenIndex++;
                  updateFullscreenImage();
                }
              }
            }

            prevFullBtn.addEventListener("click", function() {
              if (fullscreenIndex > 0) {
                fullscreenIndex--;
                updateFullscreenImage();
              }
            });

            nextFullBtn.addEventListener("click", function() {
              if (fullscreenIndex < state.images.length - 1) {
                fullscreenIndex++;
                updateFullscreenImage();
              }
            });

            closeBtn.addEventListener("click", closeFullscreen);
            overlay.addEventListener("click", function(e) {
              if (e.target === overlay) closeFullscreen();
            });
            document.addEventListener("keydown", handleKey);
            updateFullscreenImage();
          }
        });

        container.appendChild(controls);
        container.appendChild(carouselContainer);
        container._state = state;
        updateDisplay();
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        return { images: state && Array.isArray(state.images) ? state.images : [] };
      }
    },
    "pace-bar": {
      title: "Lektionsprogress",
      defaults: function () {
        return { duration: 45, milestones: [25, 50, 75, 100] };
      },
      render: function (container, data, onChange) {
        var state = {
          duration: data && typeof data.duration === "number" ? data.duration : 45,
          startTime: null,
          running: false,
          interval: null
        };

        var progressBar = createElement("div", "pace-bar-track");
        var fill = createElement("div", "pace-bar-fill");
        progressBar.appendChild(fill);

        var milestones = createElement("div", "pace-bar-milestones");
        var marks = [25, 50, 75, 100];
        for (var i = 0; i < marks.length; i += 1) {
          var mark = createElement("div", "pace-bar-milestone");
          mark.style.left = marks[i] + "%";
          mark.textContent = marks[i] + "%";
          milestones.appendChild(mark);
        }
        progressBar.appendChild(milestones);

        var info = createElement("div", "pace-bar-info");

        var durationControl = createElement("div", "pace-bar-control");
        var durationLabel = document.createElement("label");
        durationLabel.textContent = "Lektionstid (min): ";
        var durationInput = document.createElement("input");
        durationInput.type = "number";
        durationInput.min = "5";
        durationInput.max = "120";
        durationInput.value = String(state.duration);
        durationLabel.appendChild(durationInput);
        durationControl.appendChild(durationLabel);

        var controls = createElement("div", "pace-bar-controls");
        var startBtn = document.createElement("button");
        startBtn.textContent = "Starta";
        startBtn.type = "button";
        var resetBtn = document.createElement("button");
        resetBtn.textContent = "Återställ";
        resetBtn.type = "button";

        controls.appendChild(startBtn);
        controls.appendChild(resetBtn);

        container.appendChild(progressBar);
        container.appendChild(info);
        container.appendChild(durationControl);
        container.appendChild(controls);

        function updateDisplay() {
          if (!state.running || !state.startTime) {
            info.textContent = "Klicka på Starta för att börja";
            fill.style.width = "0%";
            return;
          }
          var elapsed = (Date.now() - state.startTime) / 60000;
          var progress = Math.min(100, (elapsed / state.duration) * 100);
          fill.style.width = progress + "%";

          var remaining = Math.max(0, state.duration - elapsed);
          info.textContent = Math.ceil(remaining) + " min kvar";

          if (progress >= 100) {
            state.running = false;
            if (state.interval) {
              window.clearInterval(state.interval);
            }
            info.textContent = "Lektionen är slut!";
          }
        }

        durationInput.addEventListener("input", function () {
          state.duration = parseInt(durationInput.value, 10) || 45;
          if (typeof onChange === "function") { onChange(); }
        });

        startBtn.addEventListener("click", function () {
          if (!state.running) {
            state.running = true;
            state.startTime = Date.now();
            startBtn.textContent = "Pausa";
            state.interval = window.setInterval(updateDisplay, 1000);
          } else {
            state.running = false;
            startBtn.textContent = "Fortsätt";
            if (state.interval) {
              window.clearInterval(state.interval);
            }
          }
          if (typeof onChange === "function") { onChange(); }
        });

        resetBtn.addEventListener("click", function () {
          state.running = false;
          state.startTime = null;
          startBtn.textContent = "Starta";
          if (state.interval) {
            window.clearInterval(state.interval);
          }
          updateDisplay();
          if (typeof onChange === "function") { onChange(); }
        });

        updateDisplay();
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        var input = widget.querySelector("input[type='number']");
        return {
          duration: input ? parseInt(input.value, 10) : 45
        };
      },
      destroy: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (state && state.interval) {
          window.clearInterval(state.interval);
        }
      }
    },
    "group-maker": {
      title: "Gruppmakare",
      defaults: function () {
        return { names: "Anna\nBjörn\nCarla\nDavid\nEva\nFilip", groupSize: 3, groups: [] };
      },
      render: function (container, data, onChange) {
        var state = {
          names: ensureString(data && data.names, ""),
          groupSize: data && typeof data.groupSize === "number" ? data.groupSize : 3,
          groups: ensureArray(data && data.groups)
        };

        var textarea = document.createElement("textarea");
        textarea.rows = 6;
        textarea.placeholder = "Elevnamn, ett per rad";
        textarea.value = state.names;

        var sizeControl = createElement("div", "group-size-control");
        var sizeLabel = document.createElement("label");
        sizeLabel.textContent = "Gruppstorlek: ";
        var sizeInput = document.createElement("input");
        sizeInput.type = "number";
        sizeInput.min = "2";
        sizeInput.max = "10";
        sizeInput.value = String(state.groupSize);
        sizeLabel.appendChild(sizeInput);
        sizeControl.appendChild(sizeLabel);

        var generateBtn = document.createElement("button");
        generateBtn.type = "button";
        generateBtn.textContent = "Skapa grupper";

        var result = createElement("div", "group-result");

        function renderGroups() {
          clearChildren(result);
          if (!state.groups.length) {
            return;
          }
          for (var i = 0; i < state.groups.length; i += 1) {
            var groupCard = createElement("div", "group-card");
            var groupTitle = document.createElement("h4");
            groupTitle.textContent = "Grupp " + (i + 1);
            groupCard.appendChild(groupTitle);
            for (var j = 0; j < state.groups[i].length; j += 1) {
              var member = document.createElement("p");
              member.textContent = state.groups[i][j];
              groupCard.appendChild(member);
            }
            result.appendChild(groupCard);
          }
        }

        textarea.addEventListener("input", function () {
          state.names = textarea.value;
          if (typeof onChange === "function") { onChange(); }
        });

        sizeInput.addEventListener("input", function () {
          state.groupSize = parseInt(sizeInput.value, 10) || 3;
          if (typeof onChange === "function") { onChange(); }
        });

        generateBtn.addEventListener("click", function () {
          var names = state.names.split(/\n+/);
          var clean = [];
          for (var i = 0; i < names.length; i += 1) {
            var trimmed = names[i].trim();
            if (trimmed) {
              clean.push(trimmed);
            }
          }
          if (clean.length < 2) {
            result.textContent = "Lägg till minst 2 namn.";
            return;
          }

          var shuffled = clean.slice();
          for (var j = shuffled.length - 1; j > 0; j -= 1) {
            var k = Math.floor(Math.random() * (j + 1));
            var temp = shuffled[j];
            shuffled[j] = shuffled[k];
            shuffled[k] = temp;
          }

          state.groups = [];
          var groupSize = state.groupSize;
          for (var m = 0; m < shuffled.length; m += groupSize) {
            state.groups.push(shuffled.slice(m, m + groupSize));
          }

          renderGroups();
          if (typeof onChange === "function") { onChange(); }
        });

        container.appendChild(textarea);
        container.appendChild(sizeControl);
        container.appendChild(generateBtn);
        container.appendChild(result);
        renderGroups();
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return { names: "", groupSize: 3, groups: [] };
        }
        return {
          names: ensureString(state.names, ""),
          groupSize: ensureNumber(state.groupSize, 3),
          groups: ensureArray(state.groups)
        };
      }
    },
    "scoreboard": {
      title: "Poängtavla",
      defaults: function () {
        return { teams: [{ name: "Lag 1", score: 0 }, { name: "Lag 2", score: 0 }] };
      },
      render: function (container, data, onChange) {
        var state = {
          teams: ensureArray(data && data.teams)
        };
        if (!state.teams.length) {
          state.teams = [{ name: "Lag 1", score: 0 }, { name: "Lag 2", score: 0 }];
        }

        var teamsContainer = createElement("div", "scoreboard-teams");

        function renderTeams() {
          clearChildren(teamsContainer);
          for (var i = 0; i < state.teams.length; i += 1) {
            (function (index) {
              var teamCard = createElement("div", "scoreboard-team");

              var nameInput = document.createElement("input");
              nameInput.type = "text";
              nameInput.value = state.teams[index].name || ("Lag " + (index + 1));
              nameInput.addEventListener("input", function () {
                state.teams[index].name = nameInput.value;
                if (typeof onChange === "function") { onChange(); }
              });

              var scoreDisplay = createElement("div", "scoreboard-score");
              scoreDisplay.textContent = String(state.teams[index].score || 0);

              var controls = createElement("div", "scoreboard-controls");
              var plusBtn = document.createElement("button");
              plusBtn.type = "button";
              plusBtn.textContent = "+";
              plusBtn.addEventListener("click", function () {
                state.teams[index].score = (state.teams[index].score || 0) + 1;
                scoreDisplay.textContent = String(state.teams[index].score);
                if (typeof onChange === "function") { onChange(); }
              });

              var minusBtn = document.createElement("button");
              minusBtn.type = "button";
              minusBtn.textContent = "−";
              minusBtn.addEventListener("click", function () {
                state.teams[index].score = Math.max(0, (state.teams[index].score || 0) - 1);
                scoreDisplay.textContent = String(state.teams[index].score);
                if (typeof onChange === "function") { onChange(); }
              });

              controls.appendChild(minusBtn);
              controls.appendChild(plusBtn);

              teamCard.appendChild(nameInput);
              teamCard.appendChild(scoreDisplay);
              teamCard.appendChild(controls);
              teamsContainer.appendChild(teamCard);
            })(i);
          }
        }

        var addTeamBtn = document.createElement("button");
        addTeamBtn.type = "button";
        addTeamBtn.textContent = "Lägg till lag";
        addTeamBtn.addEventListener("click", function () {
          state.teams.push({ name: "Lag " + (state.teams.length + 1), score: 0 });
          renderTeams();
          if (typeof onChange === "function") { onChange(); }
        });

        var resetBtn = document.createElement("button");
        resetBtn.type = "button";
        resetBtn.textContent = "Nollställ poäng";
        resetBtn.addEventListener("click", function () {
          for (var i = 0; i < state.teams.length; i += 1) {
            state.teams[i].score = 0;
          }
          renderTeams();
          if (typeof onChange === "function") { onChange(); }
        });

        var actions = createElement("div", "scoreboard-actions");
        actions.appendChild(addTeamBtn);
        actions.appendChild(resetBtn);

        container.appendChild(teamsContainer);
        container.appendChild(actions);
        renderTeams();
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return { teams: [{ name: "Lag 1", score: 0 }] };
        }
        return { teams: ensureArray(state.teams) };
      }
    },
    "qr-code": {
      title: "QR-kod",
      defaults: function () {
        return { url: "" };
      },
      render: function (container, data, onChange) {
        var state = { url: ensureString(data && data.url, "") };

        var inputGroup = createElement("div", "qr-input-group");
        var input = document.createElement("input");
        input.type = "url";
        input.placeholder = "Ange URL eller text";
        input.value = state.url;
        inputGroup.appendChild(input);

        var generateBtn = document.createElement("button");
        generateBtn.type = "button";
        generateBtn.className = "qr-generate-btn";
        generateBtn.textContent = "Generera";
        inputGroup.appendChild(generateBtn);

        var actionRow = createElement("div", "qr-action-row");
        var copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "qr-copy-btn";
        copyBtn.textContent = "Kopiera l\u00e4nk";
        copyBtn.disabled = !state.url;
        actionRow.appendChild(copyBtn);

        var qrDisplay = createElement("div", "qr-display");
        var message = createElement("div", "qr-message");

        container.appendChild(inputGroup);
        container.appendChild(actionRow);
        container.appendChild(qrDisplay);
        container.appendChild(message);

        function setMessage(text, type) {
          if (!text) {
            message.textContent = "";
            message.removeAttribute("data-type");
            return;
          }
          message.textContent = text;
          message.setAttribute("data-type", type || "info");
        }

        function setPlaceholder(text) {
          qrDisplay.innerHTML = "";
          var placeholder = createElement("div", "qr-placeholder");
          var info = document.createElement("p");
          info.textContent = text;
          placeholder.appendChild(info);
          qrDisplay.appendChild(placeholder);
        }

        function updateCopyState(enabled) {
          copyBtn.disabled = !enabled;
          if (enabled) {
            copyBtn.removeAttribute("aria-disabled");
          } else {
            copyBtn.setAttribute("aria-disabled", "true");
          }
        }

        function buildQrUrl(value) {
          return "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + encodeURIComponent(value);
        }

        function renderQR(value) {
          qrDisplay.innerHTML = "";
          var img = document.createElement("img");
          img.alt = "QR-kod";
          img.src = buildQrUrl(value);
          var caption = createElement("p", "qr-url");
          caption.textContent = value;
          qrDisplay.appendChild(img);
          qrDisplay.appendChild(caption);
          updateCopyState(true);
        }

        function handleGenerate() {
          var value = input.value.trim();
          if (!value) {
            setPlaceholder("Ange ett inneh\u00e5ll f\u00f6r QR-koden");
            updateCopyState(false);
            state.url = "";
            setMessage("", null);
            if (typeof onChange === "function") { onChange(); }
            return;
          }
          setMessage("Genererar QR-kod...", "info");
          renderQR(value);
          state.url = value;
          if (typeof onChange === "function") { onChange(); }
          setMessage("Klar! Skanna koden med en mobilkamera.", "info");
        }

        generateBtn.addEventListener("click", handleGenerate);
        input.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            stopEvent(event);
            handleGenerate();
          }
        });

        copyBtn.addEventListener("click", function () {
          if (!state.url) {
            return;
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(state.url).then(function () {
              setMessage("L\u00e4nken kopierades till urklipp.", "info");
            }).catch(function () {
              setMessage("Kunde inte kopiera l\u00e4nken.", "error");
            });
          } else {
            try {
              var tempInput = document.createElement("input");
              tempInput.value = state.url;
              document.body.appendChild(tempInput);
              tempInput.select();
              document.execCommand("copy");
              document.body.removeChild(tempInput);
              setMessage("L\u00e4nken kopierades till urklipp.", "info");
            } catch (error) {
              setMessage("Kunde inte kopiera l\u00e4nken.", "error");
            }
          }
        });

        if (state.url) {
          renderQR(state.url);
          setMessage("Klar! Skanna koden med en mobilkamera.", "info");
        } else {
          setPlaceholder("Ange ett inneh\u00e5ll f\u00f6r QR-koden");
          updateCopyState(false);
          setMessage("", null);
        }

        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        return { url: state ? ensureString(state.url, "") : "" };
      }
    },
    "step-instruction": {
      title: "Stegvis instruktion",
      defaults: function () {
        return { 
          steps: [
            {
              title: "Läs uppgiften",
              body: "Läs igenom uppgiften noggrant. Markera nyckelord och säkerställ att du förstår målet.",
              image: "",
              imageSource: ""
            },
            {
              title: "Planera",
              body: "Gör en snabb plan: Vad behöver göras först, sedan, sist? Vem gör vad och när?",
              image: "",
              imageSource: ""
            },
            {
              title: "Genomför",
              body: "Jobba enligt planen. Stäm av halvvägs och justera vid behov. Lämna in när du är klar.",
              image: "",
              imageSource: ""
            }
          ],
          currentStep: 0,
          mode: "single",
          editMode: false,
          hideText: false
        };
      },
      render: function (container, data, onChange) {
        var state = {
          steps: ensureArray(data && data.steps).map(function(s) {
            if (typeof s === "string") {
              return { title: s, body: "", image: "", imageSource: "" };
            }
            return {
              title: ensureString(s.title, ""),
              body: ensureString(s.body, ""),
              image: ensureString(s.image, ""),
              imageSource: ensureString(s.imageSource, "")
            };
          }),
          currentStep: data && typeof data.currentStep === "number" ? data.currentStep : 0,
          mode: data && data.mode === "all" ? "all" : "single",
          editMode: data && data.editMode === true,
          hideText: data && data.hideText === true
        };
        
        if (!state.steps.length) {
          state.steps = [{ title: "Steg 1", body: "", image: "", imageSource: "" }];
        }

        var header = createElement("div", "step-instruction-header");
        
        var modeToggle = createElement("div", "step-mode-toggle");
        var singleModeBtn = createElement("button", "step-mode-btn");
        singleModeBtn.type = "button";
        singleModeBtn.innerHTML = "📋 Ett i taget";
        var allModeBtn = createElement("button", "step-mode-btn");
        allModeBtn.type = "button";
        allModeBtn.innerHTML = "🔲 Visa alla";
        modeToggle.appendChild(singleModeBtn);
        modeToggle.appendChild(allModeBtn);
        
        var controls = createElement("div", "step-header-controls");
        var editBtn = createElement("button", "step-edit-btn");
        editBtn.type = "button";
        editBtn.innerHTML = "✏️ Redigera";
        var hideTextBtn = createElement("button", "step-hidetext-btn");
        hideTextBtn.type = "button";
        hideTextBtn.innerHTML = "👁️ Dölj text";
        controls.appendChild(editBtn);
        controls.appendChild(hideTextBtn);
        
        header.appendChild(modeToggle);
        header.appendChild(controls);
        
        var progressBar = createElement("div", "step-progress-bar");
        var progressFill = createElement("div", "step-progress-fill");
        var progressLabel = createElement("div", "step-progress-label");
        progressBar.appendChild(progressFill);
        
        var mainContent = createElement("div", "step-main-content");
        
        function updateModeButtons() {
          if (state.mode === "single") {
            singleModeBtn.classList.add("active");
            allModeBtn.classList.remove("active");
          } else {
            singleModeBtn.classList.remove("active");
            allModeBtn.classList.add("active");
          }
        }
        
        function updateEditButton() {
          if (state.editMode) {
            editBtn.classList.add("active");
            editBtn.innerHTML = "✏️ Klar";
          } else {
            editBtn.classList.remove("active");
            editBtn.innerHTML = "✏️ Redigera";
          }
        }
        
        function updateHideTextButton() {
          if (state.hideText) {
            hideTextBtn.classList.add("active");
            hideTextBtn.innerHTML = "👁️ Visa text";
          } else {
            hideTextBtn.classList.remove("active");
            hideTextBtn.innerHTML = "👁️ Dölj text";
          }
        }
        
        function updateProgress() {
          var pct = ((state.currentStep + 1) / state.steps.length) * 100;
          progressFill.style.width = pct + "%";
          progressLabel.textContent = "Steg " + (state.currentStep + 1) + " av " + state.steps.length + " • " + Math.round(pct) + "%";
        }
        
        function renderSingleView() {
          mainContent.innerHTML = "";
          var step = state.steps[state.currentStep] || state.steps[0];
          
          var singleContainer = createElement("div", "step-single-view");
          
          var imageSection = createElement("div", "step-image-section");
          if (step.image) {
            var img = document.createElement("img");
            img.src = step.image;
            img.alt = step.title;
            img.className = "step-image";
            imageSection.appendChild(img);
          } else {
            var placeholder = createElement("div", "step-image-placeholder");
            placeholder.textContent = "📷";
            imageSection.appendChild(placeholder);
          }
          
          if (state.editMode) {
            var changeImageBtn = createElement("button", "step-change-image-btn");
            changeImageBtn.type = "button";
            changeImageBtn.innerHTML = "📚 Välj bild";
            changeImageBtn.addEventListener("click", function() {
              if (typeof mediaLibraryUI !== "undefined") {
                mediaLibraryUI.open({
                  title: "Välj bild eller symbol",
                  allowMultiple: false,
                  onSelect: function(item) {
                    step.image = item.url || item.highResUrl;
                    step.imageSource = item.source || "";
                    renderSingleView();
                    if (typeof onChange === "function") { onChange(); }
                  }
                });
              }
            });
            imageSection.appendChild(changeImageBtn);
          }
          
          var textSection = createElement("div", "step-text-section");
          
          var titleBox = createElement("div", "step-title-box");
          if (state.editMode) {
            var titleInput = document.createElement("input");
            titleInput.type = "text";
            titleInput.value = step.title;
            titleInput.className = "step-title-input";
            titleInput.placeholder = "Titel...";
            titleInput.addEventListener("input", function() {
              step.title = titleInput.value;
              if (typeof onChange === "function") { onChange(); }
            });
            titleBox.appendChild(titleInput);
          } else {
            var titleText = createElement("h3", "step-title-text");
            titleText.textContent = step.title;
            titleBox.appendChild(titleText);
          }
          
          var stepLabel = createElement("div", "step-label");
          stepLabel.textContent = "Steg " + (state.currentStep + 1) + " av " + state.steps.length;
          titleBox.appendChild(stepLabel);
          textSection.appendChild(titleBox);
          
          if (!state.hideText) {
            if (state.editMode) {
              var bodyTextarea = document.createElement("textarea");
              bodyTextarea.value = step.body;
              bodyTextarea.className = "step-body-textarea";
              bodyTextarea.rows = 5;
              bodyTextarea.placeholder = "Beskrivning...";
              bodyTextarea.addEventListener("input", function() {
                step.body = bodyTextarea.value;
                if (typeof onChange === "function") { onChange(); }
              });
              textSection.appendChild(bodyTextarea);
            } else {
              var bodyText = createElement("p", "step-body-text");
              bodyText.textContent = step.body;
              textSection.appendChild(bodyText);
            }
          }
          
          var navButtons = createElement("div", "step-nav-buttons");
          var prevBtn = createElement("button", "step-nav-btn");
          prevBtn.type = "button";
          prevBtn.innerHTML = "◀ Föregående";
          prevBtn.disabled = state.currentStep === 0;
          prevBtn.addEventListener("click", function() {
            if (state.currentStep > 0) {
              state.currentStep--;
              renderSingleView();
              updateProgress();
              if (typeof onChange === "function") { onChange(); }
            }
          });
          
          var nextBtn = createElement("button", "step-nav-btn step-nav-btn-primary");
          nextBtn.type = "button";
          nextBtn.innerHTML = "Nästa ▶";
          nextBtn.disabled = state.currentStep >= state.steps.length - 1;
          nextBtn.addEventListener("click", function() {
            if (state.currentStep < state.steps.length - 1) {
              state.currentStep++;
              renderSingleView();
              updateProgress();
              if (typeof onChange === "function") { onChange(); }
            }
          });
          
          navButtons.appendChild(prevBtn);
          navButtons.appendChild(nextBtn);
          textSection.appendChild(navButtons);
          
          singleContainer.appendChild(imageSection);
          singleContainer.appendChild(textSection);
          mainContent.appendChild(singleContainer);
        }
        
        function renderAllView() {
          mainContent.innerHTML = "";
          var gridContainer = createElement("div", "step-grid-view");
          
          state.steps.forEach(function(step, i) {
            var card = createElement("div", "step-card");
            
            var cardImage = createElement("div", "step-card-image");
            if (step.image) {
              var img = document.createElement("img");
              img.src = step.image;
              img.alt = step.title;
              cardImage.appendChild(img);
            } else {
              var placeholder = createElement("div", "step-card-placeholder");
              placeholder.textContent = "📷";
              cardImage.appendChild(placeholder);
            }
            
            var badge = createElement("div", "step-card-badge");
            badge.textContent = "Steg " + (i + 1);
            cardImage.appendChild(badge);
            
            if (state.editMode) {
              var changeBtn = createElement("button", "step-card-change-btn");
              changeBtn.type = "button";
              changeBtn.innerHTML = "📚";
              changeBtn.title = "Byt bild";
              changeBtn.addEventListener("click", function() {
                if (typeof mediaLibraryUI !== "undefined") {
                  mediaLibraryUI.open({
                    title: "Välj bild eller symbol",
                    allowMultiple: false,
                    onSelect: function(item) {
                      step.image = item.url || item.highResUrl;
                      step.imageSource = item.source || "";
                      renderAllView();
                      if (typeof onChange === "function") { onChange(); }
                    }
                  });
                }
              });
              cardImage.appendChild(changeBtn);
            }
            
            var cardBody = createElement("div", "step-card-body");
            var cardTitle = createElement("div", "step-card-title");
            cardTitle.textContent = step.title;
            cardBody.appendChild(cardTitle);
            
            if (!state.hideText && step.body) {
              var cardText = createElement("div", "step-card-text");
              cardText.textContent = step.body;
              cardBody.appendChild(cardText);
            }
            
            var openBtn = createElement("button", "step-card-open-btn");
            openBtn.type = "button";
            openBtn.textContent = "Öppna";
            openBtn.addEventListener("click", function() {
              state.mode = "single";
              state.currentStep = i;
              if (state.editMode) {
                state.editMode = true;
              }
              updateModeButtons();
              renderSingleView();
              updateProgress();
              progressBar.style.display = "block";
              if (typeof onChange === "function") { onChange(); }
            });
            cardBody.appendChild(openBtn);
            
            card.appendChild(cardImage);
            card.appendChild(cardBody);
            gridContainer.appendChild(card);
          });
          
          mainContent.appendChild(gridContainer);
        }
        
        function updateView() {
          if (state.mode === "single") {
            renderSingleView();
            progressBar.style.display = "block";
            updateProgress();
          } else {
            renderAllView();
            progressBar.style.display = "none";
          }
        }
        
        singleModeBtn.addEventListener("click", function() {
          state.mode = "single";
          updateModeButtons();
          updateView();
          if (typeof onChange === "function") { onChange(); }
        });
        
        allModeBtn.addEventListener("click", function() {
          state.mode = "all";
          updateModeButtons();
          updateView();
          if (typeof onChange === "function") { onChange(); }
        });
        
        editBtn.addEventListener("click", function() {
          state.editMode = !state.editMode;
          updateEditButton();
          updateView();
          if (typeof onChange === "function") { onChange(); }
        });
        
        hideTextBtn.addEventListener("click", function() {
          state.hideText = !state.hideText;
          updateHideTextButton();
          updateView();
          if (typeof onChange === "function") { onChange(); }
        });
        
        container.appendChild(header);
        container.appendChild(progressLabel);
        container.appendChild(progressBar);
        container.appendChild(mainContent);
        
        updateModeButtons();
        updateEditButton();
        updateHideTextButton();
        updateView();
        
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state || !state.steps || !state.steps.length) {
          return widgets["step-instruction"].defaults();
        }
        return {
          steps: state.steps.map(function(s) {
            return {
              title: ensureString(s.title, ""),
              body: ensureString(s.body, ""),
              image: ensureString(s.image, ""),
              imageSource: ensureString(s.imageSource, "")
            };
          }),
          currentStep: ensureNumber(state.currentStep, 0),
          mode: state.mode === "all" ? "all" : "single",
          editMode: state.editMode === true,
          hideText: state.hideText === true
        };
      }
    },
    "source-critique": {
      title: "Källkritik-kort",
      defaults: function () {
        return { currentQuestion: 0 };
      },
      render: function (container, data, onChange) {
        var questions = [
          "VEM har skapat källan? Vilka intressen kan de ha?",
          "VAD är syftet med källan? Informera, övertyga eller underhålla?",
          "NÄR publicerades källan? Är informationen aktuell?",
          "VAR publicerades källan? Är det en trovärdig plattform?",
          "HUR är källan skriven? Känslomässigt eller neutralt?",
          "VARFÖR delades källan just nu? Finns det en agenda?",
          "Kan källan verifieras? Finns det andra källor som bekräftar?",
          "Saknas viktig kontext eller information?"
        ];

        var state = {
          currentQuestion: data && typeof data.currentQuestion === "number" ? data.currentQuestion : 0
        };

        var display = createElement("div", "critique-display");
        var questionText = createElement("div", "critique-question");

        var controls = createElement("div", "critique-controls");
        var newBtn = document.createElement("button");
        newBtn.type = "button";
        newBtn.textContent = "🎲 Slumpa fråga";

        function showQuestion() {
          questionText.textContent = questions[state.currentQuestion];
        }

        newBtn.addEventListener("click", function () {
          state.currentQuestion = Math.floor(Math.random() * questions.length);
          showQuestion();
          if (typeof onChange === "function") { onChange(); }
        });

        controls.appendChild(newBtn);
        display.appendChild(questionText);

        container.appendChild(display);
        container.appendChild(controls);
        showQuestion();
        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        return { currentQuestion: state ? ensureNumber(state.currentQuestion, 0) : 0 };
      }
    },
    "hand-raise": {
      title: "Handuppräckning",
      defaults: function () {
        return { roomId: "", roomName: "Min lektion", students: [] };
      },
      render: function (container, data, onChange) {
        var state = {
          roomId: ensureString(data && data.roomId, ""),
          roomName: ensureString(data && data.roomName, "Min lektion"),
          students: ensureArray(data && data.students)
        };

        if (!state.roomId) {
          state.roomId = "room-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
        }

        var STORAGE_PREFIX = "handraise-room-";
        var roomKey = STORAGE_PREFIX + state.roomId;

        function saveToStorage() {
          try {
            var roomData = {
              id: state.roomId,
              name: state.roomName,
              students: state.students,
              createdAt: Date.now()
            };
            window.localStorage.setItem(roomKey, JSON.stringify(roomData));
            if (typeof onChange === "function") { onChange(); }
          } catch (error) {
            console.error("Kunde inte spara rum-data", error);
          }
        }

        function loadFromStorage() {
          try {
            var data = window.localStorage.getItem(roomKey);
            if (data) {
              var roomData = JSON.parse(data);
              if (Date.now() - roomData.createdAt > 24 * 60 * 60 * 1000) {
                window.localStorage.removeItem(roomKey);
                state.students = [];
              } else {
                state.students = roomData.students || [];
              }
            }
          } catch (error) {
            console.error("Kunde inte ladda rum-data", error);
          }
        }

        loadFromStorage();

        var header = createElement("div", "handraise-header");
        var roomInfo = createElement("div", "handraise-room-info");

        var nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = state.roomName;
        nameInput.placeholder = "Lektionsnamn";
        nameInput.addEventListener("input", function () {
          state.roomName = nameInput.value;
          saveToStorage();
        });

        var roomCodeDisplay = createElement("div", "handraise-room-code");
        roomCodeDisplay.innerHTML = "<strong>Rumskod:</strong> " + state.roomId.split("-").pop();

        var studentUrl = window.location.origin + window.location.pathname + "?handraise=" + state.roomId;
        var qrContainer = createElement("div", "handraise-qr");
        qrContainer.innerHTML = "<div class='handraise-qr-placeholder'><p>📱 QR-kod för elever</p><p class='handraise-url'>" + studentUrl + "</p><button type='button' class='handraise-copy-btn'>Kopiera länk</button></div>";

        var copyBtn = qrContainer.querySelector(".handraise-copy-btn");
        if (copyBtn) {
          copyBtn.addEventListener("click", function () {
            navigator.clipboard.writeText(studentUrl).then(function () {
              copyBtn.textContent = "✓ Kopierad!";
              setTimeout(function () {
                copyBtn.textContent = "Kopiera länk";
              }, 2000);
            });
          });
        }

        roomInfo.appendChild(nameInput);
        roomInfo.appendChild(roomCodeDisplay);
        header.appendChild(roomInfo);
        header.appendChild(qrContainer);

        var studentsList = createElement("div", "handraise-students-list");

        function renderStudents() {
          clearChildren(studentsList);

          var waiting = state.students.filter(function (s) { return s.status === "waiting"; });
          var helped = state.students.filter(function (s) { return s.status === "helped"; });

          if (waiting.length === 0 && helped.length === 0) {
            var empty = createElement("p", "handraise-empty");
            empty.textContent = "Inga elever har räckt upp handen än";
            studentsList.appendChild(empty);
            return;
          }

          if (waiting.length > 0) {
            var waitingSection = createElement("div", "handraise-section");
            var waitingTitle = document.createElement("h4");
            waitingTitle.textContent = "✋ Väntar (" + waiting.length + ")";
            waitingSection.appendChild(waitingTitle);

            for (var i = 0; i < waiting.length; i += 1) {
              (function (student) {
                var card = createElement("div", "handraise-student-card waiting");

                var info = createElement("div", "handraise-student-info");
                var name = document.createElement("span");
                name.className = "handraise-student-name";
                name.textContent = student.name || "Elev #" + student.token.substr(-4);

                var time = document.createElement("span");
                time.className = "handraise-student-time";
                var elapsed = Math.floor((Date.now() - student.timestamp) / 1000);
                time.textContent = elapsed + "s sedan";

                info.appendChild(name);
                info.appendChild(time);

                var helpBtn = document.createElement("button");
                helpBtn.type = "button";
                helpBtn.className = "handraise-help-btn";
                helpBtn.textContent = "✓ Hjälpt";
                helpBtn.addEventListener("click", function () {
                  student.status = "helped";
                  saveToStorage();
                  renderStudents();
                });

                card.appendChild(info);
                card.appendChild(helpBtn);
                waitingSection.appendChild(card);
              })(waiting[i]);
            }
            studentsList.appendChild(waitingSection);
          }

          if (helped.length > 0) {
            var helpedSection = createElement("div", "handraise-section");
            var helpedTitle = document.createElement("h4");
            helpedTitle.textContent = "✓ Hjälpta (" + helped.length + ")";
            helpedSection.appendChild(helpedTitle);

            for (var j = 0; j < helped.length; j += 1) {
              (function (student) {
                var card = createElement("div", "handraise-student-card helped");

                var name = document.createElement("span");
                name.className = "handraise-student-name";
                name.textContent = student.name || "Elev #" + student.token.substr(-4);

                var removeBtn = document.createElement("button");
                removeBtn.type = "button";
                removeBtn.className = "handraise-remove-btn";
                removeBtn.textContent = "×";
                removeBtn.addEventListener("click", function () {
                  state.students = state.students.filter(function (s) { return s.token !== student.token; });
                  saveToStorage();
                  renderStudents();
                });

                card.appendChild(name);
                card.appendChild(removeBtn);
                helpedSection.appendChild(card);
              })(helped[j]);
            }
            studentsList.appendChild(helpedSection);
          }
        }

        var controls = createElement("div", "handraise-controls");
        var refreshBtn = document.createElement("button");
        refreshBtn.type = "button";
        refreshBtn.textContent = "🔄 Uppdatera";
        refreshBtn.addEventListener("click", function () {
          loadFromStorage();
          renderStudents();
        });

        var clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.textContent = "🗑️ Rensa alla";
        clearBtn.addEventListener("click", function () {
          if (confirm("Är du säker på att du vill rensa alla elever?")) {
            state.students = [];
            saveToStorage();
            renderStudents();
          }
        });

        controls.appendChild(refreshBtn);
        controls.appendChild(clearBtn);

        container.appendChild(header);
        container.appendChild(studentsList);
        container.appendChild(controls);

        renderStudents();

        var updateInterval = window.setInterval(function () {
          loadFromStorage();
          renderStudents();
        }, 5000);

        container._cleanup = function () {
          window.clearInterval(updateInterval);
        };

        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return { roomId: "", roomName: "Min lektion", students: [] };
        }
        return {
          roomId: ensureString(state.roomId, ""),
          roomName: ensureString(state.roomName, "Min lektion"),
          students: ensureArray(state.students)
        };
      },
      destroy: function (widget) {
        var content = widget.querySelector(".widget-content");
        if (content && typeof content._cleanup === "function") {
          content._cleanup();
        }
      }
    },
    "youtube": {
      title: "YouTube",
      defaults: function () {
        return { videoId: "", url: "" };
      },
      render: function (container, data, onChange) {
        var state = {
          videoId: ensureString(data && data.videoId, ""),
          url: ensureString(data && data.url, "")
        };

        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Klistra in YouTube-länk eller video-ID";
        input.value = state.url || state.videoId;

        var videoContainer = createElement("div", "youtube-container");

        function extractVideoId(input) {
          var value = input.trim();
          if (!value) {
            return null;
          }

          var patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
          ];

          for (var i = 0; i < patterns.length; i += 1) {
            var match = value.match(patterns[i]);
            if (match) {
              return match[1];
            }
          }
          return null;
        }

        function loadVideo() {
          var inputValue = input.value.trim();
          if (!inputValue) {
            videoContainer.innerHTML = "<p class='youtube-placeholder'>Klistra in en YouTube-länk för att visa videon</p>";
            state.videoId = "";
            state.url = "";
            return;
          }

          var videoId = extractVideoId(inputValue);
          if (!videoId) {
            videoContainer.innerHTML = "<p class='youtube-error'>Ogiltig YouTube-länk. Använd format: https://www.youtube.com/watch?v=VIDEO_ID</p>";
            return;
          }

          state.videoId = videoId;
          state.url = inputValue;

          var iframe = document.createElement("iframe");
          iframe.src = "https://www.youtube-nocookie.com/embed/" + videoId;
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
          iframe.setAttribute("allowfullscreen", "true");
          iframe.className = "youtube-iframe";

          videoContainer.innerHTML = "";
          videoContainer.appendChild(iframe);

          if (typeof onChange === "function") { onChange(); }
        }

        var loadBtn = document.createElement("button");
        loadBtn.type = "button";
        loadBtn.textContent = "Ladda video";
        loadBtn.addEventListener("click", loadVideo);

        input.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            stopEvent(event);
            loadVideo();
          }
        });

        container.appendChild(input);
        container.appendChild(loadBtn);
        container.appendChild(videoContainer);

        if (state.videoId) {
          loadVideo();
        } else {
          videoContainer.innerHTML = "<p class='youtube-placeholder'>Klistra in en YouTube-länk för att visa videon</p>";
        }

        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return { videoId: "", url: "" };
        }
        return {
          videoId: ensureString(state.videoId, ""),
          url: ensureString(state.url, "")
        };
      }
    },
    "presentation": {
      title: "Presentation",
      defaults: function () {
        return {
          title: "Min presentation",
          currentSlide: 0,
          slides: [
            {
              id: "slide-1",
              background: { type: "color", value: "#ffffff" },
              blocks: []
            }
          ],
          media: {}
        };
      },
      render: function (container, data, onChange, widget) {
        var state = {
          title: ensureString(data && data.title, "Min presentation"),
          currentSlide: typeof data.currentSlide === "number" ? data.currentSlide : 0,
          slides: data && Array.isArray(data.slides) ? data.slides : [
            {
              id: "slide-1",
              background: { type: "color", value: "#ffffff" },
              blocks: []
            }
          ],
          media: data && data.media ? data.media : {},
          presentationMode: false
        };

        var wrapper = createElement("div", "presentation-wrapper");

        var slidesList = createElement("div", "presentation-slides-list");
        var canvas = createElement("div", "presentation-canvas");
        var toolbar = createElement("div", "presentation-toolbar");

        function renderSlidesList() {
          clearChildren(slidesList);

          var header = createElement("div", "slides-list-header");
          var titleInput = document.createElement("input");
          titleInput.type = "text";
          titleInput.className = "presentation-title-input";
          titleInput.value = state.title;
          titleInput.placeholder = "Presentation titel";
          titleInput.addEventListener("input", function () {
            state.title = titleInput.value;
            onChange();
          });
          header.appendChild(titleInput);
          slidesList.appendChild(header);

          for (var i = 0; i < state.slides.length; i += 1) {
            (function (index) {
              var slide = state.slides[index];
              var slideItem = createElement("div", "slide-list-item");
              if (index === state.currentSlide) {
                slideItem.classList.add("active");
              }

              var slideNumber = createElement("div", "slide-number");
              slideNumber.textContent = String(index + 1);

              var slidePreview = createElement("div", "slide-preview");
              slidePreview.textContent = slide.blocks.length + " block" + (slide.blocks.length !== 1 ? "s" : "");

              var slideActions = createElement("div", "slide-actions");

              var duplicateBtn = document.createElement("button");
              duplicateBtn.type = "button";
              duplicateBtn.textContent = "⧉";
              duplicateBtn.title = "Duplicera";
              duplicateBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                var newSlide = JSON.parse(JSON.stringify(slide));
                newSlide.id = "slide-" + Date.now();
                state.slides.splice(index + 1, 0, newSlide);
                state.currentSlide = index + 1;
                renderSlidesList();
                renderCanvas();
                onChange();
              });

              var deleteBtn = document.createElement("button");
              deleteBtn.type = "button";
              deleteBtn.textContent = "✕";
              deleteBtn.title = "Ta bort";
              deleteBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                if (state.slides.length > 1) {
                  state.slides.splice(index, 1);
                  if (state.currentSlide >= state.slides.length) {
                    state.currentSlide = state.slides.length - 1;
                  }
                  renderSlidesList();
                  renderCanvas();
                  onChange();
                }
              });

              slideActions.appendChild(duplicateBtn);
              slideActions.appendChild(deleteBtn);

              slideItem.appendChild(slideNumber);
              slideItem.appendChild(slidePreview);
              slideItem.appendChild(slideActions);

              slideItem.addEventListener("click", function () {
                state.currentSlide = index;
                renderSlidesList();
                renderCanvas();
              });

              slidesList.appendChild(slideItem);
            })(i);
          }

          var addSlideBtn = document.createElement("button");
          addSlideBtn.type = "button";
          addSlideBtn.className = "add-slide-btn";
          addSlideBtn.textContent = "+ Ny slide";
          addSlideBtn.addEventListener("click", function () {
            state.slides.push({
              id: "slide-" + Date.now(),
              background: { type: "color", value: "#ffffff" },
              blocks: []
            });
            state.currentSlide = state.slides.length - 1;
            renderSlidesList();
            renderCanvas();
            onChange();
          });
          slidesList.appendChild(addSlideBtn);
        }

        function renderCanvas() {
          clearChildren(canvas);

          if (state.currentSlide >= state.slides.length) {
            state.currentSlide = 0;
          }

          var slide = state.slides[state.currentSlide];

          var slideView = createElement("div", "slide-view");

          var bg = slide.background || { type: "color", value: "#ffffff" };
          if (bg.type === "color") {
            slideView.style.background = bg.value;
          }

          var blocksContainer = createElement("div", "blocks-container");

          for (var i = 0; i < slide.blocks.length; i += 1) {
            (function (blockIndex) {
              var block = slide.blocks[blockIndex];
              var blockEl = renderBlock(block, blockIndex);
              blocksContainer.appendChild(blockEl);
            })(i);
          }

          slideView.appendChild(blocksContainer);
          canvas.appendChild(slideView);

          var slideSettings = createElement("div", "slide-settings");

          var bgLabel = document.createElement("label");
          bgLabel.textContent = "Slide-bakgrund: ";
          bgLabel.className = "slide-setting-label";

          var bgColorInput = document.createElement("input");
          bgColorInput.type = "color";
          bgColorInput.className = "slide-bg-color";
          bgColorInput.value = slide.background.value || "#ffffff";
          bgColorInput.addEventListener("input", function () {
            slide.background = { type: "color", value: bgColorInput.value };
            slideView.style.background = bgColorInput.value;
            onChange();
          });

          bgLabel.appendChild(bgColorInput);
          slideSettings.appendChild(bgLabel);
          canvas.appendChild(slideSettings);

          var addBlockBtn = document.createElement("button");
          addBlockBtn.type = "button";
          addBlockBtn.className = "add-block-btn";
          addBlockBtn.textContent = "+ Lägg till block";
          addBlockBtn.addEventListener("click", function () {
            showBlockTypeMenu(addBlockBtn);
          });
          canvas.appendChild(addBlockBtn);
        }

        function renderBlock(block, blockIndex) {
          var blockEl = createElement("div", "presentation-block");
          blockEl.setAttribute("data-block-type", block.type);
          blockEl.setAttribute("data-block-index", String(blockIndex));
          blockEl.setAttribute("draggable", "true");

          blockEl.addEventListener("dragstart", function (e) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(blockIndex));
            blockEl.classList.add("dragging");
          });

          blockEl.addEventListener("dragend", function () {
            blockEl.classList.remove("dragging");
          });

          blockEl.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            blockEl.classList.add("drag-over");
          });

          blockEl.addEventListener("dragleave", function () {
            blockEl.classList.remove("drag-over");
          });

          blockEl.addEventListener("drop", function (e) {
            e.preventDefault();
            blockEl.classList.remove("drag-over");

            var fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
            var toIndex = blockIndex;

            if (fromIndex !== toIndex) {
              var slide = state.slides[state.currentSlide];
              var movedBlock = slide.blocks.splice(fromIndex, 1)[0];
              slide.blocks.splice(toIndex, 0, movedBlock);
              renderCanvas();
              onChange();
            }
          });

          var blockHeader = createElement("div", "block-header");
          var dragHandle = createElement("span", "drag-handle");
          dragHandle.textContent = "⋮⋮";
          dragHandle.title = "Dra för att ordna om";

          var blockTitle = createElement("span", "block-title");
          blockTitle.textContent = block.type === "heading" ? "Rubrik" :
                                   block.type === "text" ? "Text" :
                                   block.type === "list" ? "Lista" :
                                   block.type === "image" ? "Bild" :
                                   block.type === "youtube" ? "YouTube" : "Block";

          var blockActions = createElement("div", "block-actions");

          var deleteBlockBtn = document.createElement("button");
          deleteBlockBtn.type = "button";
          deleteBlockBtn.textContent = "✕";
          deleteBlockBtn.title = "Ta bort block";
          deleteBlockBtn.addEventListener("click", function () {
            var slide = state.slides[state.currentSlide];
            slide.blocks.splice(blockIndex, 1);
            renderCanvas();
            onChange();
          });

          blockActions.appendChild(deleteBlockBtn);
          blockHeader.appendChild(dragHandle);
          blockHeader.appendChild(blockTitle);
          blockHeader.appendChild(blockActions);
          blockEl.appendChild(blockHeader);

          var blockContent = createElement("div", "block-content");

          if (block.type === "heading") {
            var headingInput = document.createElement("input");
            headingInput.type = "text";
            headingInput.className = "heading-input";
            headingInput.value = block.content || "";
            headingInput.placeholder = "Skriv rubrik...";
            headingInput.addEventListener("input", function () {
              block.content = headingInput.value;
              onChange();
            });
            blockContent.appendChild(headingInput);

            var sizeSelect = document.createElement("select");
            sizeSelect.className = "heading-size";
            var sizes = ["S", "M", "L", "XL", "XXL"];
            for (var s = 0; s < sizes.length; s += 1) {
              var opt = document.createElement("option");
              opt.value = sizes[s];
              opt.textContent = sizes[s];
              if (block.size === sizes[s]) {
                opt.selected = true;
              }
              sizeSelect.appendChild(opt);
            }
            sizeSelect.addEventListener("change", function () {
              block.size = sizeSelect.value;
              renderCanvas();
              onChange();
            });
            blockContent.appendChild(sizeSelect);
          } else if (block.type === "text") {
            var textArea = document.createElement("textarea");
            textArea.className = "text-input";
            textArea.value = block.content || "";
            textArea.placeholder = "Skriv text...";
            textArea.rows = 4;
            textArea.addEventListener("input", function () {
              block.content = textArea.value;
              onChange();
            });
            blockContent.appendChild(textArea);
          } else if (block.type === "list") {
            var listArea = document.createElement("textarea");
            listArea.className = "list-input";
            listArea.value = Array.isArray(block.items) ? block.items.join("\n") : "";
            listArea.placeholder = "En punkt per rad...";
            listArea.rows = 6;
            listArea.addEventListener("input", function () {
              block.items = listArea.value.split("\n").filter(function (line) {
                return line.trim() !== "";
              });
              onChange();
            });
            blockContent.appendChild(listArea);

            var orderedCheckbox = document.createElement("input");
            orderedCheckbox.type = "checkbox";
            orderedCheckbox.id = "ordered-" + blockIndex;
            orderedCheckbox.checked = block.ordered || false;
            orderedCheckbox.addEventListener("change", function () {
              block.ordered = orderedCheckbox.checked;
              onChange();
            });
            var orderedLabel = document.createElement("label");
            orderedLabel.htmlFor = "ordered-" + blockIndex;
            orderedLabel.textContent = "Numrerad lista";
            blockContent.appendChild(orderedCheckbox);
            blockContent.appendChild(orderedLabel);
          } else if (block.type === "image") {
            var imageUrlInput = document.createElement("input");
            imageUrlInput.type = "text";
            imageUrlInput.className = "image-url-input";
            imageUrlInput.value = block.url || "";
            imageUrlInput.placeholder = "Bild-URL (https://...)";
            imageUrlInput.addEventListener("input", function () {
              block.url = imageUrlInput.value;
              renderCanvas();
              onChange();
            });
            blockContent.appendChild(imageUrlInput);

            var libraryBtn = document.createElement("button");
            libraryBtn.type = "button";
            libraryBtn.className = "library-btn";
            libraryBtn.textContent = "📚 Välj från bibliotek";
            libraryBtn.addEventListener("click", function () {
              if (typeof mediaLibraryUI !== "undefined") {
                mediaLibraryUI.open({
                  title: "Välj symbol",
                  onSelect: function (item) {
                    block.url = item.url || item.highResUrl;
                    imageUrlInput.value = block.url;
                    renderCanvas();
                    onChange();
                  }
                });
              }
            });
            blockContent.appendChild(libraryBtn);

            var uploadLabel = document.createElement("label");
            uploadLabel.className = "image-upload-label";
            uploadLabel.textContent = "eller ladda upp bild";

            var uploadInput = document.createElement("input");
            uploadInput.type = "file";
            uploadInput.accept = "image/*";
            uploadInput.className = "image-upload-input";
            uploadInput.addEventListener("change", function (e) {
              var file = e.target.files[0];
              if (file) {
                var reader = new FileReader();
                reader.onload = function (event) {
                  block.url = event.target.result;
                  renderCanvas();
                  onChange();
                };
                reader.readAsDataURL(file);
              }
            });

            uploadLabel.appendChild(uploadInput);
            blockContent.appendChild(uploadLabel);

            var dropZone = createElement("div", "image-drop-zone");
            dropZone.textContent = "Dra & släpp bild här";

            dropZone.addEventListener("dragover", function (e) {
              e.preventDefault();
              dropZone.classList.add("drag-active");
            });

            dropZone.addEventListener("dragleave", function () {
              dropZone.classList.remove("drag-active");
            });

            dropZone.addEventListener("drop", function (e) {
              e.preventDefault();
              dropZone.classList.remove("drag-active");

              var file = e.dataTransfer.files[0];
              if (file && file.type.startsWith("image/")) {
                var reader = new FileReader();
                reader.onload = function (event) {
                  block.url = event.target.result;
                  renderCanvas();
                  onChange();
                };
                reader.readAsDataURL(file);
              }
            });

            blockContent.appendChild(dropZone);

            if (block.url) {
              var imgPreview = document.createElement("img");
              imgPreview.src = block.url;
              imgPreview.className = "image-preview";
              imgPreview.alt = "Förhandsvisning";
              blockContent.appendChild(imgPreview);
            }
          } else if (block.type === "youtube") {
            var ytUrlInput = document.createElement("input");
            ytUrlInput.type = "text";
            ytUrlInput.className = "youtube-url-input";
            ytUrlInput.value = block.url || "";
            ytUrlInput.placeholder = "YouTube-URL eller video-ID";
            ytUrlInput.addEventListener("input", function () {
              block.url = ytUrlInput.value;
              block.videoId = extractYouTubeId(ytUrlInput.value);
              onChange();
            });
            blockContent.appendChild(ytUrlInput);
          }

          blockEl.appendChild(blockContent);
          return blockEl;
        }

        function showBlockTypeMenu(triggerBtn) {
          var menu = createElement("div", "block-type-menu");

          var types = [
            { type: "heading", label: "Rubrik" },
            { type: "text", label: "Text" },
            { type: "list", label: "Lista" },
            { type: "image", label: "Bild" },
            { type: "youtube", label: "YouTube" }
          ];

          for (var t = 0; t < types.length; t += 1) {
            (function (typeObj) {
              var item = createElement("div", "block-type-item");
              item.textContent = typeObj.label;
              item.addEventListener("click", function () {
                addBlock(typeObj.type);
                menu.remove();
              });
              menu.appendChild(item);
            })(types[t]);
          }

          var rect = triggerBtn.getBoundingClientRect();
          menu.style.position = "absolute";
          menu.style.top = rect.bottom + "px";
          menu.style.left = rect.left + "px";
          document.body.appendChild(menu);

          var closeMenu = function (e) {
            if (!menu.contains(e.target) && e.target !== triggerBtn) {
              menu.remove();
              document.removeEventListener("click", closeMenu);
            }
          };
          setTimeout(function () {
            document.addEventListener("click", closeMenu);
          }, 0);
        }

        function addBlock(type) {
          var slide = state.slides[state.currentSlide];
          var newBlock = { id: "block-" + Date.now(), type: type };

          if (type === "heading") {
            newBlock.content = "";
            newBlock.size = "L";
          } else if (type === "text") {
            newBlock.content = "";
          } else if (type === "list") {
            newBlock.items = [];
            newBlock.ordered = false;
          } else if (type === "image") {
            newBlock.url = "";
          } else if (type === "youtube") {
            newBlock.url = "";
            newBlock.videoId = "";
          }

          slide.blocks.push(newBlock);
          renderCanvas();
          onChange();
        }

        function extractYouTubeId(input) {
          var value = input.trim();
          if (!value) {
            return "";
          }
          var patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
          ];
          for (var p = 0; p < patterns.length; p += 1) {
            var match = value.match(patterns[p]);
            if (match) {
              return match[1];
            }
          }
          return "";
        }

        function renderToolbar() {
          clearChildren(toolbar);

          var maximizeBtn = document.createElement("button");
          maximizeBtn.type = "button";
          maximizeBtn.className = "maximize-widget-btn";
          maximizeBtn.textContent = "⛶";
          maximizeBtn.title = "Maximera widget";
          maximizeBtn.addEventListener("click", function () {
            toggleMaximizeWidget();
          });

          var presentBtn = document.createElement("button");
          presentBtn.type = "button";
          presentBtn.className = "present-btn";
          presentBtn.textContent = "▶ Presentera";
          presentBtn.addEventListener("click", function () {
            enterPresentationMode();
          });

          toolbar.appendChild(maximizeBtn);
          toolbar.appendChild(presentBtn);
        }

        function toggleMaximizeWidget() {
          if (widget.hasAttribute("data-maximized")) {
            widget.removeAttribute("data-maximized");
          } else {
            widget.setAttribute("data-maximized", "true");
          }
        }

        function enterPresentationMode() {
          state.presentationMode = true;
          wrapper.classList.add("presentation-mode");
          renderPresentationView();
        }

        function exitPresentationMode() {
          state.presentationMode = false;
          wrapper.classList.remove("presentation-mode");

          clearChildren(wrapper);

          wrapper.appendChild(slidesList);
          wrapper.appendChild(canvas);
          wrapper.appendChild(toolbar);

          renderSlidesList();
          renderCanvas();
          renderToolbar();
        }

        function renderPresentationView() {
          clearChildren(wrapper);

          var presentView = createElement("div", "presentation-view");
          var slide = state.slides[state.currentSlide];

          var bg = slide.background || { type: "color", value: "#ffffff" };
          if (bg.type === "color") {
            presentView.style.background = bg.value;
          }

          var slideContent = createElement("div", "presentation-slide-content");

          for (var i = 0; i < slide.blocks.length; i += 1) {
            var block = slide.blocks[i];
            var blockEl = createElement("div", "present-block");
            blockEl.setAttribute("data-type", block.type);

            if (block.type === "heading") {
              var h = document.createElement("h1");
              h.textContent = block.content || "";
              h.className = "present-heading";
              if (block.size) {
                h.setAttribute("data-size", block.size.toLowerCase());
              }
              blockEl.appendChild(h);
            } else if (block.type === "text") {
              var p = document.createElement("p");
              p.textContent = block.content || "";
              p.className = "present-text";
              blockEl.appendChild(p);
            } else if (block.type === "list") {
              var listTag = block.ordered ? "ol" : "ul";
              var list = document.createElement(listTag);
              list.className = "present-list";
              if (Array.isArray(block.items)) {
                for (var j = 0; j < block.items.length; j += 1) {
                  var li = document.createElement("li");
                  li.textContent = block.items[j];
                  list.appendChild(li);
                }
              }
              blockEl.appendChild(list);
            } else if (block.type === "image" && block.url) {
              var img = document.createElement("img");
              img.src = block.url;
              img.className = "present-image";
              img.alt = "";
              blockEl.appendChild(img);
            } else if (block.type === "youtube" && block.videoId) {
              var iframe = document.createElement("iframe");
              iframe.src = "https://www.youtube-nocookie.com/embed/" + block.videoId;
              iframe.className = "present-youtube";
              iframe.setAttribute("frameborder", "0");
              iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
              iframe.setAttribute("allowfullscreen", "");
              blockEl.appendChild(iframe);
            }

            slideContent.appendChild(blockEl);
          }

          presentView.appendChild(slideContent);

          var presentControls = createElement("div", "presentation-controls");
          var slideCounter = createElement("div", "slide-counter");
          slideCounter.textContent = (state.currentSlide + 1) + " / " + state.slides.length;

          var prevBtn = document.createElement("button");
          prevBtn.type = "button";
          prevBtn.textContent = "←";
          prevBtn.addEventListener("click", function () {
            if (state.currentSlide > 0) {
              state.currentSlide -= 1;
              renderPresentationView();
              if (typeof onChange === "function") { onChange(); }
            }
          });

          var nextBtn = document.createElement("button");
          nextBtn.type = "button";
          nextBtn.textContent = "→";
          nextBtn.addEventListener("click", function () {
            if (state.currentSlide < state.slides.length - 1) {
              state.currentSlide += 1;
              renderPresentationView();
              if (typeof onChange === "function") { onChange(); }
            }
          });

          var exitBtn = document.createElement("button");
          exitBtn.type = "button";
          exitBtn.textContent = "✕ Avsluta";
          exitBtn.addEventListener("click", function () {
            exitPresentationMode();
          });

          presentControls.appendChild(prevBtn);
          presentControls.appendChild(slideCounter);
          presentControls.appendChild(nextBtn);
          presentControls.appendChild(exitBtn);

          presentView.appendChild(presentControls);

          var helpOverlay = createElement("div", "presentation-help-overlay");
          var helpContent = createElement("div", "presentation-help-content");

          var helpTitle = document.createElement("div");
          helpTitle.className = "help-title";
          helpTitle.textContent = "Tangentbordsgenvägar";

          var helpList = document.createElement("ul");
          helpList.className = "help-list";

          var shortcuts = [
            { key: "←/→", desc: "Navigera mellan slides" },
            { key: "ESC", desc: "Avsluta presentation" }
          ];

          for (var s = 0; s < shortcuts.length; s += 1) {
            var li = document.createElement("li");
            var keySpan = document.createElement("span");
            keySpan.className = "help-key";
            keySpan.textContent = shortcuts[s].key;
            li.appendChild(keySpan);
            li.appendChild(document.createTextNode(" " + shortcuts[s].desc));
            helpList.appendChild(li);
          }

          var closeHelpBtn = document.createElement("button");
          closeHelpBtn.type = "button";
          closeHelpBtn.className = "close-help-btn";
          closeHelpBtn.textContent = "✕";
          closeHelpBtn.addEventListener("click", function () {
            helpOverlay.style.display = "none";
          });

          helpContent.appendChild(closeHelpBtn);
          helpContent.appendChild(helpTitle);
          helpContent.appendChild(helpList);
          helpOverlay.appendChild(helpContent);

          presentView.appendChild(helpOverlay);
          wrapper.appendChild(presentView);

          var keyHandler = function (e) {
            if (e.key === "ArrowLeft" && state.currentSlide > 0) {
              state.currentSlide -= 1;
              renderPresentationView();
              if (typeof onChange === "function") { onChange(); }
            } else if (e.key === "ArrowRight" && state.currentSlide < state.slides.length - 1) {
              state.currentSlide += 1;
              renderPresentationView();
              if (typeof onChange === "function") { onChange(); }
            } else if (e.key === "Escape") {
              exitPresentationMode();
              document.removeEventListener("keydown", keyHandler);
            }
          };
          document.addEventListener("keydown", keyHandler);

          wrapper._keyHandler = keyHandler;
        }

        renderSlidesList();
        renderCanvas();
        renderToolbar();

        wrapper.appendChild(slidesList);
        wrapper.appendChild(canvas);
        wrapper.appendChild(toolbar);
        container.appendChild(wrapper);

        var editKeyHandler = function (e) {
          if (state.presentationMode) {
            return;
          }

          if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
            e.preventDefault();
            if (state.currentSlide > 0) {
              state.currentSlide -= 1;
              renderSlidesList();
              renderCanvas();
              if (typeof onChange === "function") { onChange(); }
            }
          } else if ((e.ctrlKey || e.metaKey) && e.key === "ArrowRight") {
            e.preventDefault();
            if (state.currentSlide < state.slides.length - 1) {
              state.currentSlide += 1;
              renderSlidesList();
              renderCanvas();
              if (typeof onChange === "function") { onChange(); }
            }
          } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
            e.preventDefault();
            var slide = state.slides[state.currentSlide];
            var newSlide = JSON.parse(JSON.stringify(slide));
            newSlide.id = "slide-" + Date.now();
            state.slides.splice(state.currentSlide + 1, 0, newSlide);
            state.currentSlide = state.currentSlide + 1;
            renderSlidesList();
            renderCanvas();
            onChange();
          } else if (e.key === "Delete" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (state.slides.length > 1) {
              state.slides.splice(state.currentSlide, 1);
              if (state.currentSlide >= state.slides.length) {
                state.currentSlide = state.slides.length - 1;
              }
              renderSlidesList();
              renderCanvas();
              onChange();
            }
          }
        };

        document.addEventListener("keydown", editKeyHandler);
        wrapper._editKeyHandler = editKeyHandler;

        container._state = state;
      },
      save: function (widget) {
        var content = widget.querySelector(".widget-content");
        var state = content && content._state;
        if (!state) {
          return {
            title: "Min presentation",
            currentSlide: 0,
            slides: [
              {
                id: "slide-1",
                background: { type: "color", value: "#ffffff" },
                blocks: []
              }
            ],
            media: {}
          };
        }
        return {
          title: ensureString(state.title, "Min presentation"),
          currentSlide: typeof state.currentSlide === "number" ? state.currentSlide : 0,
          slides: state.slides || [],
          media: state.media || {}
        };
      },
      destroy: function (widget) {
        var wrapper = widget.querySelector(".presentation-wrapper");
        if (wrapper && wrapper._keyHandler) {
          document.removeEventListener("keydown", wrapper._keyHandler);
        }
        if (wrapper && wrapper._editKeyHandler) {
          document.removeEventListener("keydown", wrapper._editKeyHandler);
        }
      }
    }
  };
  function WidgetManager(layer) {
    this.layer = layer;
    this.widgets = {};
    this.nextId = 0;
    this.dragState = null;
    this.restore();
  }

  WidgetManager.prototype.createWidget = function (type, data, position, size, minimized, fontSize, fontOverride, syncId, viewerControlEnabledParam) {
    var config = widgetFactory[type];
    if (!config) {
      console.warn("Okänd widgettyp:", type);
      return null;
    }

    var widget = document.createElement("article");
    widget.className = "widget";
    widget.setAttribute("data-type", type);
    this.nextId += 1;
    var id = String(this.nextId);
    widget.setAttribute("data-id", id);
    var resolvedSyncId = typeof syncId === "string" && syncId ? syncId : generateId("widget");
    widget.setAttribute("data-sync-id", resolvedSyncId);
    var viewerControlEnabled = typeof viewerControlEnabledParam === "boolean" ? viewerControlEnabledParam : true;
    widget.setAttribute("data-viewer-control", viewerControlEnabled ? "enabled" : "disabled");
    widget.setAttribute("data-font-size", fontSize || globalFontSize || "normal");
    if (fontOverride) {
      widget.setAttribute("data-font-override", "true");
    }

    var header = document.createElement("header");
    var title = document.createElement("h3");
    title.textContent = config.title;
    header.appendChild(title);

    var actions = createElement("div", "widget-actions");

    var minimizeButton = document.createElement("button");
    minimizeButton.type = "button";
    minimizeButton.title = "Minimera";
    minimizeButton.className = "widget-minimize-btn";
    minimizeButton.textContent = "-";

    var viewerControlButton = document.createElement("button");
    viewerControlButton.type = "button";
    viewerControlButton.className = "widget-viewer-control-btn";
    viewerControlButton.setAttribute("data-enabled", viewerControlEnabled ? "true" : "false");
    viewerControlButton.innerHTML = '<span class="icon">👥</span>';
    viewerControlButton.title = viewerControlEnabled ? "Elevstyrning på - Elever kan styra denna widget" : "Elevstyrning av - Endast lärare kan styra";

    var duplicateButton = document.createElement("button");
    duplicateButton.type = "button";
    duplicateButton.title = "Duplicera";
    duplicateButton.textContent = "⧉";

    var removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.title = "Ta bort";
    removeButton.textContent = "✕";

    var managerRef = this;
    var content = null;
    var viewerLockOverlay = null;

    function setViewerControlState(enabled, options) {
      var normalized = !!enabled;
      var entry = managerRef.widgets[id];
      viewerControlEnabled = normalized;
      widget.setAttribute("data-viewer-control", viewerControlEnabled ? "enabled" : "disabled");
      if (viewerControlButton) {
        viewerControlButton.setAttribute("data-enabled", viewerControlEnabled ? "true" : "false");
        viewerControlButton.innerHTML = '<span class="icon">👥</span>';
        viewerControlButton.title = viewerControlEnabled ? "Elevstyrning på - Elever kan styra denna widget" : "Elevstyrning av - Endast lärare kan styra";
        if (window.isViewerMode) {
          viewerControlButton.style.display = "none";
        }
      }
      // Don't show lock overlay - just disable interactivity
      // Students should be able to SEE the content, just not interact
      if (viewerLockOverlay) {
        viewerLockOverlay.style.display = "none";
      }
      // Update interactivity (disable buttons/inputs when locked)
      updateViewerInteractivity(widget, viewerControlEnabled);
      
      if (entry) {
        entry.viewerControlEnabled = viewerControlEnabled;
      }
      if (options && options.broadcast && entry && entry.syncId) {
        broadcastWidgetControlState(entry.syncId, entry.type, viewerControlEnabled);
      }
      if (options && options.persist) {
        managerRef.persist({ reason: "viewer-control" });
      } else if (!options || !options.skipPersist) {
        managerRef.persist();
      }
    }

    minimizeButton.addEventListener("click", function (event) {
      stopEvent(event);
      var isMinimized = widget.getAttribute("data-minimized") === "true";
      if (isMinimized) {
        widget.removeAttribute("data-minimized");
        minimizeButton.textContent = "−";
        minimizeButton.title = "Minimera";
      } else {
        widget.setAttribute("data-minimized", "true");
        minimizeButton.textContent = "□";
        minimizeButton.title = "Maximera";
      }
      managerRef.persist();
    });

    viewerControlButton.addEventListener("click", function (event) {
      stopEvent(event);
      if (window.isViewerMode) {
        return;
      }
      setViewerControlState(!viewerControlEnabled, { broadcast: true, persist: true });
    });

    duplicateButton.addEventListener("click", function (event) {
      stopEvent(event);
      managerRef.duplicate(id);
    });

    removeButton.addEventListener("click", function (event) {
      stopEvent(event);
      managerRef.remove(id);
    });

    actions.appendChild(viewerControlButton);
    actions.appendChild(minimizeButton);
    actions.appendChild(duplicateButton);
    actions.appendChild(removeButton);
    header.appendChild(actions);
    widget.appendChild(header);

    content = createElement("div", "widget-content");
    widget.appendChild(content);

    var resizeHandle = createElement("div", "resize-handle");
    widget.appendChild(resizeHandle);

    this.layer.appendChild(widget);

    var initialData = (data !== undefined && data !== null)
      ? data
      : (typeof config.defaults === "function" ? config.defaults() : null);

    var handleChange = function () {
      managerRef.persist();
    };

    config.render(content, initialData, handleChange, widget);

    viewerLockOverlay = createElement("div", "widget-viewer-lock");
    viewerLockOverlay.innerHTML = '<div class="viewer-lock-content"><span class="viewer-lock-icon">&#x1F512;</span><span class="viewer-lock-text">Styrs av l\u00e4raren</span></div>';
    content.appendChild(viewerLockOverlay);
    widget._viewerOverlay = viewerLockOverlay;
    widget._setViewerControlState = setViewerControlState;
    setViewerControlState(viewerControlEnabled, { force: true, skipPersist: true });

    var bounds = this.layer.getBoundingClientRect();
    var defaultPosition = position || {
      left: Math.round(bounds.width / 2 - widget.offsetWidth / 2 + Math.random() * 40 - 20),
      top: Math.round(bounds.height / 3 + Math.random() * 40 - 20)
    };

    widget.style.left = Math.max(20, defaultPosition.left) + "px";
    widget.style.top = Math.max(80, defaultPosition.top) + "px";

    if (size) {
      if (size.width) {
        widget.style.width = size.width + "px";
      }
      if (size.height) {
        widget.style.height = size.height + "px";
      }
    }

    if (minimized) {
      widget.setAttribute("data-minimized", "true");
      var minBtn = widget.querySelector(".widget-minimize-btn");
      if (minBtn) {
        minBtn.textContent = "□";
        minBtn.title = "Maximera";
      }
    }

    this.makeDraggable(widget);
    this.makeResizable(widget);

    this.widgets[id] = {
      syncId: resolvedSyncId,
      type: type,
      viewerControlEnabled: viewerControlEnabled,
      save: typeof config.save === "function" ? config.save : function () { return null; },
      destroy: typeof config.destroy === "function" ? config.destroy : function () {}
    };

    this.persist();
    return widget;
  };

  WidgetManager.prototype.duplicate = function (id) {
    var entry = this.widgets[id];
    var origin = this.layer.querySelector('.widget[data-id="' + id + '"]');
    if (!entry || !origin) {
      return;
    }
    var data = entry.save(origin);
    var rect = origin.getBoundingClientRect();
    var parentRect = this.layer.getBoundingClientRect();
    var position = {
      left: rect.left - parentRect.left + 24,
      top: rect.top - parentRect.top + 24
    };
    var size = null;
    if (origin.style.width) {
      size = {
        width: parseInt(origin.style.width, 10),
        height: parseInt(origin.style.height, 10)
      };
    }
    var minimized = origin.getAttribute("data-minimized") === "true";
    var fontSize = origin.getAttribute("data-font-size");
    var fontOverride = origin.getAttribute("data-font-override") === "true";
    this.createWidget(entry.type, data, position, size, minimized, fontSize, fontOverride, null, entry.viewerControlEnabled);
  };

  WidgetManager.prototype.remove = function (id) {
    var widget = this.layer.querySelector('.widget[data-id="' + id + '"]');
    var entry = this.widgets[id];
    if (!widget) {
      return;
    }
    if (entry && typeof entry.destroy === "function") {
      entry.destroy(widget);
    }
    widget.remove();
    delete this.widgets[id];
    this.persist();
  };

  WidgetManager.prototype.makeDraggable = function (widget) {
    var handle = widget.querySelector("header");
    if (!handle) {
      return;
    }
    var managerRef = this;

    handle.style.cursor = "move";
    handle.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) {
        return;
      }
      // Check if clicked on a button or inside a button
      if (event.target.tagName === "BUTTON" || event.target.closest("button")) {
        return;
      }
      managerRef.dragState = {
        id: widget.getAttribute("data-id"),
        offsetX: event.clientX - widget.offsetLeft,
        offsetY: event.clientY - widget.offsetTop
      };
      widget.setPointerCapture(event.pointerId);
    });

    widget.addEventListener("pointermove", function (event) {
      if (!managerRef.dragState || managerRef.dragState.id !== widget.getAttribute("data-id")) {
        return;
      }
      var left = event.clientX - managerRef.dragState.offsetX;
      var top = event.clientY - managerRef.dragState.offsetY;
      widget.style.left = Math.max(12, left) + "px";
      widget.style.top = Math.max(20, top) + "px";
    });

    widget.addEventListener("pointerup", function () {
      if (!managerRef.dragState || managerRef.dragState.id !== widget.getAttribute("data-id")) {
        return;
      }
      managerRef.dragState = null;
      
      // Viewers can drag for temporary organization, but don't save position
      if (!window.isViewerMode) {
        managerRef.persist();
      }
    });
  };

  WidgetManager.prototype.makeResizable = function (widget) {
    var resizeHandle = widget.querySelector(".resize-handle");
    if (!resizeHandle) {
      return;
    }
    var managerRef = this;
    var resizeState = null;

    resizeHandle.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) {
        return;
      }
      stopEvent(event);

      resizeState = {
        id: widget.getAttribute("data-id"),
        startX: event.clientX,
        startY: event.clientY,
        startWidth: widget.offsetWidth,
        startHeight: widget.offsetHeight
      };

      widget.setPointerCapture(event.pointerId);
    });

    widget.addEventListener("pointermove", function (event) {
      if (!resizeState || resizeState.id !== widget.getAttribute("data-id")) {
        return;
      }

      var deltaX = event.clientX - resizeState.startX;
      var deltaY = event.clientY - resizeState.startY;

      var newWidth = Math.max(220, resizeState.startWidth + deltaX);
      var newHeight = Math.max(150, resizeState.startHeight + deltaY);

      widget.style.width = newWidth + "px";
      widget.style.height = newHeight + "px";
    });

    widget.addEventListener("pointerup", function (event) {
      if (!resizeState || resizeState.id !== widget.getAttribute("data-id")) {
        return;
      }
      resizeState = null;
      
      // Viewers can resize for temporary organization, but don't save size
      if (!window.isViewerMode) {
        managerRef.persist();
      }
    });
  };
  WidgetManager.prototype.persist = function () {
    if (!canUseStorage) {
      return;
    }
    var snapshot = [];
    var widgets = this.layer.querySelectorAll(".widget");
    for (var i = 0; i < widgets.length; i += 1) {
      var widget = widgets[i];
      var entry = this.widgets[widget.getAttribute("data-id")];
      if (!entry) {
        continue;
      }
      var widgetData = {
        type: entry.type,
        position: {
          left: parseInt(widget.style.left, 10) || 20,
          top: parseInt(widget.style.top, 10) || 20
        },
        data: entry.save(widget)
      };

      if (widget.style.width) {
        widgetData.size = {
          width: parseInt(widget.style.width, 10),
          height: parseInt(widget.style.height, 10)
        };
      }

      if (widget.getAttribute("data-minimized") === "true") {
        widgetData.minimized = true;
      }

      var fontSize = widget.getAttribute("data-font-size");
      if (fontSize) {
        widgetData.fontSize = fontSize;
      }

      var fontOverride = widget.getAttribute("data-font-override");
      if (fontOverride === "true") {
        widgetData.fontOverride = true;
      }

      var syncId = entry && entry.syncId ? entry.syncId : widget.getAttribute("data-sync-id");
      if (syncId) {
        widgetData.syncId = syncId;
      }
      widgetData.viewerControlEnabled = entry && entry.viewerControlEnabled === true;

      snapshot.push(widgetData);
    }

    var state = {
      background: currentBackground,
      widgets: snapshot
    };

    try {
      if (currentScreenId) {
        saveScreen(currentScreenId, state);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }

      // Broadcast to students if room is active
      if (!window.isViewerMode && liveSyncClient) {
        try {
          if (liveSyncClient.isConnected) {
            console.log("Broadcasting widget changes via LiveSync");
            liveSyncClient.sendWidgetsSync();
          } else {
            // Mark that there are pending changes to broadcast when connected
            console.log("LiveSync not connected yet, marking pending broadcast");
            liveSyncClient.pendingBroadcast = true;
          }
        } catch (broadcastError) {
          console.warn("Could not broadcast widgets", broadcastError);
        }
      }
    } catch (error) {
      console.error("Kunde inte spara state", error);
    }
  };

  WidgetManager.prototype.restore = function () {
    if (!canUseStorage) {
      return;
    }
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Kunde inte läsa state", error);
    }
    if (!raw) {
      return;
    }
    try {
      var state = JSON.parse(raw);
      if (state.background) {
        setBackground(state.background, { skipPersist: true, skipHighlight: true });
      }
      if (state.widgets && state.widgets.length) {
        for (var i = 0; i < state.widgets.length; i += 1) {
          var item = state.widgets[i];
          this.createWidget(item.type, item.data, item.position, item.size, item.minimized, item.fontSize, item.fontOverride, item.syncId, item.viewerControlEnabled);
        }
      }
    } catch (error) {
      console.error("Kunde inte tolka sparat state", error);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (removeError) {
        console.error("Kunde inte rensa state", removeError);
      }
    }
  };
  function getAllScreens() {
    if (!canUseStorage) {
      return [];
    }
    try {
      var data = window.localStorage.getItem(SCREENS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Kunde inte läsa screens", error);
      return [];
    }
  }

  function saveScreen(id, state) {
    if (!canUseStorage) {
      return;
    }
    var screens = getAllScreens();
    var index = -1;
    for (var i = 0; i < screens.length; i += 1) {
      if (screens[i].id === id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      screens[index].state = state;
      screens[index].updatedAt = new Date().toISOString();
    }
    try {
      window.localStorage.setItem(SCREENS_KEY, JSON.stringify(screens));
    } catch (error) {
      console.error("Kunde inte spara screen", error);
    }
  }

  function createScreen(name) {
    if (!canUseStorage) {
      return null;
    }
    var screens = getAllScreens();
    var id = "screen-" + Date.now();
    var newScreen = {
      id: id,
      name: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: {
        background: currentBackground,
        widgets: []
      }
    };
    screens.push(newScreen);
    try {
      window.localStorage.setItem(SCREENS_KEY, JSON.stringify(screens));
      return newScreen;
    } catch (error) {
      console.error("Kunde inte skapa screen", error);
      return null;
    }
  }

  function deleteScreen(id) {
    if (!canUseStorage) {
      return;
    }
    var screens = getAllScreens();
    var filtered = [];
    for (var i = 0; i < screens.length; i += 1) {
      if (screens[i].id !== id) {
        filtered.push(screens[i]);
      }
    }
    try {
      window.localStorage.setItem(SCREENS_KEY, JSON.stringify(filtered));
      if (currentScreenId === id) {
        currentScreenId = null;
        window.localStorage.removeItem(CURRENT_SCREEN_KEY);
      }
    } catch (error) {
      console.error("Kunde inte ta bort screen", error);
    }
  }

  function loadScreen(id) {
    var screens = getAllScreens();
    for (var i = 0; i < screens.length; i += 1) {
      if (screens[i].id === id) {
        currentScreenId = id;
        try {
          window.localStorage.setItem(CURRENT_SCREEN_KEY, id);
        } catch (error) {
          console.error("Kunde inte spara aktuell screen", error);
        }
        clearAllWidgets();
        var state = screens[i].state;
        if (state.background) {
          setBackground(state.background, { skipPersist: true, skipHighlight: true });
        }
        if (state.widgets && state.widgets.length) {
          for (var j = 0; j < state.widgets.length; j += 1) {
            var item = state.widgets[j];
            manager.createWidget(item.type, item.data, item.position, item.size, item.minimized, item.fontSize, item.fontOverride, item.syncId, item.viewerControlEnabled);
          }
        }
        return;
      }
    }
  }

  function clearAllWidgets() {
    var widgets = widgetLayer.querySelectorAll(".widget");
    for (var i = 0; i < widgets.length; i += 1) {
      var widget = widgets[i];
      var id = widget.getAttribute("data-id");
      var entry = manager.widgets[id];
      if (entry && typeof entry.destroy === "function") {
        entry.destroy(widget);
      }
      widget.remove();
      delete manager.widgets[id];
    }
  }

  function setBackground(url, options) {
    currentBackground = url;
    backgroundOverlay.style.backgroundImage = 'url("' + url + '")';
    var opts = options || {};
    if (!opts.skipHighlight) {
      highlightActiveBackground();
    }
    if (!opts.skipPersist && manager) {
      manager.persist();
    }
  }

  function highlightActiveBackground() {
    if (!backgroundGrid) {
      return;
    }
    var buttons = backgroundGrid.querySelectorAll(".background-thumb");
    for (var i = 0; i < buttons.length; i += 1) {
      var button = buttons[i];
      button.removeAttribute("data-active");
      var wrapper = button.parentNode;
      if (wrapper && wrapper.classList) {
        wrapper.removeAttribute("data-active");
      }
      var img = button.querySelector("img");
      if (img && img.src === currentBackground) {
        button.setAttribute("data-active", "true");
        if (wrapper && wrapper.classList) {
          wrapper.setAttribute("data-active", "true");
        }
      }
    }
  }

  function initBackgroundPicker() {
    if (!backgroundGrid) {
      return;
    }
    initBackgroundControls();
    renderBackgroundGrid();
  }

  function initMoreMenu() {
    if (!moreGrid) {
      return;
    }
    clearChildren(moreGrid);
    if (!moreWidgets.length) {
      var info = document.createElement("p");
      info.textContent = "Fler widgets är på väg!";
      moreGrid.appendChild(info);
      return;
    }
    for (var i = 0; i < moreWidgets.length; i += 1) {
      var type = moreWidgets[i];
      var config = widgetFactory[type];
      if (!config) {
        continue;
      }
      (function (widgetType) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "toolbar-button";

        var icon = document.createElement("span");
        icon.className = "icon";
        icon.textContent = widgetIcons[widgetType] || "📦";

        var label = document.createElement("span");
        label.className = "label";
        label.textContent = config.title;

        button.appendChild(icon);
        button.appendChild(label);

        button.addEventListener("click", function () {
          if (manager) {
            manager.createWidget(widgetType);
          }
          if (moreDialog && typeof moreDialog.close === "function") {
            moreDialog.close();
          }
        });
        moreGrid.appendChild(button);
      })(type);
    }
  }

  function findToolbarButton(node) {
    while (node && node !== toolbar) {
      if (node.getAttribute && node.getAttribute("data-widget")) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  function getWidgetIcon(type) {
    if (type === "background") return "🎨";
    if (type === "poll") return "📊";
    if (type === "randomizer") return "🎲";
    if (type === "sound-level") return "🔊";
    if (type === "music") return "🎵";
    if (type === "image") return "🖼️";
    if (type === "text") return "📝";
    if (type === "work-sym") return "💬";
    if (type === "traffic-light") return "🚦";
    if (type === "timetable") return "🗓️";
    if (type === "timer") return "⏳";
    if (type === "clock") return "🕓";
    return widgetIcons[type] || "📦";
  }

  function getWidgetName(type) {
    if (widgetNamesSwedish[type]) {
      return widgetNamesSwedish[type];
    }
    if (widgetFactory[type] && widgetFactory[type].title) {
      return widgetFactory[type].title;
    }
    return type;
  }

  function openLauncher() {
    if (!launcherOverlay) return;
    launcherOverlay.style.display = "flex";
    if (launcherSearchInput) {
      setTimeout(function() {
        launcherSearchInput.focus();
      }, 100);
    }
    renderLauncherGrid("");
    renderLauncherQuickAccess();
  }

  function closeLauncher() {
    if (!launcherOverlay) return;
    launcherOverlay.style.display = "none";
    if (launcherSearchInput) {
      launcherSearchInput.value = "";
    }
  }

  function addToRecent(type) {
    launcherRecentWidgets = launcherRecentWidgets.filter(function(t) { return t !== type; });
    launcherRecentWidgets.unshift(type);
    if (launcherRecentWidgets.length > 5) {
      launcherRecentWidgets = launcherRecentWidgets.slice(0, 5);
    }
  }

  function launchWidget(type) {
    if (type === "background") {
      closeLauncher();
      if (backgroundDialog && typeof backgroundDialog.showModal === "function") {
        backgroundDialog.showModal();
      }
      return;
    }
    
    if (manager) {
      manager.createWidget(type);
      addToRecent(type);
    }
    closeLauncher();
  }

  function renderLauncherQuickAccess() {
    if (!launcherFavorites || !launcherRecent) return;

    clearChildren(launcherFavorites);
    for (var i = 0; i < launcherFavoriteWidgets.length; i++) {
      var type = launcherFavoriteWidgets[i];
      (function(widgetType) {
        var chip = document.createElement("button");
        chip.className = "launcher-chip";
        chip.textContent = getWidgetName(widgetType);
        chip.addEventListener("click", function() {
          launchWidget(widgetType);
        });
        launcherFavorites.appendChild(chip);
      })(type);
    }

    clearChildren(launcherRecent);
    if (launcherRecentWidgets.length === 0) {
      var emptyMsg = document.createElement("p");
      emptyMsg.textContent = "— Inget ännu";
      emptyMsg.style.fontSize = "13px";
      emptyMsg.style.color = "rgba(0, 0, 0, 0.5)";
      launcherRecent.appendChild(emptyMsg);
    } else {
      for (var j = 0; j < launcherRecentWidgets.length; j++) {
        var recentType = launcherRecentWidgets[j];
        (function(widgetType) {
          var chip = document.createElement("button");
          chip.className = "launcher-chip";
          chip.textContent = getWidgetName(widgetType);
          chip.addEventListener("click", function() {
            launchWidget(widgetType);
          });
          launcherRecent.appendChild(chip);
        })(recentType);
      }
    }
  }

  function renderLauncherGrid(query) {
    if (!launcherGrid) return;

    clearChildren(launcherGrid);
    var allWidgets = ["background"].concat(primaryWidgets).concat(moreWidgets);
    var lowerQuery = query.toLowerCase();

    for (var i = 0; i < allWidgets.length; i++) {
      var type = allWidgets[i];
      var name = getWidgetName(type);
      
      if (query && name.toLowerCase().indexOf(lowerQuery) === -1) {
        continue;
      }

      (function(widgetType, widgetName) {
        var card = document.createElement("button");
        card.className = "launcher-widget-card";

        var iconDiv = document.createElement("div");
        iconDiv.className = "launcher-widget-icon";
        iconDiv.textContent = getWidgetIcon(widgetType);

        var labelDiv = document.createElement("div");
        labelDiv.className = "launcher-widget-label";
        labelDiv.textContent = widgetName;

        var hintDiv = document.createElement("div");
        hintDiv.className = "launcher-widget-hint";
        hintDiv.textContent = "Klicka för att lägga till";

        card.appendChild(iconDiv);
        card.appendChild(labelDiv);
        card.appendChild(hintDiv);

        card.addEventListener("click", function() {
          launchWidget(widgetType);
        });

        launcherGrid.appendChild(card);
      })(type, name);
    }
  }

  function initToolbar() {
    if (!toolbar) {
      return;
    }
    toolbar.addEventListener("click", function (event) {
      var button = findToolbarButton(event.target);
      if (!button) {
        return;
      }
      var type = button.getAttribute("data-widget");
      if (type === "background") {
        if (backgroundDialog && typeof backgroundDialog.showModal === "function") {
          backgroundDialog.showModal();
        }
        return;
      }
      if (type === "more") {
        if (moreDialog && typeof moreDialog.showModal === "function") {
          moreDialog.showModal();
        }
        return;
      }
      if (manager) {
        manager.createWidget(type);
        addToRecent(type);
      }
    });

    if (dockMoreButton) {
      dockMoreButton.addEventListener("click", function() {
        openLauncher();
      });
    }

    if (launcherBackdrop) {
      launcherBackdrop.addEventListener("click", function() {
        closeLauncher();
      });
    }

    if (launcherCloseBtn) {
      launcherCloseBtn.addEventListener("click", function() {
        closeLauncher();
      });
    }

    if (launcherSearchInput) {
      launcherSearchInput.addEventListener("input", function() {
        renderLauncherGrid(launcherSearchInput.value);
      });
    }

    document.addEventListener("keydown", function(e) {
      var isModK = (e.key.toLowerCase() === "k") && (e.metaKey || e.ctrlKey);
      if (isModK) {
        e.preventDefault();
        openLauncher();
      }
      if (e.key === "Escape" && launcherOverlay && launcherOverlay.style.display === "flex") {
        closeLauncher();
      }
    });
  }

  function applyFooterCollapsedState(options) {
    options = options || {};
    if (appShell) {
      if (footerCollapsed) {
        appShell.classList.add("footer-collapsed");
      } else {
        appShell.classList.remove("footer-collapsed");
      }
    }
    if (footerToggleBtn) {
      var icon = footerToggleBtn.querySelector(".status-toggle-icon");
      var label = footerToggleBtn.querySelector(".status-toggle-text");
      var expanded = !footerCollapsed;
      footerToggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      footerToggleBtn.setAttribute("title", expanded ? "Dölj verktygsfält" : "Visa verktygsfält");
      if (icon) {
        icon.textContent = footerCollapsed ? "\u25B2" : "\u25BC";
      }
      if (label) {
        label.textContent = footerCollapsed ? "Visa" : "Dölj";
      }
    }
    if (!options.skipPersist && canUseStorage) {
      try {
        window.localStorage.setItem(FOOTER_COLLAPSED_KEY, footerCollapsed ? "true" : "false");
      } catch (error) {
        console.warn("Kunde inte spara footer-l&auml;ge", error);
      }
    }
  }

  function initStatusBar() {
    if (!statusClock || !statusDate) {
      return;
    }
    function update() {
      var now = new Date();
      statusClock.textContent = now.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
      statusDate.textContent = now.toLocaleDateString("sv-SE");
    }
    update();
    window.setInterval(update, 30000);

    if (footerToggleBtn) {
      if (canUseStorage) {
        try {
          var stored = window.localStorage.getItem(FOOTER_COLLAPSED_KEY);
          if (stored === "true") {
            footerCollapsed = true;
          }
        } catch (error) {
          console.warn("Kunde inte l&auml;sa footer-l&auml;ge", error);
        }
      }
      applyFooterCollapsedState({ skipPersist: true });
      footerToggleBtn.addEventListener("click", function () {
        footerCollapsed = !footerCollapsed;
        applyFooterCollapsedState();
      });
    } else {
      footerCollapsed = false;
      applyFooterCollapsedState({ skipPersist: true });
    }
  }

  function initAdminDialog() {
    adminDialog = document.getElementById("adminDialog");
    if (!adminDialog) {
      return;
    }

    var createBtn = document.getElementById("createScreenBtn");
    var nameInput = document.getElementById("newScreenName");
    var screensList = document.getElementById("screensList");

    if (createBtn && nameInput) {
      createBtn.addEventListener("click", function () {
        var name = nameInput.value.trim();
        if (!name) {
          alert("Ange ett namn för screenen");
          return;
        }
        var screen = createScreen(name);
        if (screen) {
          nameInput.value = "";
          renderScreensList();
        }
      });
    }

    function renderScreensList() {
      if (!screensList) {
        return;
      }
      clearChildren(screensList);
      var screens = getAllScreens();

      if (screens.length === 0) {
        var emptyMsg = document.createElement("p");
        emptyMsg.className = "empty-message";
        emptyMsg.textContent = "Inga screens skapade ännu. Skapa din första screen ovan!";
        screensList.appendChild(emptyMsg);
        return;
      }

      for (var i = 0; i < screens.length; i += 1) {
        (function (screen) {
          var card = document.createElement("div");
          card.className = "screen-card";
          if (screen.id === currentScreenId) {
            card.setAttribute("data-active", "true");
          }

          var info = document.createElement("div");
          info.className = "screen-info";

          var name = document.createElement("h4");
          name.textContent = screen.name;

          var meta = document.createElement("p");
          meta.className = "screen-meta";
          var widgetCount = screen.state && screen.state.widgets ? screen.state.widgets.length : 0;
          meta.textContent = widgetCount + " widgets";

          info.appendChild(name);
          info.appendChild(meta);

          var actions = document.createElement("div");
          actions.className = "screen-actions";

          var loadBtn = document.createElement("button");
          loadBtn.type = "button";
          loadBtn.className = "screen-button load";
          loadBtn.textContent = "Ladda";
          loadBtn.addEventListener("click", function () {
            loadScreen(screen.id);
            renderScreensList();
            if (adminDialog && typeof adminDialog.close === "function") {
              adminDialog.close();
            }
          });

          var deleteBtn = document.createElement("button");
          deleteBtn.type = "button";
          deleteBtn.className = "screen-button delete";
          deleteBtn.textContent = "Ta bort";
          deleteBtn.addEventListener("click", function () {
            if (confirm("Är du säker på att du vill ta bort '" + screen.name + "'?")) {
              deleteScreen(screen.id);
              renderScreensList();
            }
          });

          actions.appendChild(loadBtn);
          actions.appendChild(deleteBtn);

          card.appendChild(info);
          card.appendChild(actions);
          screensList.appendChild(card);
        })(screens[i]);
      }
    }

    renderScreensList();
  }

  function toggleFullscreen() {
    var doc = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen();
      } else if (doc.webkitRequestFullscreen) {
        doc.webkitRequestFullscreen();
      } else if (doc.mozRequestFullScreen) {
        doc.mozRequestFullScreen();
      } else if (doc.msRequestFullscreen) {
        doc.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  function toggleWidgets() {
    widgetsVisible = !widgetsVisible;
    if (widgetsVisible) {
      widgetLayer.classList.remove("widgets-hidden");
    } else {
      widgetLayer.classList.add("widgets-hidden");
    }
  }

  function toggleUI() {
    uiVisible = !uiVisible;
    var appShell = document.querySelector(".app-shell");
    if (!appShell) {
      return;
    }
    if (uiVisible) {
      appShell.classList.remove("ui-hidden");
    } else {
      appShell.classList.add("ui-hidden");
    }
  }

  var FONT_SIZE_KEY = "global-font-size";
  var globalFontSize = window.localStorage.getItem(FONT_SIZE_KEY) || "normal";

  function applyGlobalFontSize() {
    var widgets = document.querySelectorAll(".widget");
    for (var i = 0; i < widgets.length; i += 1) {
      var widget = widgets[i];
      var hasCustomOverride = widget.getAttribute("data-font-override") === "true";
      if (!hasCustomOverride) {
        widget.setAttribute("data-font-size", globalFontSize);
      }
    }
  }

  function toggleGlobalFontSize() {
    if (globalFontSize === "normal") {
      globalFontSize = "large";
    } else if (globalFontSize === "large") {
      globalFontSize = "xlarge";
    } else {
      globalFontSize = "normal";
    }
    window.localStorage.setItem(FONT_SIZE_KEY, globalFontSize);
    applyGlobalFontSize();
  }

  function initWidgetContextMenu() {
    var contextMenu = document.getElementById("widgetContextMenu");
    if (!contextMenu) {
      return;
    }

    var currentWidget = null;

    document.addEventListener("contextmenu", function (event) {
      var widget = event.target.closest(".widget");
      if (!widget) {
        contextMenu.style.display = "none";
        return;
      }

      event.preventDefault();
      currentWidget = widget;

      contextMenu.style.display = "block";
      contextMenu.style.left = event.pageX + "px";
      contextMenu.style.top = event.pageY + "px";
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".context-menu")) {
        contextMenu.style.display = "none";
      }
    });

    contextMenu.addEventListener("click", function (event) {
      var item = event.target.closest(".context-menu-item");
      if (!item || !currentWidget) {
        return;
      }

      var action = item.getAttribute("data-action");
      if (action === "font-normal") {
        currentWidget.setAttribute("data-font-size", "normal");
        currentWidget.setAttribute("data-font-override", "true");
      } else if (action === "font-large") {
        currentWidget.setAttribute("data-font-size", "large");
        currentWidget.setAttribute("data-font-override", "true");
      } else if (action === "font-xlarge") {
        currentWidget.setAttribute("data-font-size", "xlarge");
        currentWidget.setAttribute("data-font-override", "true");
      } else if (action === "font-reset") {
        currentWidget.removeAttribute("data-font-override");
        currentWidget.setAttribute("data-font-size", globalFontSize);
      }

      contextMenu.style.display = "none";
      saveState();
    });
  }

  function autoArrangeWidgets() {
    if (!manager) {
      return;
    }

    var widgets = widgetLayer.querySelectorAll(".widget:not([data-minimized='true'])");
    if (widgets.length === 0) {
      return;
    }

    var workspaceBounds = widgetLayer.getBoundingClientRect();
    var availableWidth = workspaceBounds.width;
    var availableHeight = workspaceBounds.height;

    var padding = 20;
    var columnCount = Math.min(widgets.length, Math.ceil(Math.sqrt(widgets.length)));
    var rowCount = Math.ceil(widgets.length / columnCount);

    var widgetWidth = (availableWidth - (padding * (columnCount + 1))) / columnCount;
    var widgetHeight = (availableHeight - (padding * (rowCount + 1))) / rowCount;

    var maxWidgetHeight = availableHeight - 180;
    if (widgetHeight > maxWidgetHeight) {
      widgetHeight = maxWidgetHeight;
    }

    var minWidth = 280;
    var minHeight = 200;
    if (widgetWidth < minWidth) {
      widgetWidth = minWidth;
      columnCount = Math.floor((availableWidth - padding) / (widgetWidth + padding));
      rowCount = Math.ceil(widgets.length / columnCount);
    }

    var currentRow = 0;
    var currentCol = 0;

    for (var i = 0; i < widgets.length; i += 1) {
      var widget = widgets[i];

      var x = padding + (currentCol * (widgetWidth + padding));
      var y = padding + 80 + (currentRow * (widgetHeight + padding));

      widget.style.left = Math.round(x) + "px";
      widget.style.top = Math.round(y) + "px";
      widget.style.width = Math.round(widgetWidth) + "px";
      widget.style.height = Math.round(widgetHeight) + "px";

      currentCol += 1;
      if (currentCol >= columnCount) {
        currentCol = 0;
        currentRow += 1;
      }
    }

    if (manager) {
      manager.persist();
    }
  }

  function initHeaderActions() {
    var header = document.querySelector(".app-header");
    var headerDrawer = document.getElementById("headerDrawer");

    if (!header) {
      return;
    }

    // Initialize drawer as hidden
    if (headerDrawer) {
      headerDrawer.setAttribute("aria-hidden", "true");
    }

    // Initialize symbol library as hidden
    var symbolOverlay = document.getElementById("symbolLibraryOverlay");
    if (symbolOverlay) {
      symbolOverlay.setAttribute("aria-hidden", "true");

      // Close symbol library when clicking outside
      symbolOverlay.addEventListener("click", function (event) {
        if (event.target === symbolOverlay) {
          symbolOverlay.setAttribute("aria-hidden", "true");
        }
      });
    }

    // Toggle menu function
    function toggleMenu() {
      if (!headerDrawer) {
        return;
      }
      var isHidden = headerDrawer.getAttribute("aria-hidden") === "true";
      headerDrawer.setAttribute("aria-hidden", isHidden ? "false" : "true");
    }

    // Close menu function
    function closeMenu() {
      if (headerDrawer) {
        headerDrawer.setAttribute("aria-hidden", "true");
      }
    }

    // Handle clicks on action buttons (both in header and drawer)
    function handleActionClick(event) {
      var button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }
      var action = button.getAttribute("data-action");

      if (action === "toggle-menu") {
        toggleMenu();
        return;
      }
      if (action === "close-menu") {
        closeMenu();
        return;
      }
      if (action === "auto-arrange") {
        autoArrangeWidgets();
        closeMenu();
        return;
      }
      if (action === "home") {
        // Go to home screen (clear current screen)
        currentScreenId = null;
        try {
          window.localStorage.removeItem(CURRENT_SCREEN_KEY);
        } catch (error) {
          console.error("Could not clear current screen", error);
        }
        window.location.reload();
        return;
      }
      if (action === "font-size") {
        toggleGlobalFontSize();
        closeMenu();
        return;
      }
      if (action === "fullscreen") {
        toggleFullscreen();
        closeMenu();
        return;
      }
      if (action === "toggle-widgets") {
        toggleWidgets();
        closeMenu();
        return;
      }
      if (action === "toggle-ui") {
        toggleUI();
        closeMenu();
        return;
      }
      if (action === "library") {
        // Open symbol library
        var symbolOverlay = document.getElementById("symbolLibraryOverlay");
        if (symbolOverlay) {
          symbolOverlay.setAttribute("aria-hidden", "false");
        }
        closeMenu();
        return;
      }
      if (action === "open-symbol-library") {
        var symbolOverlay = document.getElementById("symbolLibraryOverlay");
        if (symbolOverlay) {
          symbolOverlay.setAttribute("aria-hidden", "false");
        }
        closeMenu();
        return;
      }
      if (action === "close-symbol-library") {
        var symbolOverlay = document.getElementById("symbolLibraryOverlay");
        if (symbolOverlay) {
          symbolOverlay.setAttribute("aria-hidden", "true");
        }
        return;
      }
      if (action === "settings") {
        // Settings functionality (could open a settings dialog)
        alert("Inställningar kommer snart!");
        closeMenu();
        return;
      }
      if (action === "room-control") {
        if (roomDialog && typeof roomDialog.showModal === "function") {
          roomDialog.showModal();
        }
        return;
      }
      if (action === "admin") {
        closeMenu();
        if (adminDialog && typeof adminDialog.showModal === "function") {
          adminDialog.showModal();
          var screensList = document.getElementById("screensList");
          if (screensList) {
            clearChildren(screensList);
            var screens = getAllScreens();
            if (screens.length === 0) {
              var emptyMsg = document.createElement("p");
              emptyMsg.className = "empty-message";
              emptyMsg.textContent = "Inga screens skapade ännu. Skapa din första screen ovan!";
              screensList.appendChild(emptyMsg);
            } else {
              for (var i = 0; i < screens.length; i += 1) {
                (function (screen) {
                  var card = document.createElement("div");
                  card.className = "screen-card";
                  if (screen.id === currentScreenId) {
                    card.setAttribute("data-active", "true");
                  }

                  var info = document.createElement("div");
                  info.className = "screen-info";

                  var name = document.createElement("h4");
                  name.textContent = screen.name;

                  var meta = document.createElement("p");
                  meta.className = "screen-meta";
                  var widgetCount = screen.state && screen.state.widgets ? screen.state.widgets.length : 0;
                  meta.textContent = widgetCount + " widgets";

                  info.appendChild(name);
                  info.appendChild(meta);

                  var actions = document.createElement("div");
                  actions.className = "screen-actions";

                  var loadBtn = document.createElement("button");
                  loadBtn.type = "button";
                  loadBtn.className = "screen-button load";
                  loadBtn.textContent = "Ladda";
                  loadBtn.addEventListener("click", function () {
                    loadScreen(screen.id);
                    if (adminDialog && typeof adminDialog.close === "function") {
                      adminDialog.close();
                    }
                  });

                  var deleteBtn = document.createElement("button");
                  deleteBtn.type = "button";
                  deleteBtn.className = "screen-button delete";
                  deleteBtn.textContent = "Ta bort";
                  deleteBtn.addEventListener("click", function () {
                    if (confirm("Är du säker på att du vill ta bort '" + screen.name + "'?")) {
                      deleteScreen(screen.id);
                      if (adminDialog && typeof adminDialog.showModal === "function") {
                        adminDialog.showModal();
                      }
                    }
                  });

                  actions.appendChild(loadBtn);
                  actions.appendChild(deleteBtn);

                  card.appendChild(info);
                  card.appendChild(actions);
                  screensList.appendChild(card);
                })(screens[i]);
              }
            }
          }
        }
      }
    }

    // Attach event listeners to both header and drawer
    header.addEventListener("click", handleActionClick);
    if (headerDrawer) {
      headerDrawer.addEventListener("click", handleActionClick);
    }

    // Close menu when clicking on backdrop
    if (headerDrawer) {
      headerDrawer.addEventListener("click", function (event) {
        // Check if the click was on the backdrop (not on the drawer itself)
        if (event.target.classList.contains("header-drawer-backdrop")) {
          closeMenu();
        }
      });

      // Close menu on Escape key
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && headerDrawer.getAttribute("aria-hidden") === "false") {
          closeMenu();
        }
      });
    }
  }

  function initUIToggleFab() {
    var fab = document.getElementById("uiToggleFab");
    if (!fab) {
      return;
    }
    fab.addEventListener("click", function () {
      toggleUI();
    });
  }

  // ============================================================================
  // LIVE SYNC CLIENT - WebSocket-based cross-device synchronization
  // ============================================================================

  /**
   * Get the active room code from localStorage
   * @returns {string|null} Room code or null if no active room
   */
  function getActiveRoomCode() {
    try {
      var roomData = window.localStorage.getItem("classroomscreen-active-room-v1");
      if (roomData) {
        var room = JSON.parse(roomData);
        return room.code || null;
      }
    } catch (error) {
      console.warn("Could not get active room code", error);
    }
    return null;
  }

  /**
   * Student management helpers
   */
  function addStudentToRoom(studentId, studentName) {
    try {
      var studentsData = window.localStorage.getItem("classroomscreen-room-students-v1");
      var students = studentsData ? JSON.parse(studentsData) : [];
      
      // Check if student already exists
      var exists = false;
      for (var i = 0; i < students.length; i += 1) {
        if (students[i].id === studentId) {
          exists = true;
          break;
        }
      }
      
      if (!exists) {
        students.push({
          id: studentId,
          name: studentName || ("Elev " + (students.length + 1)),
          joinedAt: new Date().toISOString(),
          handRaised: false
        });
        window.localStorage.setItem("classroomscreen-room-students-v1", JSON.stringify(students));
        console.log("Added student to room:", studentName || studentId);
      }
    } catch (error) {
      console.error("Could not add student to room", error);
    }
  }

  function removeStudentFromRoomById(studentId) {
    try {
      var studentsData = window.localStorage.getItem("classroomscreen-room-students-v1");
      var students = studentsData ? JSON.parse(studentsData) : [];
      var filtered = [];
      for (var i = 0; i < students.length; i += 1) {
        if (students[i] && students[i].id !== studentId) {
          filtered.push(students[i]);
        }
      }
      window.localStorage.setItem("classroomscreen-room-students-v1", JSON.stringify(filtered));
      console.log("Removed student from room:", studentId);
    } catch (error) {
      console.error("Could not remove student from room", error);
    }
  }

  function updateStudentHandRaise(studentId, raised) {
    try {
      var studentsData = window.localStorage.getItem("classroomscreen-room-students-v1");
      var students = studentsData ? JSON.parse(studentsData) : [];
      
      for (var i = 0; i < students.length; i += 1) {
        if (students[i] && students[i].id === studentId) {
          students[i].handRaised = raised;
          break;
        }
      }
      
      window.localStorage.setItem("classroomscreen-room-students-v1", JSON.stringify(students));
      console.log("Updated hand raise for student:", studentId, raised);
    } catch (error) {
      console.error("Could not update hand raise", error);
    }
  }

  /**
   * LiveSyncClient - Manages WebSocket connection for real-time room synchronization
   */
  function LiveSyncClient() {
    var self = this;
    this.ws = null;
    this.roomCode = null;
    this.role = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
    this.isConnected = false;
    this.pendingBroadcast = false; // Flag to broadcast widgets when connected

    /**
     * Connect to WebSocket server and join a room
     * @param {string} roomCode - Room code to join
     * @param {string} role - 'host' or 'viewer'
     * @param {object} meta - Additional metadata (studentId, studentName)
     */
    this.connect = function(roomCode, role, meta) {
      if (self.isConnecting || (self.isConnected && self.roomCode === roomCode)) {
        console.log("Already connecting or connected to room:", roomCode);
        return;
      }

      self.roomCode = roomCode;
      self.role = role;
      self.isConnecting = true;

      var wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      var wsHost = window.location.host;
      var wsUrl = wsProtocol + '//' + wsHost;

      console.log("Connecting to WebSocket:", wsUrl, "Room:", roomCode, "Role:", role);

      try {
        self.ws = new WebSocket(wsUrl);

        self.ws.onopen = function() {
          console.log("WebSocket connected");
          self.isConnecting = false;
          self.isConnected = true;
          self.reconnectAttempts = 0;

          // Send JOIN message
          self.send({
            type: 'join',
            roomCode: roomCode,
            role: role,
            studentId: meta && meta.studentId || null,
            studentName: meta && meta.studentName || null
          });
        };

        self.ws.onmessage = function(event) {
          try {
            var data = JSON.parse(event.data);
            self.handleMessage(data);
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        };

        self.ws.onerror = function(error) {
          console.error("WebSocket error:", error);
          self.isConnecting = false;
          self.isConnected = false;
        };

        self.ws.onclose = function() {
          console.log("WebSocket closed");
          self.isConnecting = false;
          self.isConnected = false;

          // Attempt reconnection with backoff
          if (self.reconnectAttempts < self.maxReconnectAttempts) {
            self.reconnectAttempts++;
            var delay = self.reconnectDelay * Math.pow(2, self.reconnectAttempts - 1);
            console.log("Reconnecting in " + delay + "ms (attempt " + self.reconnectAttempts + ")");
            setTimeout(function() {
              self.connect(roomCode, role, meta);
            }, delay);
          } else {
            console.error("Max reconnection attempts reached");
          }
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        self.isConnecting = false;
        self.isConnected = false;
      }
    };

    /**
     * Disconnect from WebSocket
     */
    this.disconnect = function() {
      self.reconnectAttempts = self.maxReconnectAttempts;
      if (self.ws) {
        self.ws.close();
        self.ws = null;
      }
      self.isConnected = false;
      self.isConnecting = false;
      self.roomCode = null;
      self.role = null;
    };

    /**
     * Send message to WebSocket server
     * @param {object} data - Message data
     */
    this.send = function(data) {
      if (!self.ws || self.ws.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket not connected, cannot send:", data.type);
        return false;
      }

      try {
        // Automatically attach roomCode and role to all messages (except join)
        var payload = data;
        if (data.type !== 'join' && self.roomCode) {
          payload = Object.assign({}, data, {
            roomCode: self.roomCode,
            role: self.role
          });
        }
        self.ws.send(JSON.stringify(payload));
        return true;
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        return false;
      }
    };

    /**
     * Handle incoming WebSocket messages
     * @param {object} data - Parsed message data
     */
    this.handleMessage = function(data) {
      console.log("WebSocket message received:", data.type, data);

      switch (data.type) {
        case 'joined':
          console.log("Successfully joined room as " + data.role);
          if (data.role === 'viewer') {
            // Request initial sync from host
            self.send({ type: 'sync-request' });
          } else if (data.role === 'host') {
            // Host joined - send initial widget snapshot to any connected viewers
            console.log("Host joined, broadcasting initial widget state");
            self.sendWidgetsSync();
            
            // Also broadcast if there were pending changes during connection
            if (self.pendingBroadcast) {
              console.log("Flushing pending broadcast");
              self.sendWidgetsSync();
              self.pendingBroadcast = false;
            }
          }
          break;

        case 'error':
          console.error("Server error:", data.message);
          break;

        case 'host-online':
          console.log("Host is online");
          // Request sync when host comes online
          if (self.role === 'viewer') {
            self.send({ type: 'sync-request' });
          }
          break;

        case 'host-offline':
          console.log("Host is offline");
          break;

        case 'viewer-joined':
          console.log("Viewer joined:", data.studentName || data.studentId);
          // Add student to room
          if (data.studentId) {
            addStudentToRoom(data.studentId, data.studentName);
            if (window.updateStudentListGlobal) {
              window.updateStudentListGlobal();
            }
          }
          break;

        case 'viewer-left':
          console.log("Viewer left:", data.studentName || data.studentId);
          // Remove student from room
          if (data.studentId) {
            removeStudentFromRoomById(data.studentId);
            if (window.updateStudentListGlobal) {
              window.updateStudentListGlobal();
            }
          }
          break;

        case 'sync-request':
          // Host: Send full snapshot to requester
          if (self.role === 'host' && manager) {
            self.sendWidgetsSync();
          }
          break;

        case 'widget-control':
          // Apply widget control state change
          if (window.updateWidgetFromSync) {
            window.updateWidgetFromSync(data.widgetId, data.widgetType, { 
              controlEnabled: data.controlEnabled 
            });
          }
          break;

        case 'widget-update':
          // Apply widget state update
          if (window.updateWidgetFromSync) {
            window.updateWidgetFromSync(data.widgetId, data.widgetType, data.payload);
          }
          break;

        case 'widgets-sync':
          // Sync all widgets
          if (window.syncAllWidgets) {
            window.syncAllWidgets(data);
          }
          break;

        case 'screen-change':
          // Load new screen
          if (window.loadScreen && data.screenId) {
            window.loadScreen(data.screenId);
          }
          break;

        case 'layout-reset':
          // Reset layout
          if (window.resetViewerLayoutState) {
            window.resetViewerLayoutState();
          }
          break;

        case 'hand-raise':
          // Handle hand raise from viewer
          console.log("Hand raise from student:", data.studentName, data.raised);
          if (data.studentId) {
            updateStudentHandRaise(data.studentId, data.raised);
            if (window.updateStudentListGlobal) {
              window.updateStudentListGlobal();
            }
          }
          break;

        default:
          console.warn("Unknown message type:", data.type);
      }
    };

    /**
     * Send widget control state change
     */
    this.sendWidgetControl = function(widgetId, widgetType, controlEnabled) {
      return self.send({
        type: 'widget-control',
        widgetId: widgetId,
        widgetType: widgetType,
        controlEnabled: controlEnabled
      });
    };

    /**
     * Send widget state update
     */
    this.sendWidgetUpdate = function(widgetId, widgetType, payload) {
      return self.send({
        type: 'widget-update',
        widgetId: widgetId,
        widgetType: widgetType,
        payload: payload
      });
    };

    /**
     * Send full widgets snapshot
     */
    this.sendWidgetsSync = function() {
      if (!manager) {
        console.warn("Widget manager not initialized");
        return false;
      }

      var widgets = [];
      var widgetElements = widgetLayer.querySelectorAll(".widget");
      
      for (var i = 0; i < widgetElements.length; i += 1) {
        var widget = widgetElements[i];
        var entry = manager.widgets[widget.getAttribute("data-id")];
        
        if (entry) {
          // Get position from widget element
          var position = {
            left: parseInt(widget.style.left, 10) || 20,
            top: parseInt(widget.style.top, 10) || 20
          };
          
          // Get size from widget element if set
          var size = null;
          if (widget.style.width) {
            size = {
              width: parseInt(widget.style.width, 10),
              height: parseInt(widget.style.height, 10)
            };
          }
          
          // Get minimized state
          var minimized = widget.getAttribute("data-minimized") === "true";
          
          // Get widget data using save function
          var data = entry.save(widget);
          
          widgets.push({
            syncId: entry.syncId,
            type: entry.type,
            viewerControlEnabled: entry.viewerControlEnabled || false,
            position: position,
            size: size,
            minimized: minimized,
            data: data || {}
          });
        }
      }

      console.log("Sending widgets-sync with " + widgets.length + " widgets");
      return self.send({
        type: 'widgets-sync',
        widgets: widgets
      });
    };

    /**
     * Send screen change notification
     */
    this.sendScreenChange = function(screenId) {
      return self.send({
        type: 'screen-change',
        screenId: screenId
      });
    };
  }

  // Global LiveSync client instance
  var liveSyncClient = null;

  /**
   * Initialize LiveSync client if in an active room
   */
  function initLiveSync() {
    console.log("initLiveSync() called, isViewerMode:", window.isViewerMode);
    
    var roomCode = getActiveRoomCode();
    console.log("getActiveRoomCode() returned:", roomCode);
    
    if (!roomCode) {
      console.log("No active room - LiveSync not initialized");
      return;
    }

    var role = window.isViewerMode ? 'viewer' : 'host';
    var meta = {};

    // Get student info if viewer
    if (window.isViewerMode) {
      var params = new URLSearchParams(window.location.search);
      meta.studentId = params.get('student') || 'student-' + Date.now();
      meta.studentName = params.get('name') || '';
      console.log("Viewer meta:", meta);
    }

    console.log("Creating LiveSyncClient with role:", role, "roomCode:", roomCode);
    liveSyncClient = new LiveSyncClient();
    liveSyncClient.connect(roomCode, role, meta);
    
    console.log("LiveSync initialized - Role:", role, "Room:", roomCode);
  }

  /**
   * Broadcast widget control state change to student viewers
   * @param {string} syncId - Widget sync ID
   * @param {string} widgetType - Widget type (e.g., "timer", "clock")
   * @param {boolean} controlEnabled - Whether students can control this widget
   */
  function broadcastWidgetControlState(syncId, widgetType, controlEnabled) {
    if (window.isViewerMode) {
      return; // Students can't broadcast
    }

    var roomCode = getActiveRoomCode();
    if (!roomCode) {
      console.log("No active room - widget control state not broadcasted");
      return;
    }

    // Send via WebSocket (primary method for cross-device sync)
    if (liveSyncClient && liveSyncClient.isConnected) {
      liveSyncClient.sendWidgetControl(syncId, widgetType, controlEnabled);
      console.log("Sent widget-control via WebSocket:", syncId, widgetType, controlEnabled);
    } else {
      console.log("WebSocket not connected, skipping broadcast");
    }

    // Fallback: BroadcastChannel for same-device sync (e.g., host and viewer in same browser)
    try {
      var channel = new BroadcastChannel("classroom-room-" + roomCode);
      channel.postMessage({
        type: "widget-control",
        widgetId: syncId,
        widgetType: widgetType,
        controlEnabled: controlEnabled,
        timestamp: new Date().toISOString()
      });
      channel.close();
    } catch (error) {
      // Silent fail - BroadcastChannel is just a fallback
    }
  }

  /**
   * Update a single widget from synchronization data (called by viewer)
   * @param {string} widgetId - Widget sync ID
   * @param {string} widgetType - Widget type
   * @param {object} updateData - Data to update (e.g., {controlEnabled: true})
   */
  window.updateWidgetFromSync = function (widgetId, widgetType, updateData) {
    if (!manager) {
      console.warn("Widget manager not initialized");
      return;
    }

    // Find the widget by syncId
    var widgets = widgetLayer.querySelectorAll(".widget");
    for (var i = 0; i < widgets.length; i += 1) {
      var widget = widgets[i];
      var entry = manager.widgets[widget.getAttribute("data-id")];

      if (entry && entry.syncId === widgetId) {
        // Update viewer control state if provided
        if (updateData.hasOwnProperty("controlEnabled") && widget._setViewerControlState) {
          widget._setViewerControlState(updateData.controlEnabled, { skipPersist: true, broadcast: false });
          console.log("Updated widget control state:", widgetId, updateData.controlEnabled);
        }

        // Future: Add more update types here (e.g., widget state sync)
        return;
      }
    }

    console.warn("Widget not found for sync update:", widgetId);
  };

  /**
   * Sync all widgets from teacher snapshot (called by viewer)
   * @param {object} data - Snapshot data containing widgets array
   */
  window.syncAllWidgets = function (data) {
    if (!manager || !data || !data.widgets) {
      console.warn("Cannot sync widgets - invalid data or manager not ready");
      return;
    }

    console.log("Syncing all widgets from teacher, count:", data.widgets.length);

    // For each widget in the snapshot
    for (var i = 0; i < data.widgets.length; i += 1) {
      var widgetData = data.widgets[i];
      if (!widgetData.syncId) {
        continue;
      }

      // Find matching widget in viewer by syncId
      var widgets = widgetLayer.querySelectorAll(".widget");
      var found = false;

      for (var j = 0; j < widgets.length; j += 1) {
        var widget = widgets[j];
        var entry = manager.widgets[widget.getAttribute("data-id")];

        if (entry && entry.syncId === widgetData.syncId) {
          found = true;

          // Update viewer control state
          if (widgetData.hasOwnProperty("viewerControlEnabled") && widget._setViewerControlState) {
            widget._setViewerControlState(widgetData.viewerControlEnabled, {
              skipPersist: true,
              broadcast: false
            });
          }

          // Update position if provided
          if (widgetData.position) {
            widget.style.left = widgetData.position.left + "px";
            widget.style.top = widgetData.position.top + "px";
          }

          // Update size if provided
          if (widgetData.size) {
            widget.style.width = widgetData.size.width + "px";
            widget.style.height = widgetData.size.height + "px";
          }

          // Update minimized state if provided
          if (widgetData.hasOwnProperty("minimized")) {
            var isMinimized = widget.getAttribute("data-minimized") === "true";
            if (widgetData.minimized !== isMinimized) {
              widget.setAttribute("data-minimized", widgetData.minimized ? "true" : "false");
              if (widgetData.minimized) {
                widget.classList.add("minimized");
              } else {
                widget.classList.remove("minimized");
              }
            }
          }

          // Update widget data if provided and widget has load function
          if (widgetData.hasOwnProperty("data") && widgetData.data != null && entry.load) {
            entry.load(widget, widgetData.data);
          }

          break;
        }
      }

      // Widget not found - create it!
      if (!found) {
        console.log("Creating new widget in viewer:", widgetData.syncId, widgetData.type);
        
        // Create widget with data from teacher
        // Use true as default if viewerControlEnabled is not explicitly set
        var viewerControlForWidget = widgetData.hasOwnProperty("viewerControlEnabled") 
          ? widgetData.viewerControlEnabled 
          : true;
        
        var newWidget = manager.createWidget(
          widgetData.type,
          widgetData.data || {},
          widgetData.position || { left: 20, top: 20 },
          widgetData.size || null,
          widgetData.minimized || false,
          null, // fontSize - will use default
          false, // fontOverride
          widgetData.syncId,
          viewerControlForWidget
        );

        if (newWidget) {
          console.log("Successfully created widget:", widgetData.syncId);
          
          // Call load() to sync initial state (e.g., timer running state)
          var entry = manager.widgets[newWidget.getAttribute("data-id")];
          if (entry && entry.load && widgetData.hasOwnProperty("data") && widgetData.data != null) {
            console.log("Calling load() on newly created widget:", widgetData.syncId);
            entry.load(newWidget, widgetData.data);
          }
        } else {
          console.warn("Failed to create widget:", widgetData.syncId, widgetData.type);
        }
      }
    }

    console.log("Widget sync complete");
  };

  function initRoomDialog() {
    if (!roomDialog) {
      return;
    }

    var roomStartButton = document.getElementById("roomStartButton");
    var roomCloseButton = document.getElementById("roomCloseButton");
    var roomCopyLinkButton = document.getElementById("roomCopyLinkButton");
    var roomOpenViewerButton = document.getElementById("roomOpenViewerButton");
    var roomResyncButton = document.getElementById("roomResyncButton");
    var roomNameInput = document.getElementById("roomNameInput");
    var roomCodeValue = document.getElementById("roomCodeValue");
    var roomCodeUpdatedAt = document.getElementById("roomCodeUpdatedAt");
    var roomJoinLinkPreview = document.getElementById("roomJoinLinkPreview");
    var roomDialogInactive = document.getElementById("roomDialogInactive");
    var roomDialogActive = document.getElementById("roomDialogActive");
    var roomStudentList = document.getElementById("roomStudentList");
    var roomStudentCount = document.getElementById("roomStudentCount");
    var roomEmptyState = document.getElementById("roomEmptyState");

    // Generate random room code
    function generateRoomCode() {
      var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      var code = "";
      for (var i = 0; i < 6; i += 1) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    // Start room
    if (roomStartButton) {
      roomStartButton.addEventListener("click", function() {
        var roomName = roomNameInput ? roomNameInput.value.trim() : "";
        if (!roomName) {
          roomName = "Lektion";
        }

        var roomCode = generateRoomCode();
        var roomData = {
          code: roomCode,
          name: roomName,
          createdAt: new Date().toISOString(),
          screenId: currentScreenId,
          lessonId: null,
          screenIndex: 0
        };

        try {
          window.localStorage.setItem("classroomscreen-active-room-v1", JSON.stringify(roomData));

          // Update UI
          if (roomCodeValue) {
            roomCodeValue.textContent = roomCode;
          }
          if (roomCodeUpdatedAt) {
            var now = new Date();
            roomCodeUpdatedAt.textContent = "Skapad " + now.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
          }
          if (roomJoinLinkPreview) {
            var joinUrl = window.location.origin + "/join.html?room=" + roomCode;
            roomJoinLinkPreview.textContent = joinUrl;
          }

          // Show active state
          if (roomDialogInactive) {
            roomDialogInactive.hidden = true;
          }
          if (roomDialogActive) {
            roomDialogActive.hidden = false;
          }

          // Initialize LiveSync for this room FIRST
          if (liveSyncClient) {
            liveSyncClient.disconnect();
          }
          liveSyncClient = new LiveSyncClient();
          liveSyncClient.connect(roomCode, 'host', {});
          console.log("LiveSync connecting for room:", roomCode);
          
          // Note: Widgets will be broadcast when viewers send sync-request
        } catch (error) {
          console.error("Could not start room", error);
          alert("Kunde inte starta rummet");
        }
      });
    }

    // Close room
    if (roomCloseButton) {
      roomCloseButton.addEventListener("click", function() {
        if (confirm("Är du säker på att du vill avsluta rummet?")) {
          try {
            var roomData = window.localStorage.getItem("classroomscreen-active-room-v1");
            if (roomData) {
              var room = JSON.parse(roomData);

              // Broadcast room closed via BroadcastChannel (fallback)
              var channel = new BroadcastChannel("classroom-room-" + room.code);
              channel.postMessage({
                type: "room-closed",
                timestamp: new Date().toISOString()
              });
              channel.close();
            }

            // Disconnect LiveSync
            if (liveSyncClient) {
              liveSyncClient.disconnect();
              console.log("LiveSync disconnected");
            }

            window.localStorage.removeItem("classroomscreen-active-room-v1");
            window.localStorage.removeItem("classroomscreen-room-students-v1");

            // Reset UI
            if (roomDialogInactive) {
              roomDialogInactive.hidden = false;
            }
            if (roomDialogActive) {
              roomDialogActive.hidden = true;
            }
            if (roomNameInput) {
              roomNameInput.value = "";
            }
          } catch (error) {
            console.error("Could not close room", error);
          }
        }
      });
    }

    // Copy link
    if (roomCopyLinkButton) {
      roomCopyLinkButton.addEventListener("click", function() {
        if (roomJoinLinkPreview) {
          var text = roomJoinLinkPreview.textContent;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
              alert("Länk kopierad!");
            }).catch(function() {
              alert("Kunde inte kopiera länk");
            });
          } else {
            alert("Kopiera denna länk: " + text);
          }
        }
      });
    }

    // Open viewer
    if (roomOpenViewerButton) {
      roomOpenViewerButton.addEventListener("click", function() {
        try {
          var roomData = window.localStorage.getItem("classroomscreen-active-room-v1");
          if (roomData) {
            var room = JSON.parse(roomData);
            var viewerUrl = window.location.origin + "/viewer.html?room=" + room.code + "&student=teacher-preview";
            window.open(viewerUrl, "_blank");
          }
        } catch (error) {
          console.error("Could not open viewer", error);
        }
      });
    }

    // Resync widgets
    if (roomResyncButton) {
      roomResyncButton.addEventListener("click", function() {
        try {
          var roomData = window.localStorage.getItem("classroomscreen-active-room-v1");
          if (roomData) {
            var room = JSON.parse(roomData);
            broadcastAllWidgets(room.code);
            alert("Widgets synkade!");
          }
        } catch (error) {
          console.error("Could not resync", error);
        }
      });
    }

    // Check if room is active when dialog opens
    roomDialog.addEventListener("show", function() {
      try {
        var roomData = window.localStorage.getItem("classroomscreen-active-room-v1");
        if (roomData) {
          var room = JSON.parse(roomData);

          // Show active state
          if (roomCodeValue) {
            roomCodeValue.textContent = room.code;
          }
          if (roomCodeUpdatedAt && room.createdAt) {
            var createdDate = new Date(room.createdAt);
            roomCodeUpdatedAt.textContent = "Skapad " + createdDate.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
          }
          if (roomJoinLinkPreview) {
            var joinUrl = window.location.origin + window.location.pathname.replace("index.html", "") + "join.html?room=" + room.code;
            roomJoinLinkPreview.textContent = joinUrl;
          }
          if (roomDialogInactive) {
            roomDialogInactive.hidden = true;
          }
          if (roomDialogActive) {
            roomDialogActive.hidden = false;
          }

          updateStudentList();
        } else {
          // Show inactive state
          if (roomDialogInactive) {
            roomDialogInactive.hidden = false;
          }
          if (roomDialogActive) {
            roomDialogActive.hidden = true;
          }
        }
      } catch (error) {
        console.error("Could not check room status", error);
      }
    });

    function updateStudentList() {
      if (!roomStudentList || !roomStudentCount) {
        return;
      }

      try {
        var studentsData = window.localStorage.getItem("classroomscreen-room-students-v1");
        var students = studentsData ? JSON.parse(studentsData) : [];

        clearChildren(roomStudentList);

        if (students.length === 0) {
          if (roomEmptyState) {
            roomEmptyState.style.display = "block";
          }
          roomStudentCount.textContent = "0";
          return;
        }

        if (roomEmptyState) {
          roomEmptyState.style.display = "none";
        }
        roomStudentCount.textContent = String(students.length);

        for (var i = 0; i < students.length; i += 1) {
          var student = students[i];
          var li = document.createElement("li");
          li.className = "room-student-item";
          if (student.handRaised) {
            li.className += " hand-raised";
          }

          // Student info container
          var infoDiv = document.createElement("div");
          infoDiv.className = "room-student-info";

          // Avatar
          var avatar = document.createElement("div");
          avatar.className = "room-student-avatar";
          if (student.handRaised) {
            avatar.className += " hand-raised";
          }
          var studentName = student.name || ("Elev " + (i + 1));
          var initial = studentName.charAt(0).toUpperCase();
          avatar.textContent = initial;

          // Details
          var detailsDiv = document.createElement("div");
          detailsDiv.className = "room-student-details";

          var nameSpan = document.createElement("span");
          nameSpan.className = "room-student-name";
          nameSpan.textContent = studentName;

          var metaSpan = document.createElement("span");
          metaSpan.className = "room-student-meta";
          if (student.handRaised) {
            metaSpan.textContent = "✋ Räcker upp handen";
          } else if (student.joinedAt) {
            var joinDate = new Date(student.joinedAt);
            metaSpan.textContent = "Anslöt " + joinDate.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
          } else {
            metaSpan.textContent = "Ansluten";
          }

          detailsDiv.appendChild(nameSpan);
          detailsDiv.appendChild(metaSpan);

          infoDiv.appendChild(avatar);
          infoDiv.appendChild(detailsDiv);

          // Actions container
          var actionsDiv = document.createElement("div");
          actionsDiv.className = "room-student-actions";

          // Remove button
          var removeBtn = document.createElement("button");
          removeBtn.className = "room-student-remove-btn";
          removeBtn.textContent = "×";
          removeBtn.title = "Ta bort elev";
          removeBtn.type = "button";
          removeBtn.setAttribute("data-student-id", student.id);
          removeBtn.addEventListener("click", function(e) {
            var studentId = e.target.getAttribute("data-student-id");
            if (confirm("Ta bort denna elev från rummet?")) {
              removeStudentFromRoom(studentId);
            }
          });

          actionsDiv.appendChild(removeBtn);

          li.appendChild(infoDiv);
          li.appendChild(actionsDiv);
          roomStudentList.appendChild(li);
        }
      } catch (error) {
        console.error("Could not update student list", error);
      }
    }

    // Expose updateStudentList globally for WebSocket event handlers
    window.updateStudentListGlobal = updateStudentList;

    function removeStudentFromRoom(studentId) {
      try {
        var studentsData = window.localStorage.getItem("classroomscreen-room-students-v1");
        var students = studentsData ? JSON.parse(studentsData) : [];
        var filtered = [];
        for (var i = 0; i < students.length; i += 1) {
          if (students[i] && students[i].id !== studentId) {
            filtered.push(students[i]);
          }
        }
        window.localStorage.setItem("classroomscreen-room-students-v1", JSON.stringify(filtered));
        updateStudentList();
      } catch (error) {
        console.error("Could not remove student", error);
      }
    }

    function startRoomBroadcast(roomCode) {
      // Broadcast initial widget state via LiveSync
      if (liveSyncClient && liveSyncClient.isConnected) {
        console.log("Broadcasting all widgets via LiveSync");
        liveSyncClient.sendWidgetsSync();
      } else {
        console.warn("LiveSync not connected, cannot broadcast widgets");
      }
    }

    // Listen for student updates
    setInterval(function() {
      if (roomDialog && !roomDialog.hasAttribute("open")) {
        return;
      }
      updateStudentList();
    }, 2000);
  }

  function initHighContrast() {
    var toggleBtn = document.getElementById("highContrastToggle");
    var appShell = document.querySelector(".app-shell");
    var HIGH_CONTRAST_KEY = "classroomscreen-high-contrast-v1";
    
    if (!toggleBtn || !appShell) {
      return;
    }
    
    // Load saved state
    var savedState = false;
    try {
      savedState = window.localStorage.getItem(HIGH_CONTRAST_KEY) === "true";
    } catch (error) {
      console.warn("Could not load high contrast state", error);
    }
    
    function setHighContrast(enabled) {
      if (enabled) {
        appShell.classList.add("high-contrast-mode");
        toggleBtn.style.background = "rgba(0, 0, 0, 0.9)";
        toggleBtn.style.color = "white";
      } else {
        appShell.classList.remove("high-contrast-mode");
        toggleBtn.style.background = "";
        toggleBtn.style.color = "";
      }
      
      try {
        window.localStorage.setItem(HIGH_CONTRAST_KEY, enabled ? "true" : "false");
      } catch (error) {
        console.warn("Could not save high contrast state", error);
      }
    }
    
    // Apply saved state
    setHighContrast(savedState);
    
    // Toggle on click
    toggleBtn.addEventListener("click", function() {
      var isEnabled = appShell.classList.contains("high-contrast-mode");
      setHighContrast(!isEnabled);
    });
  }

  function initApp() {
    manager = new WidgetManager(widgetLayer);
    setBackground(currentBackground, { skipPersist: true, skipHighlight: true });
    initBackgroundPicker();
    initMoreMenu();
    initToolbar();
    initStatusBar();
    initAdminDialog();
    initRoomDialog();
    initHeaderActions();
    initUIToggleFab();
    initWidgetContextMenu();
    initHighContrast();
    
    // Initialize LiveSync for cross-device synchronization
    initLiveSync();

    try {
      var savedScreenId = window.localStorage.getItem(CURRENT_SCREEN_KEY);
      if (savedScreenId) {
        loadScreen(savedScreenId);
      } else if (!canUseStorage || !window.localStorage.getItem(STORAGE_KEY)) {
        manager.createWidget("clock");
        manager.createWidget("timer");
        manager.createWidget("text");
      } else {
        highlightActiveBackground();
      }
      applyGlobalFontSize();
    } catch (error) {
      console.error("Kunde inte ladda sparad screen", error);
      manager.createWidget("clock");
      manager.createWidget("timer");
      manager.createWidget("text");
    }
  }

  function initStudentHandRaiseView() {
    var params = new URLSearchParams(window.location.search);
    var roomId = params.get("handraise");

    if (!roomId) {
      return;
    }

    var appShell = document.querySelector(".app-shell");
    var studentView = document.getElementById("studentHandRaiseView");

    if (!studentView) {
      return;
    }

    appShell.style.display = "none";
    studentView.style.display = "flex";

    var STORAGE_PREFIX = "handraise-room-";
    var roomKey = STORAGE_PREFIX + roomId;
    var TOKEN_KEY = "handraise-token-" + roomId;
    var NAME_KEY = "handraise-name-" + roomId;

    var token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = "student-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      window.localStorage.setItem(TOKEN_KEY, token);
    }

    var studentName = window.localStorage.getItem(NAME_KEY) || "";
    var studentStatus = "idle";

    var roomNameEl = document.getElementById("studentRoomName");
    var nameInput = document.getElementById("studentNameInput");
    var raiseHandBtn = document.getElementById("raiseHandBtn");
    var studentInfo = document.getElementById("studentInfo");

    if (nameInput) {
      nameInput.value = studentName;
      nameInput.addEventListener("input", function () {
        studentName = nameInput.value.trim();
        window.localStorage.setItem(NAME_KEY, studentName);
      });
    }

    function loadRoomData() {
      try {
        var data = window.localStorage.getItem(roomKey);
        if (data) {
          var roomData = JSON.parse(data);
          if (roomNameEl) {
            roomNameEl.textContent = roomData.name || "Lektion";
          }

          var myStudent = roomData.students.find(function (s) { return s.token === token; });
          if (myStudent) {
            studentStatus = myStudent.status;
            if (myStudent.name && !studentName) {
              studentName = myStudent.name;
              window.localStorage.setItem(NAME_KEY, studentName);
              if (nameInput) {
                nameInput.value = studentName;
              }
            }
            updateUI();
          }
        }
      } catch (error) {
        console.error("Kunde inte ladda rum-data", error);
      }
    }

    function raiseHand() {
      if (!studentName) {
        if (studentInfo) {
          studentInfo.textContent = "Skriv ditt namn först!";
          studentInfo.style.color = "#e74c3c";
        }
        if (nameInput) {
          nameInput.focus();
        }
        return;
      }

      try {
        var data = window.localStorage.getItem(roomKey);
        var roomData = data ? JSON.parse(data) : { id: roomId, students: [], createdAt: Date.now() };

        var existingIndex = roomData.students.findIndex(function (s) { return s.token === token; });

        if (existingIndex === -1) {
          roomData.students.push({
            token: token,
            name: studentName,
            status: "waiting",
            timestamp: Date.now()
          });
        } else {
          roomData.students[existingIndex].status = "waiting";
          roomData.students[existingIndex].name = studentName;
          roomData.students[existingIndex].timestamp = Date.now();
        }

        window.localStorage.setItem(roomKey, JSON.stringify(roomData));
        studentStatus = "waiting";
        updateUI();
      } catch (error) {
        console.error("Kunde inte räcka upp hand", error);
      }
    }

    function lowerHand() {
      try {
        var data = window.localStorage.getItem(roomKey);
        if (data) {
          var roomData = JSON.parse(data);
          roomData.students = roomData.students.filter(function (s) { return s.token !== token; });
          window.localStorage.setItem(roomKey, JSON.stringify(roomData));
        }
        studentStatus = "idle";
        updateUI();
      } catch (error) {
        console.error("Kunde inte sänka hand", error);
      }
    }

    function updateUI() {
      if (!raiseHandBtn) { return; }

      if (studentStatus === "waiting") {
        raiseHandBtn.className = "raise-hand-btn waiting";
        raiseHandBtn.querySelector(".hand-icon").textContent = "⏱️";
        raiseHandBtn.querySelector(".hand-text").textContent = "Väntar på hjälp...";
        raiseHandBtn.onclick = lowerHand;
        if (studentInfo) {
          studentInfo.textContent = "Läraren ser att du behöver hjälp";
        }
      } else if (studentStatus === "helped") {
        raiseHandBtn.className = "raise-hand-btn helped";
        raiseHandBtn.querySelector(".hand-icon").textContent = "✅";
        raiseHandBtn.querySelector(".hand-text").textContent = "Hjälp är på väg!";
        raiseHandBtn.onclick = lowerHand;
        if (studentInfo) {
          studentInfo.textContent = "Läraren kommer till dig snart";
        }
      } else {
        raiseHandBtn.className = "raise-hand-btn";
        raiseHandBtn.querySelector(".hand-icon").textContent = "✋";
        raiseHandBtn.querySelector(".hand-text").textContent = "Räck upp handen";
        raiseHandBtn.onclick = raiseHand;
        if (studentInfo) {
          studentInfo.textContent = "";
          studentInfo.style.color = "";
        }
      }
    }

    loadRoomData();
    updateUI();

    window.setInterval(loadRoomData, 3000);
  }

  initApp();
  initStudentHandRaiseView();
})();

