// metrics/coupling.js
function calculateCoupling(code) {
    const functionCallRegex = /\b\w+\s*\(.*\)/g;
    const externalFunctionCalls = new Set();
    
    const matches = code.match(functionCallRegex);
    if (matches) {
        matches.forEach(match => {
            externalFunctionCalls.add(match);
        });
    }

    return externalFunctionCalls.size;
}

module.exports = calculateCoupling;
