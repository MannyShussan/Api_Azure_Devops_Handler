function applyBusinessRules(workItem) {
    if (workItem.title.includes('Urgente')) {
        return { 'System.State': 'In Progress' };
    }
    return null;
}

module.exports = { applyBusinessRules };
