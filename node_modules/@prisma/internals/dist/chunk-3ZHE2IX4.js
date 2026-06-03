"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var chunk_3ZHE2IX4_exports = {};
__export(chunk_3ZHE2IX4_exports, {
  getGeneratorSuccessMessage: () => getGeneratorSuccessMessage
});
module.exports = __toCommonJS(chunk_3ZHE2IX4_exports);
var import_chunk_XYCIH36R = require("./chunk-XYCIH36R.js");
var import_chunk_IOIAK7V7 = require("./chunk-IOIAK7V7.js");
var import_chunk_PG5FDKSF = require("./chunk-PG5FDKSF.js");
var import_chunk_MCS5ZY6Y = require("./chunk-MCS5ZY6Y.js");
var import_path = __toESM(require("path"));
function getGeneratorSuccessMessage(generator, time) {
  const name = generator.getPrettyName();
  const version = formatVersion(generator);
  const to = formatOutput(generator);
  return `\u2714 Generated ${(0, import_chunk_PG5FDKSF.bold)(name)}${version ? ` (${version})` : ""}${to} in ${(0, import_chunk_XYCIH36R.formatms)(time)}`;
}
function formatVersion(generator) {
  const version = generator.manifest?.version;
  if (generator.getProvider() === import_chunk_MCS5ZY6Y.BuiltInProvider.PrismaClientJs) {
    return `v${version ?? "?.?.?"}`;
  }
  return version;
}
function formatOutput(generator) {
  const output = generator.options?.generator.output;
  return output ? (0, import_chunk_PG5FDKSF.dim)(` to .${import_path.default.sep}${import_path.default.relative(process.cwd(), (0, import_chunk_IOIAK7V7.parseEnvValue)(output))}`) : "";
}
