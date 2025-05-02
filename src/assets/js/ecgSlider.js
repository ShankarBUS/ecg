let ecgData = null;
let currentPhase = 0;
let ecgPoints = null;
let ecgWidth = 200;
let ecgHeight = 100;
const ecgSlider = document.getElementById('ecgSlider');
const ecgCanvas = document.getElementById('ecgWaveCanvas');
const ecgPointer = document.getElementById('ecgPointer');
const ecgContext = ecgCanvas.getContext('2d');

async function setupEcgSlider() {
    ecgData = await fetchEcgData();
    const width = ecgCanvas.width = ecgWidth;
    const height = ecgCanvas.height = ecgHeight;
    ecgSlider.style.width = `${width}px`;
    ecgSlider.style.height = `${height}px`;
    ecgPoints = generateEcgPoints(width, height);
    drawECGWave();
    movePointer();
    ecgSlider.addEventListener('input', updateEcgPhase);
}

async function fetchEcgData() {
    const response = await fetch('./assets/data/lead2Data.json');
    return response.json();
}

function generateEcgPoints(width, height) {
    const waves = ecgData.waves;
    const totalDuration = waves.reduce((sum, wave) => sum + wave.duration, 0);
    const scaleX = width / totalDuration;
    const centerY = height * 0.6;
    const amplitudeFactor = height / 4;

    let currentX = 0;
    const points = [];

    waves.forEach((wave) => {
        if (wave.type === 'smooth') {
            for (let x = 0; x < wave.duration * scaleX; x++) {
                const y = centerY - (wave.amplitude * amplitudeFactor) * Math.sin((Math.PI * x) / (wave.duration * scaleX));
                points.push({ x: currentX + x, y });
            }
        } else if (wave.type === 'spike') {
            points.push({ x: currentX + (wave.duration * scaleX) / 2, y: centerY - (wave.amplitude * amplitudeFactor) });
        } else if (wave.type === 'flat') {
            points.push({ x: currentX, y: centerY - (wave.amplitude * amplitudeFactor) });
            points.push({ x: currentX + (wave.duration * scaleX), y: centerY - (wave.amplitude * amplitudeFactor) });
        }
        currentX += wave.duration * scaleX;
    });

    return points;
}

function drawECGWave() {
    ecgContext.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    ecgContext.beginPath();

    ecgPoints.forEach((point, index) => {
        if (index === 0) {
            ecgContext.moveTo(point.x, point.y);
        } else {
            ecgContext.lineTo(point.x, point.y);
        }
    });

    ecgContext.strokeStyle = 'red';
    ecgContext.lineWidth = 2;
    ecgContext.stroke();
    ecgContext.closePath();
}

function movePointer() {
    const x = ecgSlider.value / ecgSlider.max * ecgCanvas.width;
    const y = getYValueFromSlider(x);
    ecgPointer.style.left = `${x - 5}px`;
    ecgPointer.style.top = `${y - 5}px`;
}

function getYValueFromSlider(x) {
    const pointIndex = ecgPoints.findIndex(point => point.x >= x);

    if (pointIndex == -1) {
        return ecgPoints[ecgPoints.length - 1].y;
    }

    if (pointIndex == 0 || ecgPoints[pointIndex].x == x) {
        return ecgPoints[pointIndex].y;
    }
    
    const prevPoint = ecgPoints[pointIndex - 1];
    const nextPoint = ecgPoints[pointIndex];
    const slope = (nextPoint.y - prevPoint.y) / (nextPoint.x - prevPoint.x);
    return prevPoint.y + slope * (x - prevPoint.x);
}

function updateEcgPhase() {
    currentPhase = ecgSlider.value;
    movePointer();
}

export { setupEcgSlider };