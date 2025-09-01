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

// get state API
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getstatesQuery = `
SELECT
  state_id as stateId,
  state_name as stateName,
  population
FROM
  state
WHERE
  state_id = ${stateId};`

  const details = await db.get(getstatesQuery)
  response.send(details)
})

//Post districts API Call
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body

  const getDistrictQuery = `
  INSERT INTO
   district (district_name, state_id, cases, cured, active, deaths)
  VALUES
   ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths})`

  const dbResponse = await db.run(getDistrictQuery)
  const districtId = dbResponse.lastID
  response.send('District Successfully Added')
})

// Get API call from district
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictQuery = `
  SELECT
   district_id as districtId,
   district_name as districtName,
   state_id as stateId,
   cases,
   cured,
   active,
   deaths
  FROM
    district
  WHERE
  district_id = ${districtId};`

  const details = await db.get(getDistrictQuery)
  response.send(details)
})

//Delete API call
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteQuery = `
  DELETE FROM
   district
  WHERE
    district_id = ${districtId};`

  await db.run(deleteQuery)
  response.send('District Removed')
})

//PUT API call
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updateDistrictQuery = `
       UPDATE
         district
       SET
         district_name='${districtName}',
         state_id= ${stateId},
         cases = ${cases},
         cured = ${cured},
         active = ${active},
         deaths = ${deaths}
       WHERE
         district_id = ${districtId};`

  await db.run(updateDistrictQuery)
  response.send('District Details Updated')
})

module.exports = app
