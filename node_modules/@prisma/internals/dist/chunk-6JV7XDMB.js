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
var chunk_6JV7XDMB_exports = {};
__export(chunk_6JV7XDMB_exports, {
  checkUnsupportedDataProxy: () => checkUnsupportedDataProxy,
  forbiddenCmdWithDataProxyFlagMessage: () => forbiddenCmdWithDataProxyFlagMessage,
  formatSchema: () => formatSchema,
  getBinaryTargetForCurrentPlatform: () => import_get_platform2.getBinaryTargetForCurrentPlatform,
  getGenerator: () => getGenerator,
  getGenerators: () => getGenerators,
  getSchemaDatasourceProvider: () => getSchemaDatasourceProvider,
  knownBinaryTargets: () => knownBinaryTargets,
  loadSchemaContext: () => loadSchemaContext,
  processSchemaResult: () => processSchemaResult,
  skipIndex: () => skipIndex
});
module.exports = __toCommonJS(chunk_6JV7XDMB_exports);
var import_chunk_X77CS5RK = require("./chunk-X77CS5RK.js");
var import_chunk_DZ4QWHTB = require("./chunk-DZ4QWHTB.js");
var import_chunk_X3P4J7WW = require("./chunk-X3P4J7WW.js");
var import_chunk_LRU47BGE = require("./chunk-LRU47BGE.js");
var import_chunk_GXW4NTU2 = require("./chunk-GXW4NTU2.js");
var import_chunk_5FJ3MENK = require("./chunk-5FJ3MENK.js");
var import_chunk_DXWYZA7B = require("./chunk-DXWYZA7B.js");
var import_chunk_DRWHCM7T = require("./chunk-DRWHCM7T.js");
var import_chunk_I6WLABB2 = require("./chunk-I6WLABB2.js");
var import_chunk_VTQM3N6F = require("./chunk-VTQM3N6F.js");
var import_chunk_7X4PKR7K = require("./chunk-7X4PKR7K.js");
var import_chunk_3TVXOVYR = require("./chunk-3TVXOVYR.js");
var import_chunk_OVNJ32IV = require("./chunk-OVNJ32IV.js");
var import_chunk_JXCQ6QEO = require("./chunk-JXCQ6QEO.js");
var import_chunk_2BXDHSSY = require("./chunk-2BXDHSSY.js");
var import_chunk_ZJWZK45Z = require("./chunk-ZJWZK45Z.js");
var import_chunk_2B26F5N3 = require("./chunk-2B26F5N3.js");
var import_chunk_XKZ6CBLA = require("./chunk-XKZ6CBLA.js");
var import_chunk_LMVSIVKQ = require("./chunk-LMVSIVKQ.js");
var import_chunk_BPDMLM32 = require("./chunk-BPDMLM32.js");
var import_chunk_IOIAK7V7 = require("./chunk-IOIAK7V7.js");
var import_chunk_PG5FDKSF = require("./chunk-PG5FDKSF.js");
var import_chunk_PTPRBA7K = require("./chunk-PTPRBA7K.js");
var import_chunk_4VNS5WPM = require("./chunk-4VNS5WPM.js");
var import_node_path = __toESM(require("node:path"));
var import_debug = __toESM(require("@prisma/debug"));
var import_debug2 = __toESM(require("@prisma/debug"));
var import_engines = require("@prisma/engines");
var import_get_platform = require("@prisma/get-platform");
var import_path = __toESM(require("path"));
var import_get_platform2 = require("@prisma/get-platform");
var debug = (0, import_debug.default)("prisma:format");
async function formatSchema({ schemas }, inputFormattingOptions) {
  if (process.env.FORCE_PANIC_PRISMA_SCHEMA) {
    handleFormatPanic(() => {
      import_chunk_JXCQ6QEO.prismaSchemaWasm.debug_panic();
    });
  }
  const defaultFormattingOptions = {
    tabSize: 2,
    insertSpaces: true
  };
  const documentFormattingParams = {
    textDocument: { uri: "file:/dev/null" },
    options: {
      ...defaultFormattingOptions,
      ...inputFormattingOptions
    }
  };
  const { formattedMultipleSchemas, lintDiagnostics } = handleFormatPanic(() => {
    const formattedMultipleSchemasRaw = formatWasm(JSON.stringify(schemas), documentFormattingParams);
    const formattedMultipleSchemas2 = JSON.parse(formattedMultipleSchemasRaw);
    const lintDiagnostics2 = (0, import_chunk_7X4PKR7K.lintSchema)({ schemas: formattedMultipleSchemas2 });
    return { formattedMultipleSchemas: formattedMultipleSchemas2, lintDiagnostics: lintDiagnostics2 };
  });
  const lintWarnings = (0, import_chunk_7X4PKR7K.getLintWarningsAsText)(lintDiagnostics);
  if (lintWarnings && import_chunk_ZJWZK45Z.logger_exports.should.warn()) {
    console.warn(lintWarnings);
  }
  return Promise.resolve(formattedMultipleSchemas);
}
function handleFormatPanic(tryCb) {
  try {
    return tryCb();
  } catch (e) {
    const { message, stack } = (0, import_chunk_LMVSIVKQ.getWasmError)(e);
    debug(`Error formatting schema: ${message}`);
    debug(stack);
    const panic = new import_chunk_LMVSIVKQ.RustPanic(
      /* message */
      message,
      /* rustStack */
      stack,
      /* request */
      "@prisma/prisma-schema-wasm format",
      "FMT_CLI"
      /* FMT_CLI */
    );
    throw panic;
  }
}
function formatWasm(schema, documentFormattingParams) {
  const formattedSchema = import_chunk_JXCQ6QEO.prismaSchemaWasm.format(schema, JSON.stringify(documentFormattingParams));
  return formattedSchema;
}
async function loadSchemaContext({ schemaPath, printLoadMessage, allowNull, schemaPathArgumentName, cwd } = {
  schemaPath: { baseDir: process.cwd() },
  printLoadMessage: true,
  allowNull: false,
  schemaPathArgumentName: "--schema",
  cwd: process.cwd()
}) {
  let schemaResult = null;
  if (allowNull) {
    schemaResult = await (0, import_chunk_2BXDHSSY.getSchemaWithPathOptional)({ schemaPath, cwd, argumentName: schemaPathArgumentName });
    if (!schemaResult) return null;
  } else {
    schemaResult = await (0, import_chunk_2BXDHSSY.getSchemaWithPath)({ schemaPath, cwd, argumentName: schemaPathArgumentName });
  }
  return processSchemaResult({ schemaResult, printLoadMessage, cwd });
}
async function processSchemaResult({
  schemaResult,
  printLoadMessage = true,
  cwd = process.cwd()
}) {
  const loadedFromPathForLogMessages = import_node_path.default.relative(cwd, schemaResult.schemaPath);
  const schemaRootDir = schemaResult.schemaRootDir || cwd;
  if (printLoadMessage) {
    (0, import_chunk_2BXDHSSY.printSchemaLoadedMessage)(loadedFromPathForLogMessages);
  }
  const configFromPsl = await (0, import_chunk_OVNJ32IV.getConfig)({ datamodel: schemaResult.schemas });
  const primaryDatasource = configFromPsl.datasources.at(0);
  return {
    schemaFiles: schemaResult.schemas,
    schemaPath: schemaResult.schemaPath,
    schemaRootDir,
    datasources: configFromPsl.datasources,
    generators: configFromPsl.generators,
    primaryDatasource,
    warnings: configFromPsl.warnings,
    loadedFromPathForLogMessages
  };
}
function getSchemaDatasourceProvider(schemaContext) {
  if (schemaContext.primaryDatasource === void 0) {
    throw new Error("Schema must contain a datasource block");
  }
  return schemaContext.primaryDatasource.activeProvider;
}
var import_p_map = (0, import_chunk_4VNS5WPM.__toESM)((0, import_chunk_PTPRBA7K.require_p_map)());
var debug2 = (0, import_debug2.default)("prisma:getGenerators");
async function getGenerators(options) {
  if (options.registry === void 0 && options.providerAliases !== void 0) {
    options.registry = Object.fromEntries(
      Object.entries(options.providerAliases).map(([name, definition]) => [
        name,
        {
          type: "rpc",
          generatorPath: definition.generatorPath,
          isNode: definition.isNode
        }
      ])
    );
  }
  const {
    schemaPath,
    registry,
    version: version2,
    printDownloadProgress,
    overrideGenerators,
    skipDownload,
    binaryPathsOverride,
    generatorNames = [],
    allowNoModels = true,
    typedSql
  } = options;
  const schemaContext = !options.schemaContext && schemaPath ? await loadSchemaContext({ schemaPath: { cliProvidedPath: schemaPath } }) : options.schemaContext;
  if (!schemaContext) {
    throw new Error(`no schema provided for getGenerators`);
  }
  if (!schemaContext.primaryDatasource) {
    throw new Error(import_chunk_DXWYZA7B.missingDatasource);
  }
  (0, import_chunk_5FJ3MENK.printConfigWarnings)(schemaContext.warnings);
  const dmmf = await (0, import_chunk_VTQM3N6F.getDMMF)({ datamodel: schemaContext.schemaFiles });
  if (dmmf.datamodel.models.length === 0 && !allowNoModels) {
    if (schemaContext.primaryDatasource.provider === "mongodb") {
      throw new Error(import_chunk_DRWHCM7T.missingModelMessageMongoDB);
    }
    throw new Error(import_chunk_DRWHCM7T.missingModelMessage);
  }
  const generatorConfigs = filterGenerators(overrideGenerators || schemaContext.generators, generatorNames);
  await validateGenerators(generatorConfigs);
  const runningGenerators = [];
  try {
    const generators = await (0, import_p_map.default)(
      generatorConfigs,
      async (generatorConfig, index) => {
        const baseDir = import_path.default.dirname(generatorConfig.sourceFilePath ?? schemaContext.schemaRootDir);
        const providerValue = (0, import_chunk_IOIAK7V7.parseEnvValue)(generatorConfig.provider);
        const generatorDefinition = registry[providerValue] ?? {
          type: "rpc",
          generatorPath: providerValue
        };
        const generatorInstance = (0, import_chunk_XKZ6CBLA.z)(generatorDefinition).with({ type: "in-process" }, ({ generator }) => new import_chunk_BPDMLM32.InProcessGenerator(generatorConfig, generator)).with(
          { type: "rpc" },
          ({ generatorPath, isNode }) => new import_chunk_BPDMLM32.JsonRpcGenerator(generatorPath, generatorConfig, isNode)
        ).exhaustive();
        await generatorInstance.init();
        if (generatorConfig.output) {
          generatorConfig.output = {
            value: import_path.default.resolve(baseDir, (0, import_chunk_IOIAK7V7.parseEnvValue)(generatorConfig.output)),
            fromEnvVar: null
          };
          generatorConfig.isCustomOutput = true;
        } else {
          if (!generatorInstance.manifest?.defaultOutput) {
            throw new Error(
              `Can't resolve output dir for generator ${(0, import_chunk_PG5FDKSF.bold)(generatorConfig.name)} with provider ${(0, import_chunk_PG5FDKSF.bold)(
                generatorConfig.provider.value
              )}.
You need to define \`output\` in the generator block in the schema file.`
            );
          }
          generatorConfig.output = {
            value: await (0, import_chunk_2B26F5N3.resolveOutput)({
              defaultOutput: generatorInstance.manifest.defaultOutput,
              baseDir
            }),
            fromEnvVar: null
          };
        }
        const datamodel = (0, import_chunk_3TVXOVYR.mergeSchemas)({ schemas: schemaContext.schemaFiles });
        const options2 = {
          datamodel,
          datasources: schemaContext.datasources,
          generator: generatorConfig,
          dmmf,
          otherGenerators: skipIndex(generatorConfigs, index),
          schemaPath: schemaContext.schemaPath,
          // TODO:(schemaPath) can we get rid of schema path passing here?
          version: version2 || import_engines.enginesVersion,
          // this version makes no sense anymore and should be ignored
          allowNoModels,
          typedSql
        };
        generatorInstance.setOptions(options2);
        runningGenerators.push(generatorInstance);
        return generatorInstance;
      },
      {
        stopOnError: false
        // needed so we can first make sure all generators are created properly, then cleaned up properly
      }
    );
    const generatorProviders = generatorConfigs.map((g) => (0, import_chunk_IOIAK7V7.parseEnvValue)(g.provider));
    for (const g of generators) {
      if (g.manifest && g.manifest.requiresGenerators && g.manifest.requiresGenerators.length > 0) {
        for (const neededGenerator of g.manifest.requiresGenerators) {
          if (!generatorProviders.includes(neededGenerator)) {
            throw new Error(
              `Generator "${g.manifest.prettyName}" requires generator "${neededGenerator}", but it is missing in your schema.prisma.
Please add it to your schema.prisma:

generator gen {
  provider = "${neededGenerator}"
}
`
            );
          }
        }
      }
    }
    const neededVersions = /* @__PURE__ */ Object.create(null);
    for (const g of generators) {
      if (g.manifest && g.manifest.requiresEngines && Array.isArray(g.manifest.requiresEngines) && g.manifest.requiresEngines.length > 0) {
        const neededVersion = (0, import_chunk_X3P4J7WW.getEngineVersionForGenerator)(g.manifest, version2);
        if (!neededVersions[neededVersion]) {
          neededVersions[neededVersion] = { engines: [], binaryTargets: [] };
        }
        for (const engine of g.manifest.requiresEngines) {
          if (!neededVersions[neededVersion].engines.includes(engine)) {
            neededVersions[neededVersion].engines.push(engine);
          }
        }
        const generatorBinaryTargets = g.options?.generator?.binaryTargets;
        if (generatorBinaryTargets && generatorBinaryTargets.length > 0) {
          for (const binaryTarget of generatorBinaryTargets) {
            if (!neededVersions[neededVersion].binaryTargets.find((object) => object.value === binaryTarget.value)) {
              neededVersions[neededVersion].binaryTargets.push(binaryTarget);
            }
          }
        }
      }
    }
    debug2("neededVersions", JSON.stringify(neededVersions, null, 2));
    const { binaryPathsByVersion } = await (0, import_chunk_DZ4QWHTB.getBinaryPathsByVersion)({
      neededVersions,
      // We're lazily computing the binary target here, to avoid printing the
      // `Prisma failed to detect the libssl/openssl version to use` warning
      // on StackBlitz, where the binary target is not detected.
      //
      // On other platforms, it's safe and fast to call this function again,
      // as its result is memoized anyway.
      detectBinaryTarget: import_get_platform.getBinaryTargetForCurrentPlatform,
      version: version2,
      printDownloadProgress,
      skipDownload,
      binaryPathsOverride
    });
    for (const generator of generators) {
      if (generator.manifest && generator.manifest.requiresEngines) {
        const engineVersion = (0, import_chunk_X3P4J7WW.getEngineVersionForGenerator)(generator.manifest, version2);
        const binaryPaths = binaryPathsByVersion[engineVersion];
        const generatorBinaryPaths = (0, import_chunk_GXW4NTU2.pick)(binaryPaths ?? {}, generator.manifest.requiresEngines);
        debug2({ generatorBinaryPaths });
        generator.setBinaryPaths(generatorBinaryPaths);
      }
    }
    return generators;
  } catch (e) {
    runningGenerators.forEach((g) => g.stop());
    throw e;
  }
}
async function getGenerator(options) {
  const generators = await getGenerators(options);
  return generators[0];
}
function skipIndex(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
var knownBinaryTargets = [...import_get_platform.binaryTargets, "native"];
var oldToNewBinaryTargetsMapping = {
  "linux-glibc-libssl1.0.1": "debian-openssl-1.0.x",
  "linux-glibc-libssl1.0.2": "debian-openssl-1.0.x",
  "linux-glibc-libssl1.1.0": "debian-openssl1.1.x"
};
async function validateGenerators(generators) {
  const binaryTarget = await (0, import_get_platform.getBinaryTargetForCurrentPlatform)();
  for (const generator of generators) {
    if (generator.binaryTargets) {
      const binaryTargets2 = generator.binaryTargets && generator.binaryTargets.length > 0 ? generator.binaryTargets : [{ fromEnvVar: null, value: "native" }];
      const resolvedBinaryTargets = binaryTargets2.flatMap((object) => (0, import_chunk_IOIAK7V7.parseBinaryTargetsEnvValue)(object)).map((p) => p === "native" ? binaryTarget : p);
      for (const resolvedBinaryTarget of resolvedBinaryTargets) {
        if (oldToNewBinaryTargetsMapping[resolvedBinaryTarget]) {
          throw new Error(
            `Binary target ${(0, import_chunk_PG5FDKSF.red)((0, import_chunk_PG5FDKSF.bold)(resolvedBinaryTarget))} is deprecated. Please use ${(0, import_chunk_PG5FDKSF.green)(
              (0, import_chunk_PG5FDKSF.bold)(oldToNewBinaryTargetsMapping[resolvedBinaryTarget])
            )} instead.`
          );
        }
        if (!knownBinaryTargets.includes(resolvedBinaryTarget)) {
          throw new Error(
            `Unknown binary target ${(0, import_chunk_PG5FDKSF.red)(resolvedBinaryTarget)} in generator ${(0, import_chunk_PG5FDKSF.bold)(generator.name)}.
Possible binaryTargets: ${(0, import_chunk_PG5FDKSF.green)(knownBinaryTargets.join(", "))}`
          );
        }
      }
      if (!resolvedBinaryTargets.includes(binaryTarget)) {
        const originalBinaryTargetsConfig = (0, import_chunk_LRU47BGE.getOriginalBinaryTargetsValue)(generator.binaryTargets);
        console.log(`${(0, import_chunk_PG5FDKSF.yellow)("Warning:")} Your current platform \`${(0, import_chunk_PG5FDKSF.bold)(
          binaryTarget
        )}\` is not included in your generator's \`binaryTargets\` configuration ${JSON.stringify(
          originalBinaryTargetsConfig
        )}.
To fix it, use this generator config in your ${(0, import_chunk_PG5FDKSF.bold)("schema.prisma")}:
${(0, import_chunk_PG5FDKSF.green)(
          (0, import_chunk_LRU47BGE.printGeneratorConfig)({
            ...generator,
            binaryTargets: (0, import_chunk_X77CS5RK.fixBinaryTargets)(generator.binaryTargets, binaryTarget)
          })
        )}
${(0, import_chunk_PG5FDKSF.gray)(
          `Note, that by providing \`native\`, Prisma Client automatically resolves \`${binaryTarget}\`.
Read more about deploying Prisma Client: ${(0, import_chunk_PG5FDKSF.underline)(
            "https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/generators"
          )}`
        )}
`);
      }
    }
  }
}
function filterGenerators(generators, generatorNames) {
  if (generatorNames.length < 1) {
    return generators;
  }
  const filtered = generators.filter((generator) => generatorNames.includes(generator.name));
  if (filtered.length !== generatorNames.length) {
    const missings = generatorNames.filter((name) => filtered.find((generator) => generator.name === name) == null);
    const isSingular = missings.length <= 1;
    throw new Error(
      `The ${isSingular ? "generator" : "generators"} ${(0, import_chunk_PG5FDKSF.bold)(missings.join(", "))} specified via ${(0, import_chunk_PG5FDKSF.bold)(
        "--generator"
      )} ${isSingular ? "does" : "do"} not exist in your Prisma schema`
    );
  }
  return filtered;
}
var forbiddenCmdWithDataProxyFlagMessage = (cmd) => `
Using an Accelerate URL is not supported for this CLI command ${(0, import_chunk_PG5FDKSF.green)(`prisma ${cmd}`)} yet.
Please use a direct connection to your database in \`prisma.config.ts\`.

More information about this limitation: ${(0, import_chunk_I6WLABB2.link)("https://pris.ly/d/accelerate-limitations")}
`;
function checkUnsupportedDataProxy({
  cmd,
  validatedConfig
}) {
  if (validatedConfig.datasource.url.startsWith("prisma://")) {
    throw new Error(forbiddenCmdWithDataProxyFlagMessage(cmd));
  }
}
