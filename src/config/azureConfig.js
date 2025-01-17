const axios = require('axios');
require('dotenv').config();

const org = process.env.AZURE_ORG;
const proj = process.env.AZURE_PROJECT;
const pat = process.env.AZURE_PAT;
const base = `${org}/${proj}/_apis`;
const azureAxios = axios.create({
  baseURL: base,
  headers: {
    Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`, // Autenticação básica
    'Content-Type': 'application/json',
  },
});

// (async () => {
//   try {
//     // Consulta WIQL para buscar Work Items
//     const query = {
//       query: `
//         SELECT [System.Id], [System.Title], [System.State]
//         FROM WorkItems
//         ORDER BY [System.CreatedDate] DESC
//       `,
//     };

//     // Envia a consulta WIQL
//     const response = await azureAxios.post('wit/wiql?api-version=7.0', query);

//     // Retorna os IDs dos Work Items encontrados
//     const workItems = response.data.workItems || [];
//     console.log(base);
//     console.log('Work Items encontrados:', workItems);
//   } catch (error) {
//     console.log(base);
//     console.error('Erro no Axios:', error.response?.data || error.message);
//   }
// })();

module.exports = azureAxios;

