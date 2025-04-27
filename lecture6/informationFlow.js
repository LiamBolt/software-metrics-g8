// metrics/informationFlow.js
function calculateInformationFlow(code) {
    const functionCallRegex = /\b\w+\s*\(.*\)/g;
    let fanIn = 0;
    let fanOut = 0;

    const matches = code.match(functionCallRegex);
    if (matches) {
        fanOut = matches.length;
        fanIn = matches.filter(match => match.includes('return')).length;  // Assumes fan-in is based on return statements
    }

    return { fanIn, fanOut, totalFlow: fanIn + fanOut };
}

module.exports = calculateInformationFlow;
