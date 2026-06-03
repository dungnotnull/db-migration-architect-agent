// src/index.ts
import { Debug } from "@prisma/debug";
import prismaSchemaWasm from "@prisma/prisma-schema-wasm";
import { JSONParser } from "@streamparser/json";
import pluralize from "pluralize";
var debug = Debug("prisma:getDMMF");
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
      prismaSchemaWasm.debug_panic();
    }
    data = prismaSchemaWasm.get_dmmf(params);
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
  if (typeof prismaSchemaWasm.get_dmmf_buffered !== "function") {
    return {
      type: "wasm-error",
      reason: "(get-dmmf-buffered wasm)",
      error: new Error(
        "Buffered DMMF API not available. It's required for schemas that do not fit within the default V8 memory limit. Ensure you are using latest @prisma/prisma-schema-wasm."
      )
    };
  }
  const buffer = prismaSchemaWasm.get_dmmf_buffered(params);
  try {
    const totalBytes = buffer.len();
    debug(`DMMF buffered: ${totalBytes} bytes (${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
    const parser = new JSONParser();
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
    plural: pluralize(uncapitalize(mapping.model)),
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
export {
  externalToInternalDmmf,
  getDMMF,
  getInternalDMMF,
  uncapitalize
};
