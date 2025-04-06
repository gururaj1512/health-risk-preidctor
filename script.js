import path from 'path';
import { fileURLToPath } from 'url';
import readFile from '@stdlib/fs/read-file/lib/index.js';
import dmean from '@stdlib/stats/base/dmean/lib/index.js';
import dstdev from '@stdlib/stats/base/dstdev/lib/index.js';
import dnrm2 from '@stdlib/blas/base/dnrm2/lib/index.js';
import drange from '@stdlib/stats/base/drange/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const filePath = path.join(dirName, 'python', 'waveform_data.csv');
const fileData = readFile.sync(filePath, { encoding: 'utf8' });

const lines = fileData.split('\n');
const numbers = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line !== '' && !isNaN(Number(line))) {
        numbers.push(Number(line));
    }
}
const readings = new Float64Array(numbers);

const deviationThreshold = 2;
const suddenChangeThreshold = 40;
const overallChangeThreshold = 40;

function findAnomalies(data) {
    const mean = dmean(data.length, data, 1);
    const stdDev = dstdev(data.length, 1, data, 1);

    const anomalies = [];
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i] - mean) > deviationThreshold * stdDev) {
            anomalies.push(data[i]);
        }
    }

    console.log("\nMean:", mean.toFixed(2), "| Std Dev:", stdDev.toFixed(2));
    console.log("Anomalies:", anomalies.length > 0 ? anomalies : "None");
    return anomalies;
}

function detectMaxChange(readings) {
    const maxChange = drange(readings.length, readings, 1);
    console.log(`Max Change: ${maxChange}`);

    if (maxChange > overallChangeThreshold) {
        console.log("ALERT: Significant sudden change detected!");
        return true;
    }
    return false;
}

function findSuddenChanges(data) {
    let suddenChange = false;
    let previousNorm = dmean(data.length, data, 1);

    for (let i = 1; i <= data.length; i++) {
        const currentNorm = dnrm2(i, data, 1);

        if (Math.abs(currentNorm - previousNorm) > suddenChangeThreshold) {
            console.log(`Alert: Sudden change at index ${i - 1} (Norm: ${previousNorm.toFixed(2)} → ${currentNorm.toFixed(2)})`);
            suddenChange = true;
        }

        previousNorm = currentNorm;
    }

    if (!suddenChange) {
        console.log("No sudden changes detected.");
    }

    return suddenChange;
}

function monitor() {
    console.log("\nChecking vitals...");
    findAnomalies(readings);
    detectMaxChange(readings);
    findSuddenChanges(readings);
    console.log("Monitoring complete.\n");
}

monitor();
