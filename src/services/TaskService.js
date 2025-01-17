const azureAxios = require('../config/azureConfig');

async function getTaskIdsByPBI(pbiId) {
  try {
    const response = await azureAxios.get(`wit/workitems/${pbiId}?api-version=7.0&$expand=relations`);
    const workItemData = response.data;

    const relations = workItemData.relations || [];
    if (relations.length === 0) {
      // console.log(`Nenhuma relação encontrada para o PBI ${pbiId}.`);
      return [];
    }

    const childTasks = relations.filter(relation => relation.rel === 'System.LinkTypes.Hierarchy-Forward');

    if (childTasks.length === 0) {
      // console.log(`Nenhuma Task associada ao PBI ${pbiId} foi encontrada.`);
      return [];
    }

    const taskIds = childTasks.map(task => {
      try {
        const url = task.url;
        return url.replace(/(.{1,})\/(\d{1,})$/, "$2");
      } catch (e) {
        console.error(`Erro ao processar uma Task para o PBI ${pbiId}:`, e.message);
        return null; // Retorna null em caso de erro, mas continua o fluxo
      }
    }).filter(id => id !== null); // Remove IDs inválidos

    return taskIds;

  } catch (error) {
    console.error(`Erro ao recuperar Tasks para o PBI ${pbiId}:`, error.response?.data || error.message);
    throw error;
  }
}

async function getTaskDetailsById(taskId) {
  try {
    const response = await azureAxios.get(`wit/workitems/${taskId}?api-version=7.0`);

    const taskData = response.data;

    return {
      id: taskId,
      usedHours: taskData.fields['Custom.WorkedHours']
    };
  } catch {
    console.error(`Erro ao recuperar detalhes da Task ${taskId}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getTaskIdsByPBI, getTaskDetailsById };
