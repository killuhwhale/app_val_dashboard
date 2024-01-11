const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const WebSocket = require("ws");
const jwt = require('jsonwebtoken');
const config = require("./config.json");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT ?? 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create a message to send.
const ping = (msg, data) => {
  return JSON.stringify({ msg, data });
};

// parseJson
const pj = (s) => {
  return JSON.parse(s);
};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      await handle(req, res, parsedUrl);
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
    ws.on("message", (pingBuffer) => {
      const mping = pj(pingBuffer)
      const message = mping['msg']
      const wssToken = mping['data']['wssToken']
      console.debug(`>>>> WSServer received message: w/ JWToken ${wssToken}`);

      // Verify wssToken and reject if fails....
      try {
        // console.log("Verifying w/ secret:", env.NEXTAUTH_SECRET, env.NEXTAUTH_SECRET.length)
        jwt.verify(wssToken, config.NEXTAUTH_SECRET, { algorithms: ['HS512'] });
        // Token is valid
      } catch (error) {
        return console.error('Token verification failed:', error.message);
      }
      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          const messageText = message.toString();
          const messagePattern = /^(startrun_|progress:|runstarted:|querystatus_|getdevicename|getdevicename:|status:|stoprun_|runstopped:|update_|updating:)/;

          if (messagePattern.test(messageText)) {
            client.send(pingBuffer.toString());
          }
        }
      });
    });

    ws.send(ping("Hello from WebSocket server nextjs!", {}));
  });

  server.on("upgrade", (req, socket, head) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith("/_next/")) {
      // Let Next.js handle its WebSocket connections
      // handle(req, socket, head);
      // socket.destroy();
    } else if (pathname.startsWith("wss")) {
      console.log("Handling upgrade to wss...");
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
