# Classroomscreen - Interactive Classroom Display

## Overview
Classroomscreen is an interactive classroom management tool designed to create engaging learning environments. It allows teachers to display various widgets like timers, polls, randomizers, and customize backgrounds on a shared screen. The platform supports live sessions, real-time collaboration between teachers and students, and offers a comprehensive suite of tools to facilitate dynamic classroom activities. The project aims to provide an intuitive and powerful tool for modern educators.

## User Preferences
- Language: Swedish (sv)
- Interface in Swedish

## System Architecture

### Technology Stack
- **Frontend**: Pure JavaScript (no framework)
- **Styling**: CSS with custom properties
- **Server**: Node.js HTTP + WebSocket server
- **Storage**: LocalStorage for persistence
- **Real-time Sync**: WebSocket for cross-device synchronization (with BroadcastChannel fallback)

### Core Features
1.  **Widget System**: Includes Timer, Clock, Poll, Randomizer, Sound Level, Music, Image (with slideshow), Text, Work Symbols, Traffic Light, Timetable, Presentation, Lesson Progress, Group Maker, Scoreboard, Hand Raise, YouTube, QR Code, Step-by-step instructions, and Critical Thinking Cards.
2.  **Enhanced Image Widget**: Modern slideshow/gallery system with:
    -   **Multi-image support**: Add multiple images via URL or media library (select multiple at once)
    -   **Carousel navigation**: Arrow buttons (← →) to browse through images
    -   **Image indicator**: Shows "X / Y" current position
    -   **Fullscreen mode**: Click ⛶ button to view image in fullscreen (ESC to close)
    -   **Delete function**: × button to remove individual images from slideshow
    -   **Backward compatibility**: Old single-image widgets auto-convert to array format
3.  **Media Library**: Hybrid image/symbol library with dual sources:
    -   **Pexels API**: Swedish-language photo search with 8,000+ curated photos for classroom use
    -   **ARASAAC API**: 40,000+ educational pictograms/symbols (English search)
    -   Dual-source tabs for switching between photos and pictograms
    -   Favorites and recently used tracking across both sources
    -   Custom collections for organizing images by subject (Matte, Svenska, etc.)
    -   Integration in Image and Presentation widgets via "Välj från bibliotek" button
    -   Glassmorphic dialog design with tabbed interface (Sök, Senaste, Favoriter, Samlingar)
    -   Photographer attribution for Pexels photos
3.  **Live Rooms**: Teachers can create rooms with unique codes for students to join, enabling real-time interaction and content synchronization.
4.  **Background Customization**: Allows custom images or URLs for screen backgrounds.
5.  **Screen Management**: Ability to save and load different classroom screen configurations.
6.  **Student Interaction**: Students can raise hands in viewer mode, and teachers can manage student lists and their interaction permissions.
7.  **Responsive Design**: UI/UX is optimized for both mobile and desktop.

### UI/UX and Design Decisions
-   **Modern Aesthetics**: Utilizes "glass card" effects, improved backdrop filters, and larger border-radius for a contemporary look.
-   **Typography**: Employs large, clear numbers (72px for clock, 64px for big-digits) and tabular-nums for consistent digit width, with smaller, discreet headings.
-   **High-Contrast Mode**: A toggleable mode with increased contrast and opacity for improved visibility in bright environments, especially with projectors.
-   **Interactive Elements**: Larger click areas (min-height 44px), enhanced hover effects, and clear button states (primary, ghost, danger). Icons are used extensively with text for better understanding.
-   **Smart Dock & Launcher**: A compact, freestanding glassmorphic dock at the bottom center provides quick access to favorite widgets (icons only, no text labels) with a "Mer" button to access the full launcher. The searchable launcher panel, accessible via the "Mer" button or keyboard shortcut (Ctrl/Cmd+K), lists all widgets with real-time filtering by Swedish names, quick access to favorites, and recently used widgets. The dock is completely standalone (fixed position) without status bars or extra borders to minimize screen space usage - ideal for projector use. All widget names are localized in Swedish.
-   **Widget-Specific Enhancements**:
    -   **Timer Widget**: Features an SVG progress ring, +/- buttons for control, a modern toggle for sound/visual pulse, and color changes for warnings.
    -   **Traffic Light Widget**: Larger lights with improved glow effects and scale animations.
    -   **Discreet Icons**: Replaced text with subtle icons for features like "Student Control" with visual feedback (gray for off, blue for on) and custom tooltips.

