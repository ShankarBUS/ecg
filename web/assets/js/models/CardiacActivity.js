import { CardiacElectricalCycle } from './CardiacElectricalCycle.js';

/**
 * Represents a set of cardiac electrical cycles that collectively define cardiac activity.
 */

export class CardiacActivity {
    /**
     * Creates an instance of CardiacActivity.
     * @param {string} name - The name of the cardiac activity.
     * @param {number} duration - The total duration of the cardiac activity in milliseconds.
     * @param {CardiacElectricalCycle[]} cycles - The distinct cardiac electrical cycles in the activity.
     */
    constructor(name, duration, cycles = []) {
        this.name = name;
        this.duration = duration;
        this.cycles = cycles;
    }

    /**
     * The name of the cardiac activity.
     * @type {string}
     */
    name = '';

    /**
     * The description of the cardiac activity.
     * @type {string}
     * @default ''
     */
    description = '';

    /**
     * The total duration of the cardiac activity in milliseconds.
     * @type {number}
     */
    duration = 0;

    /**
     * The distinct cardiac electrical cycles in the activity.
     * @type {CardiacElectricalCycle[]}
     */
    cycles = [];

    /**
     * Adds a cardiac electrical cycle to the activity.
     * @param {CardiacElectricalCycle} cycle - The cardiac electrical cycle to add.
     */
    addCycle(cycle) {
        this.cycles.push(cycle);
        this.duration += cycle.duration; // Update total duration
    }
}
