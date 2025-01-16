require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const axios = require('axios');

// Configurações
const ORG = process.env.AZURE_ORG; // Organização do Azure DevOps
const PROJECT = process.env.AZURE_PROJECT; // Projeto
const PAT = process.env.AZURE_PAT; // Token de Acesso Pessoal

// Criação de cliente Axios com autenticação
const azureClient = axios.create({
  baseURL: `${ORG}/${PROJECT}/_apis`, // URL base da API
  headers: {
    'Content-Type': 'application/json-patch+json', // Corrigido o Content-Type
    Authorization: `Basic ${Buffer.from(`:${PAT}`).toString('base64')}`, // Autenticação com PAT
  },
});


const azureClient2 = axios.create({
  baseURL: `${ORG}/${PROJECT}/_apis`, // URL base da API
  headers: {
    'Content-Type': 'application/json', // Corrigido o Content-Type
    Authorization: `Basic ${Buffer.from(`:${PAT}`).toString('base64')}`, // Autenticação com PAT
  },
});

/**
 * @param {number} id - ID do Work Item
 * 
 * @return {void}
 */
async function getWorkItems(id) {
  try {
    const response = await azureClient.get(`/wit/workitems/${id}?api-version=7.0`);
    // console.dir(response.data.fields['Custom.HorasGastas']); // Mostra o valor do campo personalizado
    console.log(response.data); // Mostra o valor do campo personalizado
  } catch (error) {
    console.error('Erro ao buscar Work Items:', error.response?.data || error.message);
  }
}

/**
 * @param {number} workItemId - ID do Work Item
 * @param {string} fieldPath - Caminho do campo que será alterado
 * @param {any} newValue - Novo valor para o campo
 * 
 * @returns {void}
 */
async function updateWorkItem(workItemId, fieldPath, newValue) {
  try {
    const endpoint = `/wit/workitems/${workItemId}?api-version=7.0`;
    const payload = [
      {
        op: 'add', // Operação "add" para inserir ou atualizar o campo
        path: fieldPath,
        value: newValue,
      },
    ];

    // Faz a requisição PATCH
    const response = await azureClient.patch(endpoint, payload);
    console.log('Work Item atualizado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar Work Item:', error.response?.data || error.message);
  }
}

/**
 * @param {number} workItemId
 *  
 * @returns {void}
 */
async function getWorkItemWithChildren(workItemId) {
  try {
    // Busca o Work Item com as relações expandidas
    const response = await azureClient.get(
      `/wit/workitems/${workItemId}?api-version=7.0&$expand=relations`
    );

    // Exibe os detalhes do Work Item
    console.log('Detalhes do Work Item:', response.data);

    // Verifica se existem relações (filhos)
    const relations = response.data.relations || [];
    const children = relations.filter(rel => rel.rel === 'System.LinkTypes.Hierarchy-Forward');

    if (children.length === 0) {
      console.log('Este Work Item não tem itens filhos.');
      return;
    }

    console.log(`Este Work Item tem ${children.length} itens filhos.`);

    // Busca detalhes de cada filho
    for (const child of children) {
      const childId = child.url.split('/').pop(); // Extrai o ID do filho da URL
      const childResponse = await azureClient.get(`/wit/workitems/${childId}?api-version=7.0`);
      console.log(`Detalhes do filho ${childId}:`, childResponse.data);
    }
  } catch (error) {
    console.error('Erro ao buscar Work Item ou seus filhos:', error.response?.data || error.message);
  }
}

async function fetchWorkItemsByWIQL() {
  try {
    const payload = {
      "query": "SELECT [System.Id], [System.WorkItemType], [System.Title], [System.State] FROM workitems WHERE [System.TeamProject] = @project",
    };

    const response = await azureClient2.post(`/wit/wiql?api-version=7.0`, payload);

    // Retorna os IDs dos Work Items encontrados
    const workItemIds = response.data.workItems.map(item => item.id);
    console.log('IDs encontrados:', workItemIds);

    return workItemIds;
  } catch (error) {
    // console.error('Erro ao buscar Work Items com WIQL:', error.response?.data || error.message);
    console.log(error);
    return [];
  }
}

async function fetchWorkItemDetails(workItemIds) {
  try {
    const batches = [];
    for (let i = 0; i < workItemIds.length; i += 200) {
      const batch = workItemIds.slice(i, i + 200);
      batches.push(batch);
    }

    const allDetails = [];
    for (const batch of batches) {
      const response = await azureClient.post(
        `/wit/workitemsbatch?api-version=7.0`,
        {
          ids: batch,
          $expand: 'relations', // Expande as relações hierárquicas
        }
      );
      allDetails.push(...response.data.value);
    }

    return allDetails;
  } catch (error) {
    console.error('Erro ao buscar detalhes dos Work Items:', error.response?.data || error.message);
    return [];
  }
}

function organizeHierarchy(workItems) {
  const itemMap = new Map();

  // Cria um mapa para acesso rápido pelos IDs
  workItems.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Organiza os itens em hierarquia
  const hierarchy = [];

  workItems.forEach(item => {
    const relations = item.relations || [];
    relations.forEach(rel => {
      if (rel.rel === 'System.LinkTypes.Hierarchy-Forward') {
        const childId = parseInt(rel.url.split('/').pop(), 10);
        const childItem = itemMap.get(childId);
        if (childItem) {
          itemMap.get(item.id).children.push(childItem);
        }
      }
    });

    // Adiciona itens que não possuem pais diretamente à hierarquia principal
    const hasParent = relations.some(rel => rel.rel === 'System.LinkTypes.Hierarchy-Reverse');
    if (!hasParent) {
      hierarchy.push(itemMap.get(item.id));
    }
  });

  return hierarchy;
}


// Executa as funções
(async () => {
  const workItemId = 8;
  const fieldPath = '/fields/Custom.TotalHorasGastas';
  const newValue = 33;

  // console.log('Buscando Work Item antes da atualização:');
  // await getWorkItems(workItemId); // Obtém o valor atual do campo
  // await getWorkItemWithChildren(workItemId); // Obtém o valor atual do campo

  console.log('\nAtualizando o Work Item:');
  await updateWorkItem(workItemId, fieldPath, newValue); // Atualiza o valor do campo

  // console.log('\nBuscando Work Item após a atualização:');
  // await getWorkItems(workItemId); // Verifica se o valor foi atualizado
})();


// (async () => {
//   try {
//     // Passo 1: Busca os IDs dos Work Items
//     console.log('Buscando IDs dos Work Items...');
//     const workItemIds = await fetchWorkItemsByWIQL();

//     if (workItemIds.length === 0) {
//       console.log('Nenhum Work Item encontrado.');
//       return;
//     }

//     // Passo 2: Busca os detalhes dos Work Items
//     console.log('Buscando detalhes dos Work Items...');
//     const workItemDetails = await fetchWorkItemDetails(workItemIds);

//     // Passo 3: Organiza a hierarquia
//     console.log('Organizando hierarquia dos Work Items...');
//     const hierarchy = organizeHierarchy(workItemDetails);

//     // Exibe a hierarquia
//     console.log('Hierarquia organizada:');
//     console.dir(hierarchy, { depth: null });
//   } catch (error) {
//     console.error('Erro no processo:', error.message);
//   }
// })();
