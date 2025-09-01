const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()

app.use(cors())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.use(express.json())

//Get all states API call
app.get('/api/customers/', async (request, response) => {
  const getstatesQuery = `
 SELECT
  *
 FROM
  customers;`

  const details = await db.all(getstatesQuery)
  response.send(details)
})

app.get('/ping', (req, res) => {
  res.send('pong')
})

module.exports = app
