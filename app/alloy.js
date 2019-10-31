// Extends Alloy https://github.com/jasonkneen/AlloyXL
require("alloyXL");

// provides on-the-fly collections https://github.com/jasonkneen/reste
Alloy.Globals.reste = require("reste")();

// create a base collection to use for location updaes
Alloy.Globals.reste.createCollection("locationChanges", []);