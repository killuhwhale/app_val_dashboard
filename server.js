// const { createServer } = require('http')
// const { parse } = require('url')
// const next = require('next')
// const express = require('express');

// const dev = process.env.NODE_ENV !== 'production'
// const hostname = 'localhost'
// const port = 3000
// // const env = require("./src/env.js");
// // when using middleware `hostname` and `port` must be provided below
// console.log("Starting next app...")
// const app = next({ dev, hostname, port })
// console.log("App next is started...")
// const handle = app.getRequestHandler()
// console.log("Handle is started...")
// // app.prepare().then(() => {
// //   createServer(async (req, res) => {
// //     try {
// //       // Be sure to pass `true` as the second argument to `url.parse`.
// //       // This tells it to parse the query portion of the URL.
// //       const parsedUrl = parse(req.url, true)
// //       const { pathname, query } = parsedUrl

// //       if (pathname === '/a') {
// //         await app.render(req, res, '/a', query)
// //       } else if (pathname === '/b') {
// //         await app.render(req, res, '/b', query)
// //       } else {
// //         await handle(req, res, parsedUrl)
// //       }
// //     } catch (err) {
// //       console.error('Error occurred handling', req.url, err)
// //       res.statusCode = 500
// //       res.end('internal server error')
// //     }
// //   })
// //     .once('error', (err) => {
// //       console.error("Err on once: ", err)
// //       process.exit(1)
// //     })
// //     .listen(port, () => {
// //       console.log(`> Ready on http://${hostname}:${port}`)
// //     })
// // })

// const server = express();

// server.all('*', async (req, res) => {
//     return await handle(req, res, "");
// });

// server.listen(3000, (err) => {
//     if (err) throw err;
//     console.log('> Ready on http://localhost:3000');
// });


const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT ?? 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      if (pathname === '/a') {

        await app.render(req, res, '/a', query)
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query)
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  // Setup the WebSocket Server
  // const wss = new WebSocket.Server({ server });
  const wss = new WebSocket.Server({  host: hostname , port:port });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      console.log(`Received messagez: ${message}`, message.toString() == "startrun");
      if(message.toString() == "startrun"){
        console.log(`sending start run to listening clinets, hopefully our local program gets it....`);
        // ws.send('start that run');
         // Broadcast the message to all connected clients
         wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send('start that run');
          }
      });
      }
    });

    ws.send('Hello from WebSocket server bro nextjs!');
  });

  server.on('upgrade', (req, socket, head) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith('/_next/')) {
      // Let Next.js handle its WebSocket connections
      // handle(req, socket, head);
      // socket.destroy();
    } else if(pathname.startsWith("wss")) {
      console.log("Handling upgrade to wss......")
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  server
  .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)

    })


})