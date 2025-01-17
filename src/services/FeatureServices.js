const azureAxios = require('../config/azureConfig');
const PARAM_NAME_PBI = 'HorasGastas';
const PARAM_NAME_FEATURE = 'TotalHorasGastas';

async function getAllFeatures() {
    try {

        // WIQL para buscar todas as Features
        const query = {
            query: `SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] FROM WorkItems WHERE [System.WorkItemType] = 'Feature' ORDER BY [System.CreatedDate] DESC`,
        };
        // Faz a requisição para o endpoint WIQL
        const response = await azureAxios.post(
            `wit/wiql?api-version=7.0`,
            query,
            {
                headers: {
                    'Content-Type': 'application/json', // Content-Type correto
                },
            }
        );

        // Verifica se existem Features na resposta
        const workItems = response.data.workItems || [];
        if (workItems.length === 0) {
            return [];
        }

        // Faz uma chamada para obter os detalhes de cada Feature
        const featureDetails = [];
        for (const item of workItems) {
            const featureResponse = await azureAxios.get(
                `wit/workitems/${item.id}?api-version=7.0`
            );
            const featureData = featureResponse.data;

            // Adiciona os dados da Feature à lista
            featureDetails.push(featureData.id);
        }
        return featureDetails;

    } catch (error) {
        console.error('Erro ao recuperar Features:', error.response?.data || error.message);
        throw error;
    }
}

async function getPBIsByFeatureId(featureId) {
    try {

        const response = await azureAxios.get(`wit/workitems/${featureId}?api-version=7.0&$expand=relations`);
        const featureData = response.data;

        const relations = featureData.relations || [];
        if (relations.length === 0) {
            return [];
        }

        const relatedPBIs = relations.filter(relation => relation.rel === 'System.LinkTypes.Hierarchy-Forward');

        if (relatedPBIs.length === 0) {
            return [];
        }

        const pbiDetails = [];
        for (const pbi of relatedPBIs) {
            const pbiId = pbi.url.split('/').pop();
            const pbiResponse = await azureAxios.get(`wit/workitems/${pbiId}?api-version=7.0`);
            const pbiData = pbiResponse.data;

            pbiDetails.push({
                id: pbiData.id,
                usedHours: pbiData.fields[`Custom.${PARAM_NAME_PBI}`],
            });
        }
        return pbiDetails;

    } catch {
    }
}

async function updateFeature(obj) {
    try {
        const updatePayload = [
            {
                op: 'add',
                path: `/fields/Custom.${PARAM_NAME_FEATURE}`,
                value: obj.totalHoursOnFeature,
            },
        ];

        const response = await azureAxios.patch(
            `wit/workitems/${obj.featureId}?api-version=7.0`,
            updatePayload,
            {
                headers: {
                    'Content-Type': 'application/json-patch+json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar a Feature com ID ${obj.featureId}:`, error.response?.data || error.message);
        throw error;
    }
}

module.exports = { getAllFeatures, getPBIsByFeatureId, updateFeature };
