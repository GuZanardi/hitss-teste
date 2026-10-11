import axios from 'axios';

// Base URL configurada estritamente via variável de ambiente .env
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

