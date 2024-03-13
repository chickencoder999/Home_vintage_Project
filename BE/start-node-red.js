// /* eslint-disable @typescript-eslint/no-var-requires */
// var http = require('http')
// var express = require('express')
// var RED = require('node-red')

// // const cors = require('cors')
// // const corsOptions = {
// //   origin: 'http://localhost:3000'
// // }

// // Create an Express app
// var app = express()
// // app.use(cors(corsOptions))

// // Add a simple route for static content served from 'public'
// // app.use('/', express.static('public'))

// //CHÚ Ý NODE RED CÁI NÀY

// // Create a server
// var server = http.createServer(app)
// const PORT = 8888

// // Create the settings object - see default settings.js file for other options
// var settings = {
//   httpAdminRoot: '/',
//   httpNodeRoot: '/api',
//   userDir: './node_red',
//   functionGlobalContext: {}, // enables global context
//   flowFile: './flows.json',
//   flowFilePretty: true,
//   nodesDir: './node_red/nodes'
// }

// // Initialise the runtime with a server and settings
// RED.init(server, settings)

// // Serve the editor UI from /red
// app.use(settings.httpAdminRoot, RED.httpAdmin)

// // Serve the http nodes UI from /api
// app.use(settings.httpNodeRoot, RED.httpNode)

// server.listen(PORT, () => {
//   // console.log(`Node-Red đang chạy trên post ${PORT}`)
//   console.log(`Node-Red is running on port ${PORT}`)
// })

// // Start the runtime
// RED.start()
