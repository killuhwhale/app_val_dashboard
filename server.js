const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const WebSocket = require("ws");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT ?? 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      if (pathname === "/a") {
        await app.render(req, res, "/a", query);
      } else if (pathname === "/b") {
        await app.render(req, res, "/b", query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });
  // Setup the WebSocket Server
  const wss = new WebSocket.Server({ port: 3001 });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    // Echo back to clients
    ws.on("message", (message) => {
      console.log(`WSServer received message: ${message}`);

      // Broadcast the message to all connected clients - basic sanitize/ routing .toString plus match
      // TODO() Sanitize input and maybe create a router?
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          if (message.toString().startsWith("startrun_")) {
            client.send(message.toString());
          }
          else if(message.toString().startsWith("runstarted:")){
            client.send(message.toString());
          }
          else if(message.toString().startsWith("querystatus_")){
            client.send(message.toString());
          }
          else if(message.toString() == "getdevicename"){
            client.send(message.toString());
          }
          else if(message.toString().startsWith("getdevicename:")){
            client.send(message.toString());
          }
          else if(message.toString().startsWith("status:") ){
            client.send(message.toString());
          }
          else if(message.toString().startsWith("stoprun_")){
            client.send(message.toString());
          }
          else if(message.toString().startsWith("runstopped:")){
            client.send(message.toString());
          }
        }
      });
    });

    ws.send("Hello from WebSocket server bro nextjs!");
  });

  server.on("upgrade", (req, socket, head) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith("/_next/")) {
      // Let Next.js handle its WebSocket connections
      // handle(req, socket, head);
      // socket.destroy();
    } else if (pathname.startsWith("wss")) {
      console.log("Handling upgrade to wss......");
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
