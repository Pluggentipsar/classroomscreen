require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 5000;
const HOST = '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // API endpoint for Pexels API key
  if (req.url === '/api/pexels-key') {
    const apiKey = process.env.PEXELS_API_KEY || '';
    console.log('Pexels API key request - Key available:', apiKey ? 'YES' : 'NO');
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({
      apiKey: apiKey
    }));
    return;
  }

  // Remove query parameters from URL and leading slashes
  const urlWithoutQuery = req.url.split('?')[0];
  const cleanUrl = urlWithoutQuery.replace(/^\/+/, ''); // Remove leading slashes
  let filePath = path.join(__dirname, 'src', cleanUrl || 'index.html');
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`Serving files from: ${path.join(__dirname, 'src')}`);
});

// ============================================================================
// WebSocket Server for Live Room Sync
// ============================================================================

const wss = new WebSocket.Server({ server });

// Room registry: { roomCode: { host: ws, viewers: Set<ws> } }
const rooms = new Map();

// Track metadata for each connection
const connectionMeta = new WeakMap();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  // Keep connection alive with ping/pong
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error('Invalid JSON message:', e);
      return;
    }

    const { type, roomCode } = data;

    // Handle JOIN
    if (type === 'join') {
      const { role, studentId, studentName } = data;
      
      if (!roomCode) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room code required' }));
        return;
      }

      // Create room if it doesn't exist
      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, { host: null, viewers: new Set() });
      }

      const room = rooms.get(roomCode);

      // Store connection metadata
      connectionMeta.set(ws, { roomCode, role, studentId, studentName });

      if (role === 'host') {
        // Set as host
        room.host = ws;
        console.log(`Host joined room: ${roomCode}`);
        
        // Notify all viewers that host is online
        room.viewers.forEach(viewer => {
          viewer.send(JSON.stringify({ type: 'host-online' }));
        });
        
        ws.send(JSON.stringify({ type: 'joined', role: 'host', roomCode }));
      } else {
        // Add as viewer
        room.viewers.add(ws);
        console.log(`Viewer joined room: ${roomCode} (${studentName || studentId})`);
        
        // Notify host about new viewer
        if (room.host && room.host.readyState === WebSocket.OPEN) {
          room.host.send(JSON.stringify({ 
            type: 'viewer-joined', 
            studentId, 
            studentName,
            viewerCount: room.viewers.size 
          }));
        }
        
        ws.send(JSON.stringify({ type: 'joined', role: 'viewer', roomCode }));
      }
      return;
    }

    // All other messages require an active room
    const meta = connectionMeta.get(ws);
    if (!meta || !meta.roomCode) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not joined to any room' }));
      return;
    }

    const room = rooms.get(meta.roomCode);
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      return;
    }

    // Handle SYNC-REQUEST (viewer requests full state from host)
    if (type === 'sync-request') {
      if (room.host && room.host.readyState === WebSocket.OPEN) {
        room.host.send(JSON.stringify({ 
          type: 'sync-request', 
          requesterId: meta.studentId 
        }));
      }
      return;
    }

    // Handle messages from HOST
    if (meta.role === 'host') {
      const broadcastToViewers = ['widget-control', 'widget-update', 'screen-change', 'widgets-sync', 'layout-reset', 'presentation-update'];
      
      if (broadcastToViewers.includes(type)) {
        // Broadcast to all viewers
        room.viewers.forEach(viewer => {
          if (viewer.readyState === WebSocket.OPEN) {
            viewer.send(JSON.stringify(data));
          }
        });
        console.log(`Host broadcasted ${type} to ${room.viewers.size} viewers`);
      }
      return;
    }

    // Handle messages from VIEWER
    if (meta.role === 'viewer') {
      // Forward hand-raise to host
      if (type === 'hand-raise') {
        if (room.host && room.host.readyState === WebSocket.OPEN) {
          room.host.send(JSON.stringify({
            type: 'hand-raise',
            studentId: meta.studentId,
            studentName: meta.studentName,
            raised: data.raised
          }));
        }
        return;
      }

      // Forward widget interactions to host (if viewer control is enabled)
      if (type === 'widget-interaction') {
        if (room.host && room.host.readyState === WebSocket.OPEN) {
          room.host.send(JSON.stringify({
            type: 'widget-interaction',
            studentId: meta.studentId,
            widgetId: data.widgetId,
            action: data.action,
            payload: data.payload
          }));
        }
        return;
      }
    }
  });

  ws.on('close', () => {
    const meta = connectionMeta.get(ws);
    if (!meta) return;

    const { roomCode, role, studentId, studentName } = meta;
    const room = rooms.get(roomCode);
    
    if (!room) return;

    if (role === 'host') {
      console.log(`Host left room: ${roomCode}`);
      room.host = null;
      
      // Notify all viewers that host is offline
      room.viewers.forEach(viewer => {
        if (viewer.readyState === WebSocket.OPEN) {
          viewer.send(JSON.stringify({ type: 'host-offline' }));
        }
      });
      
      // Clean up empty rooms
      if (room.viewers.size === 0) {
        rooms.delete(roomCode);
        console.log(`Room deleted: ${roomCode}`);
      }
    } else {
      console.log(`Viewer left room: ${roomCode} (${studentName || studentId})`);
      room.viewers.delete(ws);
      
      // Notify host
      if (room.host && room.host.readyState === WebSocket.OPEN) {
        room.host.send(JSON.stringify({ 
          type: 'viewer-left', 
          studentId,
          studentName,
          viewerCount: room.viewers.size 
        }));
      }
      
      // Clean up empty rooms
      if (!room.host && room.viewers.size === 0) {
        rooms.delete(roomCode);
        console.log(`Room deleted: ${roomCode}`);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Ping all clients every 30 seconds to keep connections alive
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('Terminating dead connection');
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

console.log('WebSocket server initialized');
