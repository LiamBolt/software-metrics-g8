// metrics/cyclomaticComplexity.js
function calculateCyclomaticComplexity(code) {
    const decisionKeywords = ['if', 'for', 'while', 'case', 'catch', '&&', '||', '?'];
    let complexity = 1; // Start from 1

    decisionKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = code.match(regex);
        if (matches) {
            complexity += matches.length;
        }
    });

    return complexity;
}

module.exports = calculateCyclomaticComplexity;
