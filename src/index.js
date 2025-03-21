import 'dotenv/config'
import Fastify from 'fastify'
import { submitForReview } from './submission.js'
import { getCityInfo, getWeatherPredictions } from './api.js'
import { addRecipe, getRecipes, deleteRecipe } from './store.js'

const fastify = Fastify({
  logger: true,
})

// GET /cities/:cityId/infos
fastify.get('/cities/:cityId/infos', async (request, reply) => {
  const { cityId } = request.params
  const apiKey = process.env.API_KEY

  try {
    const cityInfo = await getCityInfo(cityId, apiKey)
    const weatherData = await getWeatherPredictions(cityId, apiKey)

    // Format weather predictions
    const weatherPredictions = [
      { when: 'today', min: weatherData[0]?.min || 0, max: weatherData[0]?.max || 0 },
      { when: 'tomorrow', min: weatherData[1]?.min || 0, max: weatherData[1]?.max || 0 }
    ]

    return {
      coordinates: [cityInfo.coordinates.latitude, cityInfo.coordinates.longitude],
      population: cityInfo.population,
      knownFor: cityInfo.knownFor || [],
      weatherPredictions,
      recipes: getRecipes(cityId)
    }
  } catch (error) {
    if (error.message === 'City not found') {
      reply.code(404)
      throw new Error('City not found')
    }
    reply.code(500)
    throw new Error('Internal server error')
  }
})

// POST /cities/:cityId/recipes
fastify.post('/cities/:cityId/recipes', async (request, reply) => {
  const { cityId } = request.params
  const { content } = request.body || {}
  const apiKey = process.env.API_KEY

  // Content validation
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    reply.code(400)
    throw new Error('Recipe content is required')
  }
  if (content.length < 10) {
    reply.code(400)
    throw new Error('Recipe content must be at least 10 characters long')
  }
  if (content.length > 2000) {
    reply.code(400)
    throw new Error('Recipe content must not exceed 2000 characters')
  }

  try {
    // Verify city exists
    await getCityInfo(cityId, apiKey)
    
    // Add recipe and send response
    const recipe = addRecipe(cityId, content.trim())
    reply.code(201)
    return recipe
  } catch (error) {
    if (error.message === 'City not found') {
      reply.code(404)
      throw new Error('City not found')
    }
    reply.code(500)
    throw new Error('Internal server error')
  }
})

// DELETE /cities/:cityId/recipes/:recipeId
fastify.delete('/cities/:cityId/recipes/:recipeId', async (request, reply) => {
  const { cityId, recipeId } = request.params
  const apiKey = process.env.API_KEY

  try {
    // Verify city exists
    await getCityInfo(cityId, apiKey)
    
    // Delete recipe
    const deleted = deleteRecipe(cityId, recipeId)
    if (!deleted) {
      return reply.code(404).send({ error: 'Recipe not found' })
    }
    
    reply.code(204).send()
  } catch (error) {
    if (error.message === 'City not found') {
      reply.code(404).send({ error: 'City not found' })
    } else {
      reply.code(500).send({ error: 'Internal server error' })
    }
  }
})

fastify.setErrorHandler((error, request, reply) => {
  reply.send({
    success: false,
    error: error.message
  })
})

fastify.listen(
  {
    port: process.env.PORT || 3000,
    host: process.env.RENDER_EXTERNAL_URL ? '0.0.0.0' : process.env.HOST || 'localhost',
  },
  function (err) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }

    //////////////////////////////////////////////////////////////////////
    // Don't delete this line, it is used to submit your API for review //
    // everytime your start your server.                                //
    //////////////////////////////////////////////////////////////////////
    submitForReview(fastify)
  }
)
