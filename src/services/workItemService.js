const { azureAxios } = require('../config/azureConfig'); // Importa a configuração do Axios

// Função para recuperar todos os PBIs
async function getPBIs() {
  try {
    // Consulta WIQL para recuperar PBIs
    const query = {
      query: `SELECT *
              FROM WorkItems
              WHERE [System.WorkItemType] = 'Product Backlog Item'`,
    };

    // Faz a requisição POST para o endpoint WIQL
    const response = await azureAxios.post(
      `wit/wiql?api-version=7.0`, // Endpoint WIQL
      query, // Corpo da requisição
      {
        headers: {
          'Content-Type': 'application/json', // Content-Type correto para WIQL
        },
      }
    );

    // Retorna os PBIs recuperados
    const workItems = response.data.workItems || [];
    console.log(`PBIs encontrados: ${workItems.length}`);
    console.table(workItems);
    console.log(workItems);
    return workItems;
  } catch (error) {
    // Log de erro detalhado
    console.error('Erro ao recuperar PBIs:', error.response?.data || error.message);
    throw error;
  }
}

async function getPBIById(id) {
  try {
    const response = await azureAxios.get(`wit/workitems/${id}?api-version=7.0`);
    const workitem = response.data;

    // console.log(workitem.fields);
    console.log(`Id: ${workitem.id}, Title: ${workitem.fields['System.Title']}`);
  } catch {

  }
}

module.exports = { getPBIs, getPBIById };
