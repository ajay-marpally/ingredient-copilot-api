import axios from 'axios'

// Remote API for analysis (no DB required)
const ANALYSIS_API_URL = import.meta.env.VITE_ANALYSIS_API_URL || 'https://ingredient-copilot-api.onrender.com'
// Local API for auth/history (requires MongoDB)
const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: LOCAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Separate instance for analysis endpoints (uses Render API)
const analysisApi = axios.create({
  baseURL: ANALYSIS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ingredient_pal_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ingredient_pal_token')
      localStorage.removeItem('ingredient_pal_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/**
 * Auth API
 */
export const authApi = {
  register: async ({ name, email, password }) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

/**
 * Analyze text-based ingredients
 * @param {Object} params
 * @param {string} params.input_type - 'ingredient_list' | 'ocr_text' | 'free_text'
 * @param {string|string[]} params.content - The ingredients content
 * @param {string} [params.user_context] - Optional user context
 */
export const analyzeText = async ({ input_type, content, user_context }) => {
  const response = await analysisApi.post('/analyze', {
    input_type,
    content,
    user_context,
  })
  return response.data
}

/**
 * Analyze image for ingredients
 * @param {File} imageFile - The image file to analyze
 * @param {string} [userContext] - Optional user context
 */
export const analyzeImage = async (imageFile, userContext) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  if (userContext) {
    formData.append('user_context', userContext)
  }

  const response = await analysisApi.post('/analyze/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Health check
 */
export const healthCheck = async () => {
  const response = await analysisApi.get('/')
  return response.data
}

/**
 * History API
 */
export const historyApi = {
  /**
   * Get user's analysis history
   * @param {Object} params
   * @param {number} [params.limit=20] - Number of items to return
   * @param {number} [params.skip=0] - Number of items to skip
   */
  getHistory: async ({ limit = 20, skip = 0 } = {}) => {
    const response = await api.get('/history', {
      params: { limit, skip }
    })
    return response.data
  },

  /**
   * Get a specific analysis
   * @param {string} analysisId - The analysis ID
   */
  getAnalysis: async (analysisId) => {
    const response = await api.get(`/history/${analysisId}`)
    return response.data
  },

  /**
   * Delete a specific analysis
   * @param {string} analysisId - The analysis ID
   */
  deleteAnalysis: async (analysisId) => {
    const response = await api.delete(`/history/${analysisId}`)
    return response.data
  },

  /**
   * Clear all history
   */
  clearHistory: async () => {
    const response = await api.delete('/history')
    return response.data
  },

  /**
   * Save analysis to history (manual save for remote API results)
   * @param {Object} params
   * @param {string} params.input_type - Type of input
   * @param {string|string[]} params.content - Original content analyzed
   * @param {string} [params.user_context] - User context
   * @param {Object} params.result - Analysis result
   */
  saveAnalysis: async ({ input_type, content, user_context, result }) => {
    const response = await api.post('/history', {
      input_type,
      content,
      user_context,
      result
    })
    return response.data
  },
}

export default api
