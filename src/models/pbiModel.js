class PBI {

    /**
     * @param {number} id 
     * @param {string} title 
     * @param {string} state 
     * @param {Task} task 
     */
    constructor(id, title, state, task = []) {
        this.id = id;
        this.title = title;
        this.state = state;
        this.task = task;
    }
}

module.exports = { PBI };