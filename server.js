const express = require("express");
const WebSocket = require("ws");
const http = require("http");

// Create an Express app
const app = express();
const server = http.createServer(app);

// Create a WebSocket server on the existing HTTP server
const wss = new WebSocket.Server({ server });

// Store document state (for simplicity, using a string)
let documentContent = "";

// When a new WebSocket connection is established
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Send the current document state to the new client
  ws.send(JSON.stringify({ type: "document", content: documentContent }));

  // Listen for incoming messages from clients
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // If the message is an update to the document, broadcast to all clients
    if (data.type === "document") {
      documentContent = data.content;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ type: "document", content: documentContent })
          );
        }
      });
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Serve static files (e.g., for the frontend)
app.use(express.static("public"));

// Start the server on port 8080
server.listen(8080, () => {
  console.log("Server is listening on http://localhost:8080");
});
