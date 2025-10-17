const http = require('http')
const express = require('express')
const mongoose = require('mongoose')

const dbConfig = require('./config/dbconnection.json')

const app = express()

app.use(express.json())


// create an http server from the express app
const server = http.createServer(app)

// Connect using mongoose so mongoose models use the same connection
mongoose.connect(dbConfig.url)
    .then(() => {
        console.log('connected to db')
        const port = process.env.PORT || 3000
        server.listen(port, () => console.log('server run on port', port))
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    })