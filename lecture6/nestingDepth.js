// metrics/nestingDepth.js
function calculateNestingDepth(code) {
    let maxDepth = 0;
    let currentDepth = 0;

    const lines = code.split('\n');
    
    lines.forEach(line => {
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;

        currentDepth += openBraces;
        currentDepth -= closeBraces;

        maxDepth = Math.max(maxDepth, currentDepth);
    });

    return maxDepth;
}

module.exports = calculateNestingDepth;
