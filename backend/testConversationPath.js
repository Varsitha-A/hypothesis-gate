const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "models");
console.log("models folder:", p);
console.log("files:", fs.readdirSync(p));
