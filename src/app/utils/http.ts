import axios from 'axios';
import { Config } from './config';

const apiClient = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
});

export const httpRequest = async ({
  method = 'GET',
  url = '',
  data = {},
  params = null,
  requiresAuth = false,
  customHeaders = {},
}) => {
  if (requiresAuth) {
    customHeaders = {
        'Authorization': `Bearer ${localStorage.getItem('accessTokenMedicalSuite')}`
    };
  }

  return new Promise((resolve, reject) => {
    apiClient({
      method,
      url,
      data,
      params,
      headers: customHeaders,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error('Error en httpRequest:', error.response || error.message);
        reject(error.response);
      });
  });
};
