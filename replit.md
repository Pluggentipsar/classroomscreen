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
1.  **Widget System**: Comprehensive suite including Timer, Clock, Poll, Randomizer, Sound Level, Music, Image, Text, Work Symbols, Traffic Light, Timetable, Presentation, Lesson Progress, Group Maker, Scoreboard, Hand Raise, YouTube, QR Code, Step-by-step instructions, and Critical Thinking Cards.
    -   **Enhanced Image Widget**: Multi-image support, carousel navigation, fullscreen mode, and individual image deletion.
    -   **Enhanced Step-by-Step Instructions Widget**: Rich step format with media integration, "Ett i taget" and "Visa alla" view modes, and student view options.
    -   **Enhanced Poll/Voting Widget**: Five poll types (Snabbkänsla, Flerval, Skala 1-5, Quiz, Fritextsvar), editable content, results control, and poll locking. Fritextsvar allows students to write open-ended text responses with individual deletion and clear-all functionality.
2.  **Media Library**: Hybrid image/symbol library integrating Pexels photos (Swedish search) and ARASAAC pictograms (English search). Includes favorites, recently used, and custom collections.
3.  **Live Rooms**: Teachers can create rooms for real-time student interaction and content synchronization.
4.  **Background Customization**: Options for selecting backgrounds from Media Library, URL input, or file uploads.
5.  **Screen Management**: Ability to save and load different classroom screen configurations.
6.  **Student Interaction**: Students can raise hands in viewer mode; teachers manage student lists and interaction permissions.
7.  **Lesson Management System**: Comprehensive system for creating, managing, and delivering lessons composed of reusable screens with navigation and real-time sync.

### UI/UX and Design Decisions
-   **Modern Aesthetics**: "Glass card" effects, improved backdrop filters, and larger border-radius.
-   **Typography**: Large, clear numbers and tabular-nums with smaller, discreet headings.
-   **High-Contrast Mode**: Toggleable mode for improved visibility.
-   **Interactive Elements**: Larger click areas, enhanced hover effects, and clear button states.
-   **Smart Dock & Launcher**: Compact, freestanding glassmorphic dock for quick access to favorite widgets, with a searchable launcher panel for all widgets.
-   **Widget-Specific Enhancements**: Includes SVG progress rings for timers, larger traffic lights with improved effects, and discreet icons with tooltips.

### Technical Implementation Details
-   **Media Library System**: Modular architecture with `pexels-service.js` (Pexels API client with Swedish locale and advanced filtering), `arasaac-service.js` (ARASAAC API client), `media-storage.js` (LocalStorage for persistence), and `media-library-ui.js` (UI with multi-select and collection management).
-   **WebSocket Real-time Sync**: Uses `ws` package for room-based, robust, and heartbeat-enabled synchronization of various message types.
-   **Student Permissions**: Students can reorganize widgets locally, and content interaction is teacher-controlled with real-time broadcasting.
-   **Lesson Management System**: LocalStorage-backed data model for lessons and screens, with UI for building lessons, navigation functions, and WebSocket integration for real-time screen changes.
-   **Localized Content**: `widgetNamesSwedish` object maps widget types to Swedish names.

## External Dependencies
-   **Node.js HTTP Server**: For serving static files and API endpoints (`/api/pexels-key`).
-   **`ws` package**: For WebSocket server implementation.
-   **Pexels API**: Free photo API.
-   **ARASAAC API**: Free pictogram API.
-   **LocalStorage**: For client-side data persistence.
-   **BroadcastChannel API**: As a fallback for same-device real-time synchronization.