export class ElectricalPath {

    /**
     * Creates an instance of ElectricalPath.
     * @param {number} startX - The starting X coordinate of the electrical path in centimeters.
     * @param {number} startY - The starting Y coordinate of the electrical path in centimeters.
     * @param {number} endX - The ending X coordinate of the electrical path in centimeters.
     * @param {number} endY - The ending Y coordinate of the electrical path in centimeters.
     */
    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }

    /**
     * The starting X coordinate of the electrical path in centimeters.
     * @type {number}
     */
    startX = 0;

    /**
     * The starting Y coordinate of the electrical path in centimeters.
     * @type {number}
     */
    startY = 0;

    /**
     * The ending X coordinate of the electrical path in centimeters.
     * @type {number}
     */
    endX = 0;

    /**
     * The ending Y coordinate of the electrical path in centimeters.
     * @type {number}
     */
    endY = 0;

    /**
     * Creates an ElectricalPath instance from a string representation.
     * @param {string} str - The string representation of the electrical path in the format "startX,startY,endX,endY".
     * @returns {ElectricalPath} The ElectricalPath instance created from the string.
     */
    static fromString(str) {
        const [startX, startY, endX, endY] = str.split(',').map(Number);
        return new ElectricalPath(startX, startY, endX, endY);
    }
}