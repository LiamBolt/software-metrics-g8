// metrics/cohesion.js
function calculateCohesion(code) {
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{([\s\S]*?)}/g;
    const variableRegex = /\b(\w+)\b/g;

    const functions = [];
    let match;
    
    // Find all functions
    while ((match = functionRegex.exec(code)) !== null) {
        const functionName = match[1];
        const functionBody = match[2];
        const variables = [];
        
        // Find all variables in the function
        let variableMatch;
        while ((variableMatch = variableRegex.exec(functionBody)) !== null) {
            variables.push(variableMatch[1]);
        }

        functions.push({ functionName, variables });
    }

    // Calculate cohesion based on shared variables
    let sharedVariables = 0;
    for (let i = 0; i < functions.length; i++) {
        for (let j = i + 1; j < functions.length; j++) {
            const shared = functions[i].variables.filter(variable => functions[j].variables.includes(variable)).length;
            sharedVariables += shared;
        }
    }

    return sharedVariables;
}

module.exports = calculateCohesion;
