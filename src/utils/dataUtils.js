function validateWorkItem(workItem) {
    return workItem && workItem.id && workItem.fields;
}

module.exports = { validateWorkItem };
