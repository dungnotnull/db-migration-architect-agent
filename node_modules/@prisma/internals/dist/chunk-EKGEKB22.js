"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var chunk_EKGEKB22_exports = {};
__export(chunk_EKGEKB22_exports, {
  extractPreviewFeatures: () => extractPreviewFeatures
});
module.exports = __toCommonJS(chunk_EKGEKB22_exports);
var import_chunk_IOIAK7V7 = require("./chunk-IOIAK7V7.js");
var import_chunk_MCS5ZY6Y = require("./chunk-MCS5ZY6Y.js");
function extractPreviewFeatures(generators) {
  return generators.find((g) => (0, import_chunk_IOIAK7V7.parseEnvValue)(g.provider) === import_chunk_MCS5ZY6Y.BuiltInProvider.PrismaClientJs)?.previewFeatures || [];
}
