import { Point, Vector } from './Math.js';

/**
 * Represents a cardiac electrical cycle.
 */
export class CardiacElectricalCycle {
    /**
     * Creates an instance of CardiacElectricalCycle.
     * @param {string} name - The name of the cardiac electrical cycle.
     * @param {number} duration - The duration of the cardiac electrical cycle in milliseconds.
     * @param {ElectricalPhase[]} phases - The phases of the cardiac electrical cycle.
     */
    constructor(name, duration, phases) {
        this.name = name;
        this.duration = duration;
        this.phases = phases;
    }

    /**
     * The name of the cardiac electrical cycle.
     * @type {string}
     */
    name = '';

    /**
     * The duration of the cardiac electrical cycle in milliseconds.
     * @type {number}
     */
    duration = 0;

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
        const response = await fetch('./assets/data/cycle-NRML.json');
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
     * @param {Point|null} [startPoint=null] - The starting point of the net vector of the phase with dimensions in centimeters.
     * @param {Point|null} [endPoint=null] - The ending point of the net vector of the phase with dimensions in centimeters.
     */
    constructor(name, startTime, duration, startPoint = null, endPoint = null) {
        this.name = name;
        this.startTime = startTime;
        this.duration = duration;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    /**
     * The name of the corresponding wave of this electrical phase in Lead II.
     * @type {string}
     */
    nameInLead2 = '';

    /**
     * The type of the electrical phase (i.e. 'spike' or 'smooth').
     * @type {string}
     */
    type = '';

    /**
     * The amplitude multiplier.
     * @type {number}
     */
    multiplier = 1;

    /**
     * Calculates the vector from the start point to the end point of the phase.
     * @returns {Vector} The vector representing the direction and magnitude of the phase.
     */
    getVector() {
        if (!this.endPoint || !this.startPoint) return new Vector(0, 0);
        return new Vector(this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y)
            .normalize().multiply(this.multiplier);
    }
}
