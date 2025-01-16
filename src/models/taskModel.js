class Task {

    /**
     * @param {number} id 
     * @param {string} title 
     * @param {string} state 
     * @param {number} workedHous 
     */
    constructor(id, title, state, workedHous = 0) {
        this.id = id;
        this.title = title;
        this.state = state;
        this.workedHous = workedHous;
    }
}

module.exports = { Task };