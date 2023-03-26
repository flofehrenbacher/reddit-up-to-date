import axios from 'axios'

export const apiClient = axios.create()
export const redditClient = axios.create({ baseURL: 'https://www.reddit.com' })
