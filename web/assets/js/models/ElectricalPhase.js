import { Vector } from '../Math.js';

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
