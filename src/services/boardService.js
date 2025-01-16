const { getPBIs, getPBIById } = require('./workItemService');
const { getTaskIdsByPBI, getTaskDetailsById } = require('./TaskService');
const { getAllFeatures, getPBIsByFeatureId } = require('./FeatureServices');

async function updateWorkedTime() {
    let featureUpdated;
    await updateFeatures().then(response => featureUpdated = response);

    console.log(featureUpdated);

    // await updatePbisBoard();

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
                totoalHoursOnFeature: val
            };
            workItem.push(obj);
        }

        return new Promise((res, rej) => {
            try { res(workItem); }
            catch { rej('erro ao executar função') }
        });
    } catch (error) {
        console.log('Erro ao tentar recuperar as features');
    }
}

async function updatePbisBoard() {
    try {
        console.log("cheguei aqui");
        const pbi = await getPBIs();
        // console.log(pbi);
        return;
    } catch {

    }
}

async function updatePbis() {
    try {

    } catch {

    }
}

module.exports = { updateWorkedTime };