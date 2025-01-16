const axios = require('axios');
require('dotenv').config();

const azureAxios = axios.create({
  baseURL: `${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis`,
  headers: {
    Authorization: `Basic ${Buffer.from(`:${process.env.AZURE_PAT}`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
});

module.exports = azureAxios;

