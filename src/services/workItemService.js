const azureAxios = require('../config/azureConfig'); // Importa a configuração do Axios
const PARAM_NAME = 'HorasGastas'

// Função para recuperar todos os PBIs
async function getPBIs() {
  try {
    const query = {
      query: `SELECT *
              FROM WorkItems
              WHERE [System.WorkItemType] = 'Product Backlog Item'`,
    };
    const response = await azureAxios.post(
      `wit/wiql?api-version=7.0`,
      query,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const workItems = (response.data.workItems || []).map(i => i.id);

    return workItems;
  } catch {

  }
}

async function updatePBI(newPbi) {
  try {
    const updatePayload = [
      {
        op: 'add',
        path: `/fields/Custom.${PARAM_NAME}`,
        value: newPbi.totalHoursonPbi,
      },
    ];
    const response = await azureAxios.patch(
      `wit/workitems/${newPbi.pbiId}?api-version=7.0`,
      updatePayload,
      {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error(`Erro ao atualizar o PBI com ID ${newPbi.pbiId}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getPBIs, updatePBI };
