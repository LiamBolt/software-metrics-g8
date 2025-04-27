// metrics/index.js
const calculateCyclomaticComplexity = require('./cyclomaticComplexity');
const calculateNestingDepth = require('./nestingDepth');
const calculateCohesion = require('./cohesion');
const calculateCoupling = require('./coupling');
const calculateInformationFlow = require('./informationFlow');

module.exports = {
    calculateCyclomaticComplexity,
    calculateNestingDepth,
    calculateCohesion,
    calculateCoupling,
    calculateInformationFlow
};
