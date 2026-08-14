import axios from 'axios'
import { API_URL } from '../../config'
import { attachAuthInterceptor } from './authInterceptor'
import { attachUnauthorizedInterceptor } from './unauthorizedInterceptor'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

attachAuthInterceptor(apiClient)
attachUnauthorizedInterceptor(apiClient)

export default apiClient
