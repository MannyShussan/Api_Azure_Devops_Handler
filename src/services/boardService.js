const { getPBIs, updatePBI } = require('./workItemService');
const { getTaskIdsByPBI, getTaskDetailsById } = require('./TaskService');
const { getAllFeatures, getPBIsByFeatureId, updateFeature } = require('./featureServices');

async function updateWorkedTime() {

    

    await updatePbis().then(responses => {
        for (const response of responses) {
            updatePBI(response);
        }
    });

    await updateFeatures().then(responses => {
        for (const response of responses) {
            updateFeature(response);
        }
    });
}


async function updateFeatures() {
    try {
        const features = await getAllFeatures();
        const workItem = [];

        for (const feature of features) {
            const pbis = await getPBIsByFeatureId(feature);
            const val = pbis.reduce((sum, pbi) => sum + pbi.usedHours, 0);
            const obj = {
                featureId: feature,
                totalHoursOnFeature: val,
            };
            workItem.push(obj);
        }

        return new Promise((res, rej) => {
            try { res(workItem); }
            catch { rej('erro ao executar função') }
        });
    } catch {
    }
}

async function updatePbis() {
    try {
        const pbis = await getPBIs();
        const arr = [];

        for (const pbi of pbis) {
            const tasks = await getTaskIdsByPBI(pbi);
            const arrTask = [];

            for (const task of tasks) {
                arrTask.push(await getTaskDetailsById(task));
            }

            arr.push({
                pbiId: pbi,
                totalHoursonPbi: arrTask.reduce((sum, t) => sum + t.usedHours, 0),
            });
        }

        return new Promise((res, rej) => {
            try { res(arr) }
            catch { rej('erro ao executar função') }
        });
    } catch {

    }
}

module.exports = { updateWorkedTime };