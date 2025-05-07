import { ElectricalPhase } from './ElectricalPhase.js';
import { Point } from '../Math.js';

/**
 * Represents a single cardiac electrical cycle.
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
     * Adds an electrical phase to the cycle.
     * @param {ElectricalPhase} phase - The electrical phase to add.
     */
    addPhase(phase) {
        this.phases.push(phase);
        this.duration += phase.duration;
    }

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
