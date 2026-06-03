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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  externalToInternalDmmf: () => externalToInternalDmmf,
  getDMMF: () => getDMMF,
  getInternalDMMF: () => getInternalDMMF,
  uncapitalize: () => uncapitalize
});
module.exports = __toCommonJS(index_exports);
var import_debug = require("@prisma/debug");
var import_prisma_schema_wasm = __toESM(require("@prisma/prisma-schema-wasm"));
var import_json = require("@streamparser/json");
var import_pluralize = __toESM(require("pluralize"));
var debug = (0, import_debug.Debug)("prisma:getDMMF");
function getDMMF(options) {
  debug(`Using getDmmf Wasm`);
  const params = JSON.stringify({
    prismaSchema: options.datamodel,
    noColor: Boolean(process.env.NO_COLOR)
  });
  let data;
  try {
    if (process.env.FORCE_PANIC_GET_DMMF) {
      debug("Triggering a Rust panic...");
      import_prisma_schema_wasm.default.debug_panic();
    }
    data = import_prisma_schema_wasm.default.get_dmmf(params);
  } catch (getDMMFErr) {
    if (isV8StringLimitError(getDMMFErr)) {
      debug("V8 string limit hit, falling back to buffered DMMF API");
      try {
        const data2 = getDMMFBuffered(params);
        debug("dmmf data retrieved via buffered API");
        return data2;
      } catch (getDMMFBufferedErr) {
        return {
          type: "wasm-error",
          reason: "(get-dmmf buffered wasm)",
          error: getDMMFBufferedErr
        };
      }
    }
    return {
      type: "wasm-error",
      reason: "(get-dmmf wasm)",
      error: getDMMFErr
    };
  }
  try {
    const document = JSON.parse(data);
    debug("dmmf data retrieved without errors in getDmmf Wasm");
    return document;
  } catch (err) {
    return {
      type: "parse-json",
      reason: "Unable to parse JSON",
      error: err
    };
  }
}
function getInternalDMMF(options) {
  const result = getDMMF(options);
  if ("error" in result) {
    return result;
  }
  return externalToInternalDmmf(result);
}
function externalToInternalDmmf(document) {
  return {
    ...document,
    mappings: getMappings(document.mappings, document.datamodel)
  };
}
function getDMMFBuffered(params) {
  const CHUNK_SIZE = 16 * 1024 * 1024;
  if (typeof import_prisma_schema_wasm.default.get_dmmf_buffered !== "function") {
    return {
      type: "wasm-error",
      reason: "(get-dmmf-buffered wasm)",
      error: new Error(
        "Buffered DMMF API not available. It's required for schemas that do not fit within the default V8 memory limit. Ensure you are using latest @prisma/prisma-schema-wasm."
      )
    };
  }
  const buffer = import_prisma_schema_wasm.default.get_dmmf_buffered(params);
  try {
    const totalBytes = buffer.len();
    debug(`DMMF buffered: ${totalBytes} bytes (${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
    const parser = new import_json.JSONParser();
    let result;
    parser.onValue = ({ value, stack }) => {
      if (stack.length === 0 && value !== void 0) {
        result = value;
      }
    };
    let offset = 0;
    while (offset < totalBytes) {
      const len = Math.min(CHUNK_SIZE, totalBytes - offset);
      const chunk = buffer.read_chunk(offset, len);
      parser.write(chunk);
      offset += len;
    }
    if (result === void 0) {
      return {
        type: "parse-json",
        reason: "(get-dmmf-buffered parse)",
        error: new Error("Streaming JSON parse produced no result")
      };
    }
    debug(`DMMF parsed via streaming parser (${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
    return result;
  } finally {
    buffer.free();
  }
}
function isV8StringLimitError(error) {
  return error instanceof Error && "code" in error && error.code === "ERR_STRING_TOO_LONG";
}
function getMappings(mappings, datamodel) {
  const modelOperations = mappings.modelOperations.filter((mapping) => {
    const model = datamodel.models.find((m) => m.name === mapping.model);
    if (!model) {
      throw new Error(`Mapping without model ${mapping.model}`);
    }
    return model.fields.some((f) => f.kind !== "object");
  }).map((mapping) => ({
    model: mapping.model,
    plural: (0, import_pluralize.default)(uncapitalize(mapping.model)),
    findUnique: mapping.findUnique || mapping.findSingle,
    findUniqueOrThrow: mapping.findUniqueOrThrow,
    findFirst: mapping.findFirst,
    findFirstOrThrow: mapping.findFirstOrThrow,
    findMany: mapping.findMany,
    create: mapping.createOne || mapping.createSingle || mapping.create,
    createMany: mapping.createMany,
    createManyAndReturn: mapping.createManyAndReturn,
    delete: mapping.deleteOne || mapping.deleteSingle || mapping.delete,
    update: mapping.updateOne || mapping.updateSingle || mapping.update,
    deleteMany: mapping.deleteMany,
    updateMany: mapping.updateMany,
    updateManyAndReturn: mapping.updateManyAndReturn,
    upsert: mapping.upsertOne || mapping.upsertSingle || mapping.upsert,
    aggregate: mapping.aggregate,
    groupBy: mapping.groupBy,
    findRaw: mapping.findRaw,
    aggregateRaw: mapping.aggregateRaw
  }));
  return {
    modelOperations,
    otherOperations: mappings.otherOperations
  };
}
function uncapitalize(self) {
  return self.substring(0, 1).toLowerCase() + self.substring(1);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  externalToInternalDmmf,
  getDMMF,
  getInternalDMMF,
  uncapitalize
});
