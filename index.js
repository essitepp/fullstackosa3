require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())

const cors = require('cors')
const { response } = require('express')
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
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  const timestamp = new Date()
  Person.find({})
    .then(persons => {
      response.send(
        `<div>
          <p>Phonebook has info for ${persons.length} people</p>
          <p>${timestamp}</p>
        </div>`
      )
    })
    .catch(error => next(error))
  
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT =  process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
 