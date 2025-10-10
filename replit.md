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
1.  **Widget System**: Includes Timer, Clock, Poll, Randomizer, Sound Level, Music, Image, Text, Work Symbols, Traffic Light, Timetable, Presentation, Lesson Progress, Group Maker, Scoreboard, Hand Raise, YouTube, QR Code, Step-by-step instructions, and Critical Thinking Cards.
2.  **Live Rooms**: Teachers can create rooms with unique codes for students to join, enabling real-time interaction and content synchronization.
3.  **Background Customization**: Allows custom images or URLs for screen backgrounds.
4.  **Screen Management**: Ability to save and load different classroom screen configurations.
5.  **Student Interaction**: Students can raise hands in viewer mode, and teachers can manage student lists and their interaction permissions.
6.  **Responsive Design**: UI/UX is optimized for both mobile and desktop.

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
-   **Node.js HTTP Server**: For serving static files and handling server-side logic.
-   **`ws` package**: Used for WebSocket server implementation to manage real-time communication.
-   **LocalStorage**: For client-side data persistence (e.g., high-contrast mode, recent widgets, active room for students).
-   **BroadcastChannel API**: As a fallback for real-time synchronization on the same device.