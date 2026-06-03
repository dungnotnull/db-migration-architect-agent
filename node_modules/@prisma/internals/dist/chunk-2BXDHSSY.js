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
var chunk_2BXDHSSY_exports = {};
__export(chunk_2BXDHSSY_exports, {
  createSchemaPathInput: () => createSchemaPathInput,
  getCliProvidedSchemaFile: () => getCliProvidedSchemaFile,
  getConfigProvidedSchemaFile: () => getConfigProvidedSchemaFile,
  getSchemaWithPath: () => getSchemaWithPath,
  getSchemaWithPathOptional: () => getSchemaWithPathOptional,
  printSchemaLoadedMessage: () => printSchemaLoadedMessage
});
module.exports = __toCommonJS(chunk_2BXDHSSY_exports);
var import_chunk_PG5FDKSF = require("./chunk-PG5FDKSF.js");
var import_debug = require("@prisma/debug");
var import_schema_files_loader = require("@prisma/schema-files-loader");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_util = require("util");
var readFile = (0, import_util.promisify)(import_fs.default.readFile);
var stat = (0, import_util.promisify)(import_fs.default.stat);
var debug = (0, import_debug.Debug)("prisma:getSchema");
function createSchemaPathInput({
  schemaPathFromArgs,
  schemaPathFromConfig,
  baseDir
}) {
  return schemaPathFromArgs ? { cliProvidedPath: schemaPathFromArgs } : schemaPathFromConfig ? { configProvidedPath: schemaPathFromConfig } : { baseDir };
}
async function getSchemaWithPath({
  schemaPath,
  cwd = process.cwd(),
  argumentName = "--schema"
}) {
  const result = await getSchemaWithPathInternal({ schemaPath, cwd, argumentName });
  if (result.ok) {
    return result.schema;
  }
  throw new Error(renderDefaultLookupError(result.error, cwd));
}
async function getSchemaWithPathOptional({
  schemaPath,
  cwd = process.cwd(),
  argumentName = "--schema"
}) {
  const result = await getSchemaWithPathInternal({ schemaPath, cwd, argumentName });
  if (result.ok) {
    return result.schema;
  }
  return null;
}
function printSchemaLoadedMessage(schemaPath) {
  process.stderr.write((0, import_chunk_PG5FDKSF.dim)(`Prisma schema loaded from ${import_path.default.relative(process.cwd(), schemaPath)}.`) + "\n");
}
async function readSchemaFromSingleFile(schemaPath) {
  debug("Reading schema from single file", schemaPath);
  const typeError = await (0, import_schema_files_loader.ensureType)(schemaPath, "file");
  if (typeError) {
    return { ok: false, error: typeError };
  }
  const file = await readFile(schemaPath, { encoding: "utf-8" });
  const schemaTuple = [schemaPath, file];
  return {
    ok: true,
    schema: { schemaPath, schemaRootDir: import_path.default.dirname(schemaPath), schemas: [schemaTuple] }
  };
}
async function readSchemaFromDirectory(schemaPath) {
  debug("Reading schema from multiple files", schemaPath);
  const typeError = await (0, import_schema_files_loader.ensureType)(schemaPath, "directory");
  if (typeError) {
    return { ok: false, error: typeError };
  }
  const files = await (0, import_schema_files_loader.loadSchemaFiles)(schemaPath);
  return { ok: true, schema: { schemaPath, schemaRootDir: schemaPath, schemas: files } };
}
async function readSchemaFromFileOrDirectory(schemaPath) {
  let stats;
  try {
    stats = await stat(schemaPath);
  } catch (e) {
    if (e.code === "ENOENT") {
      return { ok: false, error: { kind: "NotFound", path: schemaPath } };
    }
    throw e;
  }
  if (stats.isFile()) {
    return readSchemaFromSingleFile(schemaPath);
  }
  if (stats.isDirectory()) {
    return readSchemaFromDirectory(schemaPath);
  }
  return { ok: false, error: { kind: "WrongType", path: schemaPath, expectedTypes: ["file", "directory"] } };
}
async function getSchemaWithPathInternal({
  schemaPath,
  cwd,
  argumentName
}) {
  if ("cliProvidedPath" in schemaPath) {
    return {
      ok: true,
      schema: await getCliProvidedSchemaFile(schemaPath.cliProvidedPath, cwd, argumentName)
    };
  }
  if ("configProvidedPath" in schemaPath) {
    return {
      ok: true,
      schema: await getConfigProvidedSchemaFile(schemaPath.configProvidedPath)
    };
  }
  const defaultResult = await getDefaultSchema(schemaPath.baseDir);
  if (defaultResult.ok) {
    return defaultResult;
  }
  return {
    ok: false,
    error: defaultResult.error
  };
}
function renderLookupError(error) {
  switch (error.kind) {
    case "NotFound": {
      const expected = error.expectedType ?? "file or directory";
      return `${expected} not found`;
    }
    case "WrongType":
      return `expected ${error.expectedTypes.join(" or ")}`;
  }
}
function renderDefaultLookupError(error, cwd) {
  const parts = [
    `Could not find Prisma Schema that is required for this command.`,
    `You can either provide it with ${(0, import_chunk_PG5FDKSF.green)("`--schema`")} argument,`,
    `set it in your Prisma Config file (e.g., ${(0, import_chunk_PG5FDKSF.green)("`prisma.config.ts`")}),`,
    `set it as ${(0, import_chunk_PG5FDKSF.green)("`prisma.schema`")} in your ${(0, import_chunk_PG5FDKSF.green)("package.json")},`,
    `or put it into the default location (${(0, import_chunk_PG5FDKSF.green)("`./prisma/schema.prisma`")}, or ${(0, import_chunk_PG5FDKSF.green)("`./schema.prisma`")}.`,
    "Checked following paths:\n"
  ];
  const printedPaths = /* @__PURE__ */ new Set();
  for (const failure of error.failures) {
    const filePath = failure.path;
    if (!printedPaths.has(failure.path)) {
      parts.push(`${import_path.default.relative(cwd, filePath)}: ${renderLookupError(failure.error)}`);
      printedPaths.add(filePath);
    }
  }
  parts.push("\nSee also https://pris.ly/d/prisma-schema-location");
  return parts.join("\n");
}
async function getCliProvidedSchemaFile(schemaPathFromArgs, cwd = process.cwd(), argumentName = "--schema") {
  const absPath = import_path.default.resolve(cwd, schemaPathFromArgs);
  const customSchemaResult = await readSchemaFromFileOrDirectory(absPath);
  if (!customSchemaResult.ok) {
    const relPath = import_path.default.relative(cwd, absPath);
    throw new Error(
      `Could not load \`${argumentName}\` from provided path \`${relPath}\`: ${renderLookupError(
        customSchemaResult.error
      )}`
    );
  }
  return customSchemaResult.schema;
}
async function getConfigProvidedSchemaFile(schemaPathFromConfig) {
  const schemaResult = await readSchemaFromFileOrDirectory(schemaPathFromConfig);
  if (!schemaResult.ok) {
    throw new Error(
      `Could not load schema from \`${schemaPathFromConfig}\` provided by "prisma.config.ts"\`: ${renderLookupError(
        schemaResult.error
      )}`
    );
  }
  return schemaResult.schema;
}
async function getDefaultSchema(cwd, failures = []) {
  const lookupPaths = [import_path.default.join(cwd, "schema.prisma"), import_path.default.join(cwd, "prisma", "schema.prisma")];
  for (const path2 of lookupPaths) {
    debug(`Checking existence of ${path2}`);
    const schema = await readSchemaFromSingleFile(path2);
    if (!schema.ok) {
      failures.push({ path: path2, error: schema.error });
      continue;
    }
    return schema;
  }
  return {
    ok: false,
    error: {
      kind: "NotFoundMultipleLocations",
      failures
    }
  };
}
