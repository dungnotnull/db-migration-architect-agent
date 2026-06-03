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
var chunk_GW4DY3IJ_exports = {};
__export(chunk_GW4DY3IJ_exports, {
  version: () => version
});
module.exports = __toCommonJS(chunk_GW4DY3IJ_exports);
var import_chunk_LVDRJ6D3 = require("./chunk-LVDRJ6D3.js");
var packageJson = (0, import_chunk_LVDRJ6D3.require_package)();
var version = packageJson.version;
