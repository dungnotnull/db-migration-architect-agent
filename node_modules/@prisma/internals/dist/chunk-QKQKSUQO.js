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
var chunk_QKQKSUQO_exports = {};
__export(chunk_QKQKSUQO_exports, {
  ConfigValidationError: () => ConfigValidationError,
  validatePrismaConfigWithDatasource: () => validatePrismaConfigWithDatasource
});
module.exports = __toCommonJS(chunk_QKQKSUQO_exports);
var import_chunk_ANU3HEGF = require("./chunk-ANU3HEGF.js");
var import_chunk_PG5FDKSF = require("./chunk-PG5FDKSF.js");
var ConfigValidationError = class extends Error {
  constructor(message) {
    super(message);
  }
};
(0, import_chunk_ANU3HEGF.setClassName)(ConfigValidationError, "ConfigValidationError");
function isValidPrismaConfig(prismaConfig) {
  return prismaConfig.datasource !== void 0 && typeof prismaConfig.datasource.url === "string";
}
function validatePrismaConfigWithDatasource({
  config,
  cmd
}) {
  if (!isValidPrismaConfig(config)) {
    throw new ConfigValidationError(
      `The ${(0, import_chunk_PG5FDKSF.red)(`datasource.url`)} property is required in your Prisma config file when using ${(0, import_chunk_PG5FDKSF.green)(`prisma ${cmd}`)}.`
    );
  }
  return config;
}
