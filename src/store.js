let nextId = 1
const recipes = new Map()

export const addRecipe = (cityId, content) => {
  const id = nextId++
  if (!recipes.has(cityId)) {
    recipes.set(cityId, new Map())
  }
  recipes.get(cityId).set(id, { id, content })
  return { id, content }
}

export const getRecipes = (cityId) => {
  const cityRecipes = recipes.get(cityId)
  if (!cityRecipes) return []
  return Array.from(cityRecipes.values())
}

export const deleteRecipe = (cityId, recipeId) => {
  const cityRecipes = recipes.get(cityId)
  if (!cityRecipes) return false
  return cityRecipes.delete(parseInt(recipeId))
}
