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
var fs_functional_exports = {};
__export(fs_functional_exports, {
  createDirIfNotExists: () => import_chunk_QVJ2BXKF.createDirIfNotExists,
  getFilesInDir: () => import_chunk_QVJ2BXKF.getFilesInDir,
  getNestedFoldersInDir: () => import_chunk_QVJ2BXKF.getNestedFoldersInDir,
  removeDir: () => import_chunk_QVJ2BXKF.removeDir,
  removeEmptyDirs: () => import_chunk_QVJ2BXKF.removeEmptyDirs,
  removeFile: () => import_chunk_QVJ2BXKF.removeFile,
  writeFile: () => import_chunk_QVJ2BXKF.writeFile
});
module.exports = __toCommonJS(fs_functional_exports);
var import_chunk_QVJ2BXKF = require("../chunk-QVJ2BXKF.js");
var import_chunk_K2EOOA2X = require("../chunk-K2EOOA2X.js");
var import_chunk_J77ZIDXB = require("../chunk-J77ZIDXB.js");
var import_chunk_R6QH57HZ = require("../chunk-R6QH57HZ.js");
var import_chunk_JPZYSRK3 = require("../chunk-JPZYSRK3.js");
var import_chunk_4VNS5WPM = require("../chunk-4VNS5WPM.js");
