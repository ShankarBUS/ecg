import { Point, Vector } from './Math.js';

/**
 * Represents a cardiac electrical cycle.
 */
export class CardiacElectricalCycle {
    /**
     * Creates an instance of CardiacElectricalCycle.
     * @param {string} name - The name of the cardiac electrical cycle.
     * @param {ElectricalPhase[]} phases - The phases of the cardiac electrical cycle.
     */
    constructor(name, phases) {
        this.name = name;
        this.phases = phases;
    }

    /**
     * The name of the cardiac electrical cycle.
     * @type {string}
     */
    name = '';

    /**
     * The phases of the cardiac electrical cycle.
     * @type {ElectricalPhase[]}
     */
    phases = [];

    /**
     * Creates a normal cardiac electrical cycle instance.
     * @returns {Promise<CardiacElectricalCycle>} A promise that resolves to the normal cardiac electrical cycle instance.
     */
    static async getNormalCycle() {
        const response = await fetch('./assets/data/normalCycle.json');
        const json = await response.json();
        return this.fromJson(json);
    }

    /**
     * Creates a normal cardiac electrical cycle instance from JSON data.
     * @param {Object} json - The JSON data representing the cardiac electrical cycle.
     * @return {CardiacElectricalCycle} The cardiac electrical cycle instance.
     */
    static fromJson(json) {
        let cycle = Object.assign(new CardiacElectricalCycle(), json);
        cycle.phases = json.phases.map(phase => {
            if (phase.startPoint) {
                phase.startPoint = new Point(phase.startPoint.x, phase.startPoint.y);
            }
            if (phase.endPoint) {
                phase.endPoint = new Point(phase.endPoint.x, phase.endPoint.y);
            }
            return Object.assign(new ElectricalPhase(), phase);
        });
        return cycle;
    }
}

/**
 * Represents an electrical phase in the cardiac cycle.
 */
export class ElectricalPhase {
    /**
     * Creates an instance of ElectricalPhase.
     * @param {string} name - The name of the electrical phase.
     * @param {number} startTime - The start time of the phase in milliseconds.
     * @param {number} duration - The duration of the phase in milliseconds.
     * @param {Point|null} [startPoint=null] - The starting point of the phase with dimensions in centimeters.
     * @param {Point|null} [endPoint=null] - The ending point of the phase with dimensions in centimeters.
     */
    constructor(name, startTime, duration, startPoint = null, endPoint = null) {
        this.name = name;
        this.startTime = startTime;
        this.duration = duration;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    /**
     * Calculates the vector from the start point to the end point of the phase.
     * @returns {Vector} The vector representing the direction and magnitude of the phase.
     */
    getVector() {
        return new Vector(this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y);
    }
}
