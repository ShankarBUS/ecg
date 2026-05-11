export class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar) {
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector3(0, 0, 0);
        return new Vector3(this.x / len, this.y / len, this.z / len);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    direction() {
        // Spherical coordinates:
        // theta: inclination from z-axis
        // phi: azimuth from x-axis in x-y plane
        const theta = Math.atan2(Math.sqrt(this.x ** 2 + this.y ** 2), this.z);
        const phi = Math.atan2(this.y, this.x);
        return { theta, phi };
    }

    equals(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    static fromPoint(point) {
        return new Vector3(point.x, point.y, point.z);
    }
}

export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return new Vector2(this.x / len, this.y / len);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    direction() {
        return Math.atan2(this.y, this.x);
    }

    static fromPoint(point) {
        return new Vector2(point.x, point.y);
    }

    static fromDirectionAndLength(angle, length) {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}

export class Point {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    distanceTo(point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2 + (this.z - point.z) ** 2);
    }
}