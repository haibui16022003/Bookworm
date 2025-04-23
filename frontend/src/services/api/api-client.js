import axios from 'axios'
import { API_BASE_URL } from './config'

const publicApiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
})


const authApiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})


export {publicApiClient, authApiClient}
