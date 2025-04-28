const metrics = require('./metrics');

const codeSnippet = `function example() {
    if (true) {
        for (let i = 0; i < 10; i++) {
            console.log(i);
        }
    }
}`;

const cyclomaticComplexity = metrics.calculateCyclomaticComplexity(codeSnippet);
console.log("Cyclomatic Complexity:", cyclomaticComplexity);

const nestingDepth = metrics.calculateNestingDepth(codeSnippet);
console.log("Nesting Depth:", nestingDepth);

const cohesion = metrics.calculateCohesion(codeSnippet);
console.log("Cohesion:", cohesion);

const coupling = metrics.calculateCoupling(codeSnippet);
console.log("Coupling:", coupling);

const infoFlow = metrics.calculateInformationFlow(codeSnippet);
console.log("Information Flow Complexity:", infoFlow);
