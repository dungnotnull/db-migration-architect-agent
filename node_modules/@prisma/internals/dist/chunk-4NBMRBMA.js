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
var chunk_4NBMRBMA_exports = {};
__export(chunk_4NBMRBMA_exports, {
  GetDmmfError: () => GetDmmfError,
  externalToInternalDmmf: () => import_get_dmmf2.externalToInternalDmmf,
  getDMMF: () => getDMMF,
  getInternalDMMF: () => getInternalDMMF
});
module.exports = __toCommonJS(chunk_4NBMRBMA_exports);
var import_chunk_IL7PSY44 = require("./chunk-IL7PSY44.js");
var import_chunk_WSZXPLJQ = require("./chunk-WSZXPLJQ.js");
var import_chunk_PHNHT4MK = require("./chunk-PHNHT4MK.js");
var import_chunk_XKZ6CBLA = require("./chunk-XKZ6CBLA.js");
var import_chunk_LMVSIVKQ = require("./chunk-LMVSIVKQ.js");
var import_chunk_PG5FDKSF = require("./chunk-PG5FDKSF.js");
var import_debug = __toESM(require("@prisma/debug"));
var import_get_dmmf = require("@prisma/get-dmmf");
var import_get_dmmf2 = require("@prisma/get-dmmf");
var debug = (0, import_debug.default)("prisma:getDMMF");
var debugErrorType = (0, import_chunk_WSZXPLJQ.createDebugErrorType)(debug, "getDmmfWasm");
var GetDmmfError = class extends Error {
  constructor(params) {
    const constructedErrorMessage = (0, import_chunk_XKZ6CBLA.z)(params).with({ _tag: "parsed" }, ({ errorCode, message, reason }) => {
      const errorCodeMessage = errorCode ? `Error code: ${errorCode}` : "";
      return `${reason}
${errorCodeMessage}
${message}`;
    }).with({ _tag: "unparsed" }, ({ message, reason }) => {
      const detailsHeader = (0, import_chunk_PG5FDKSF.red)((0, import_chunk_PG5FDKSF.bold)("Details:"));
      return `${reason}
${detailsHeader} ${message}`;
    }).exhaustive();
    const errorMessageWithContext = `${constructedErrorMessage}
[Context: getDmmf]`;
    super((0, import_chunk_PHNHT4MK.addVersionDetailsToErrorMessage)(errorMessageWithContext));
    this.name = "GetDmmfError";
  }
};
async function getDMMF(options) {
  return Promise.resolve(handleGetDmmfResult((0, import_get_dmmf.getDMMF)(options)));
}
async function getInternalDMMF(options) {
  return Promise.resolve(handleGetDmmfResult((0, import_get_dmmf.getInternalDMMF)(options)));
}
function handleGetDmmfResult(result) {
  if ("error" in result) {
    debugErrorType(result);
    switch (result.type) {
      case "wasm-error":
        throw mapWasmPanicToGetDmmfError(result.error, result.reason);
      case "parse-json":
        throw new GetDmmfError({ _tag: "unparsed", message: result.error.message, reason: result.reason });
      default:
        (0, import_chunk_IL7PSY44.assertNever)(result.type, "Unknown getDmmf error type");
    }
  } else {
    return result;
  }
}
function mapWasmPanicToGetDmmfError(error, reason) {
  if ((0, import_chunk_LMVSIVKQ.isWasmPanic)(error)) {
    const { message, stack } = (0, import_chunk_LMVSIVKQ.getWasmError)(error);
    const panic = new import_chunk_LMVSIVKQ.RustPanic(
      /* message */
      message,
      /* rustStack */
      stack,
      /* request */
      "@prisma/prisma-schema-wasm get_dmmf",
      "FMT_CLI"
      /* FMT_CLI */
    );
    return panic;
  }
  const errorOutput = error.message;
  return new GetDmmfError((0, import_chunk_WSZXPLJQ.parseQueryEngineError)({ errorOutput, reason }));
}