### Technical Implementation Details
-   **Media Library System**: A comprehensive hybrid image/symbol management system with modular architecture:
    -   **Pexels Service** (`pexels-service.js`): REST API client for Pexels with Swedish locale support (`sv-SE`). Supports curated photos and keyword search with caching. Returns optimized image URLs (thumbnail, medium, large, original) with photographer attribution. API key managed securely via environment variables.
    -   **ARASAAC Service** (`arasaac-service.js`): REST API client for ARASAAC's 40,000+ pictograms (English language due to Swedish unavailability) with caching for performance. Supports search, best-search, new items, and by-ID lookups. Generates optimized image URLs with configurable resolution (300px, 500px, 2500px) and customization options (plural, color, action, skin tone, hair color).
    -   **Media Storage** (`media-storage.js`): LocalStorage-based persistence layer managing favorites, recently used items (max 50), and user-created collections. Supports items from both Pexels and ARASAAC sources with proper source tracking. Provides defensive parsing, deduplication, and import/export functionality.
    -   **Media Library UI** (`media-library-ui.js`): Modal dialog with source-switching tabs (Pexels/ARASAAC) and view tabs (Search, Recent, Favorites, Collections). Features real-time search with debouncing and language-appropriate placeholders (Swedish for Pexels, English for ARASAAC). Grid-based item display with photographer credits for Pexels photos. **Multi-select mode**: When `allowMultiple: true`, users can select multiple images (visual checkmarks), and confirm with "Lägg till valda (X)" button in header. Robust ID handling with String comparisons supports both numeric and prefixed IDs (pexels-*, arasaac-*). Integration buttons in Image and Presentation widgets. Glassmorphic design consistent with the application's visual language.
    -   **Collections System**: Allows teachers to organize images/symbols into subject-based collections (e.g., "Matte", "Svenska"). Collections are stored locally with full CRUD operations and support items from both Pexels and ARASAAC sources.
-   **WebSocket Real-time Sync**: A WebSocket server (using the `ws` package) ensures real-time synchronization across devices.
    -   **Room-based Routing**: Host (teacher) and viewers (students) connect via a room code.
    -   **Message Types**: Standardized messages for joining, sync requests, widget control, updates, screen changes, layout resets, and hand-raises.
    -   **Robustness**: Includes pending broadcast buffers to prevent data loss during connection handshakes and exponential backoff for reconnect attempts.
    -   **Heartbeat**: Ping/pong keep-alive mechanism prevents premature connection drops.
-   **Student Permissions**:
    -   Students can temporarily move and resize widgets for personal organization, but these changes are not persisted or synchronized back to the teacher.
    -   Content interaction is controlled by the teacher via a "Student Control" button; when disabled, an overlay appears, and content controls are locked for students.
    -   When enabled, students can interact with widget content, and their changes are broadcast to the teacher.
-   **Widget Creation Sync**: New widgets created by the teacher appear in real-time on student screens without requiring a page refresh.
-   **Localized Content**: `widgetNamesSwedish` object maps widget types to Swedish names for display.

## External Dependencies
-   **Node.js HTTP Server**: For serving static files and handling server-side logic. Includes `/api/pexels-key` endpoint for secure API key delivery.
-   **`ws` package**: Used for WebSocket server implementation to manage real-time communication.
-   **Pexels API**: Free photo API with 200 requests/hour limit. Requires `PEXELS_API_KEY` environment variable.
-   **ARASAAC API**: Free pictogram API with no authentication required. Public REST API.
-   **LocalStorage**: For client-side data persistence (e.g., high-contrast mode, recent widgets, active room for students, media library favorites/collections).
-   **BroadcastChannel API**: As a fallback for real-time synchronization on the same device.