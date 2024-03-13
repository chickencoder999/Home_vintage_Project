// import { createServer } from 'http'
// import express from 'express'
// import { init, httpAdmin, httpNode, start, log } from 'node-red'

// // const cors = require('cors')
// // const corsOptions = {
// //   origin: 'http://localhost:3000'
// // }

// // Create an Express app
// const app = express()
// // app.use(cors(corsOptions))

// // Add a simple route for static content served from 'public'
// // app.use('/', express.static('public'))

// //CHÚ Ý NODE RED CÁI NÀY

// // Create a server
// const server = createServer(app)
// const PORT = 8888
// console.log('ahihi')

// // Create the settings object - see default settings.js file for other options
// const settings = {
//   httpAdminRoot: '/',
//   httpNodeRoot: '/api',
//   userDir: './node_red',
//   functionGlobalContext: {}, // enables global context
//   flowFile: './flows.json',
//   flowFilePretty: true,
//   nodesDir: './node_red/nodes',
//   uiPort: 1880, // Add the missing uiPort property
//   uiHost: 'localhost' // Add the missing uiHost property
// }

// // Initialize the runtime with a server and settings
// init(server, settings)

// // Serve the editor UI from /red
// app.use(settings.httpAdminRoot, httpAdmin)

// // Serve the http nodes UI from /api
// app.use(settings.httpNodeRoot, httpNode)

// server.listen(PORT, () => {
//   // console.log(`Node-Red đang chạy trên post ${PORT}`)
//   // eslint-disable-next-line no-undef
//   console.log(`Node-Red is running on port ${PORT}`)
// })

// // Start the runtime
// start()
