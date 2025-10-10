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
    -   **Fullscreen slideshow navigation**: In fullscreen mode, use ← → arrows or keyboard to browse images
3.  **Enhanced Step-by-Step Instructions Widget**: Visual learning aid with media integration:
    -   **Rich step format**: Each step has title, body text, and optional image (from Pexels/ARASAAC)
    -   **View modes**: "Ett i taget" (single step) or "Visa alla" (grid view of all steps)
    -   **Edit mode**: Teachers can modify titles, descriptions, and select images from media library
    -   **Student view option**: "Dölj text" toggle hides body text, showing only titles and images
    -   **Progress tracking**: Visual progress bar and step counter (X av Y) in single mode
    -   **Media library integration**: "📚 Välj bild" button opens media library for Pexels photos or ARASAAC pictograms
    -   **Syncs with students**: Mode changes, content edits, and visibility settings sync in real-time
4.  **Media Library**: Hybrid image/symbol library with dual sources:
    -   **Pexels API**: Swedish-language photo search with 8,000+ curated photos for classroom use
    -   **ARASAAC API**: 40,000+ educational pictograms/symbols (English search)
    -   Dual-source tabs for switching between photos and pictograms
    -   Favorites and recently used tracking across both sources
    -   Custom collections for organizing images by subject (Matte, Svenska, etc.)
    -   Integration in Image, Presentation, and Step-by-Step Instructions widgets via "Välj från bibliotek" button
    -   Glassmorphic dialog design with tabbed interface (Sök, Senaste, Favoriter, Samlingar)
    -   Photographer attribution for Pexels photos
5.  **Live Rooms**: Teachers can create rooms with unique codes for students to join, enabling real-time interaction and content synchronization.
6.  **Background Customization**: Multiple ways to customize screen backgrounds:
    -   **Media Library Integration**: "📚 Välj från bibliotek" button to select backgrounds from Pexels photos or ARASAAC pictograms
    -   **URL Input**: Paste direct image links
    -   **File Upload**: Upload local images (PNG/JPG, max 4 MB)
    -   Custom backgrounds are saved and reusable across sessions
7.  **Screen Management**: Ability to save and load different classroom screen configurations.
8.  **Student Interaction**: Students can raise hands in viewer mode, and teachers can manage student lists and their interaction permissions.
9.  **Lesson Management System**: Comprehensive lesson planning and delivery system with:
    -   **Screen Library**: Create and manage reusable screens (saved configurations) with names and descriptions
    -   **Lesson Builder**: Compose screens into sequential lessons with drag-and-drop ordering
    -   **Main Screen**: Designate a primary screen that acts as the lesson homepage
    -   **Arrow Key Navigation**: Keyboard navigation (← → for prev/next screen, ↑ for main screen, ↓ for quick nav overlay)
    -   **Quick Navigation Overlay**: Visual grid showing all lesson screens for instant jumping
    -   **Lesson Indicator**: Progress bar and position display (e.g., "Screen 2 av 5")
    -   **Real-time Sync**: Screen changes automatically sync to all connected student devices
    -   **Lesson Management**: Save, load, edit, duplicate, and delete complete lessons
    -   **Reusability**: Individual screens can be reused across multiple lessons
10. **Responsive Design**: UI/UX is optimized for both mobile and desktop.

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
    -   **Pexels Service** (`pexels-service.js`): REST API client for Pexels with Swedish locale support (`sv-SE`). Supports curated photos and keyword search with caching. **Advanced filtering**: Configurable `orientation` (landscape/portrait/square) and `size` (large/medium/small) parameters for context-specific results. Background selector automatically uses landscape orientation and large size (24MP) for optimal classroom display. Returns optimized image URLs (thumbnail, medium, large, original) with photographer attribution. API key managed securely via environment variables.
    -   **ARASAAC Service** (`arasaac-service.js`): REST API client for ARASAAC's 40,000+ pictograms (English language due to Swedish unavailability) with caching for performance. Supports search, best-search, new items, and by-ID lookups. Generates optimized image URLs with configurable resolution (300px, 500px, 2500px) and customization options (plural, color, action, skin tone, hair color).
    -   **Media Storage** (`media-storage.js`): LocalStorage-based persistence layer managing favorites, recently used items (max 50), and user-created collections. Supports items from both Pexels and ARASAAC sources with proper source tracking. Provides defensive parsing, deduplication, and import/export functionality.
    -   **Media Library UI** (`media-library-ui.js`): Modal dialog with source-switching tabs (Pexels/ARASAAC) and view tabs (Search, Recent, Favorites, Collections). Features real-time search with debouncing and language-appropriate placeholders (Swedish for Pexels, English for ARASAAC). Grid-based item display with photographer credits for Pexels photos. **Multi-select mode**: When `allowMultiple: true`, users can select multiple images (visual checkmarks), and confirm with "Lägg till valda (X)" button in header. Robust ID handling with String comparisons supports both numeric and prefixed IDs (pexels-*, arasaac-*). Integration in Image, Presentation, Step-by-Step Instructions, and Background selection widgets via "Välj från bibliotek" button. Glassmorphic design consistent with the application's visual language.
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
-   **Lesson Management System**: Complete lesson planning and delivery infrastructure:
    -   **Data Model**: Lessons stored in localStorage with structure `{id, name, mainScreenId, screenSequence[], currentIndex}`
    -   **Screen Library**: Enhanced screen storage with description metadata for better organization and searchability
    -   **Lesson Builder UI**: Modal interface for composing lessons with screen selection from library, drag-and-drop reordering (↑↓ buttons), and main screen designation
    -   **Navigation System**: `navigateLesson()` function handles arrow key events (←→ for prev/next, ↑ for main, ↓ for overlay) with automatic screen loading and WebSocket sync
    -   **Quick Navigation**: Overlay dialog showing visual grid of all lesson screens with one-click jumping
    -   **Lesson Indicator**: Real-time progress display showing "Screen X av Y" with visual progress bar
    -   **WebSocket Integration**: Screen changes in lessons automatically broadcast to all connected students via `sendScreenChange()` with lesson context
    -   **Persistence**: Full CRUD operations (create, read, update, delete) for both screens and lessons with localStorage backing
    -   **Reusability**: Screens can be referenced in multiple lessons without duplication
-   **Localized Content**: `widgetNamesSwedish` object maps widget types to Swedish names for display.

## External Dependencies
-   **Node.js HTTP Server**: For serving static files and handling server-side logic. Includes `/api/pexels-key` endpoint for secure API key delivery.
-   **`ws` package**: Used for WebSocket server implementation to manage real-time communication.
-   **Pexels API**: Free photo API with 200 requests/hour limit. Requires `PEXELS_API_KEY` environment variable.
-   **ARASAAC API**: Free pictogram API with no authentication required. Public REST API.
-   **LocalStorage**: For client-side data persistence (e.g., high-contrast mode, recent widgets, active room for students, media library favorites/collections).
-   **BroadcastChannel API**: As a fallback for real-time synchronization on the same device.