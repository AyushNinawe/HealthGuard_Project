// The API source is CommonJS, while the Hardhat 3 root is ESM. This bootstrap
// loads the existing API modules as CommonJS without changing the Hardhat setup.
const fs = require("fs");
const Module = require("module");
const originalLoader = Module._extensions[".js"];
Module._extensions[".js"] = (module, filename) => {
    if (filename.endsWith("/services/blockchainService.js")) {
        return originalLoader(module, filename);
    }
    return module._compile(fs.readFileSync(filename, "utf8"), filename);
};
require("./server.js");
