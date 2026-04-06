import { Vector3 } from '../Math.js';
import { ElectricalPath } from './ElectricalPath.js';

/**
 * Represents an electrical phase in the cardiac cycle.
 */
export class ElectricalPhase {
    /**
     * Creates an instance of ElectricalPhase.
     * @param {string} name - The name of the electrical phase.
     * @param {number} startTime - The start time of the phase in milliseconds.
     * @param {number} duration - The duration of the phase in milliseconds.
     * @param {ElectricalPath[]} paths - The electrical paths associated with the phase.
     */
    constructor(name, startTime, duration, paths) {
        this.name = name;
        this.startTime = startTime;
        this.duration = duration;
        this.paths = paths;
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
     * @param {boolean} normalize - Whether to normalize the resulting vector.
     * @returns {Vector3} The vector representing the direction and magnitude of the phase.
     */
    getVector(normalize = true) {
        if (!this.paths || this.paths.length === 0) return new Vector3(0, 0, 0);
        let resultant = new Vector3(0, 0, 0);
        this.paths.forEach(path => {
            const vector = new Vector3(path.endX - path.startX, path.endY - path.startY, 0);
            resultant = resultant.add(vector);
        });
        return normalize ? resultant.normalize().multiply(this.multiplier) : resultant;
    }
}
