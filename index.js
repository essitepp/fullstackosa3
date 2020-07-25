const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

morgan.token('data', function (req, res) {
  const body = JSON.stringify(req.body)
  if(body !== '{}') {
    return body
  }
  return ''
})

app.use(morgan(
  ':method :url :status :res[content-length] ' +
  '- :response-time ms :data'
))


let persons = [
  { 
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 4
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-5423122",
    id: 5
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const timestamp = new Date()
  response.send(
    `<div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${timestamp}</p>
    </div>`
  )
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'Name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'Number missing'
    })
  }
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'Name must be unique'
    })
  }

  const id = Math.floor(Math.random() * 100000)

  const person = request.body
  person.id = id

  persons = persons.concat(person)

  response.json(person)
})

const PORT =  process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
 