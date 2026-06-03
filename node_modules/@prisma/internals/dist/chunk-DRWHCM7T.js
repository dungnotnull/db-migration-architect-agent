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
var chunk_DRWHCM7T_exports = {};
__export(chunk_DRWHCM7T_exports, {
  missingGeneratorMessage: () => missingGeneratorMessage,
  missingModelMessage: () => missingModelMessage,
  missingModelMessageMongoDB: () => missingModelMessageMongoDB
});
module.exports = __toCommonJS(chunk_DRWHCM7T_exports);
var import_chunk_I6WLABB2 = require("./chunk-I6WLABB2.js");
var import_chunk_TQCLUNM2 = require("./chunk-TQCLUNM2.js");
var import_chunk_PG5FDKSF = require("./chunk-PG5FDKSF.js");
var missingGeneratorMessage = `
${(0, import_chunk_PG5FDKSF.blue)("info")} You don't have any generators defined in your ${(0, import_chunk_PG5FDKSF.bold)(
  "schema.prisma"
)}, so nothing will be generated.
Add the Prisma Client generator like this:

${(0, import_chunk_PG5FDKSF.bold)(
  (0, import_chunk_TQCLUNM2.highlightDatamodel)(`generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}`)
)}

More information in our documentation:
${(0, import_chunk_I6WLABB2.link)("https://pris.ly/d/prisma-schema")}
`;
var missingModelMessage = `
You don't have any ${(0, import_chunk_PG5FDKSF.bold)("models")} defined in your ${(0, import_chunk_PG5FDKSF.bold)(
  "schema.prisma"
)}, so nothing will be generated.

Prisma Client is typically generated from models defined in your schema. If you plan to use raw SQL queries only (e.g. ${(0, import_chunk_PG5FDKSF.bold)("$queryRaw")}), remove the ${(0, import_chunk_PG5FDKSF.bold)("--require-models")} flag to generate the client without models:

  ${(0, import_chunk_PG5FDKSF.dim)("$")} prisma generate

Otherwise, you can define a model like this:

${(0, import_chunk_PG5FDKSF.bold)(
  (0, import_chunk_TQCLUNM2.highlightDatamodel)(`model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`)
)}

More information in our documentation:
${(0, import_chunk_I6WLABB2.link)("https://pris.ly/d/prisma-schema")}
`;
var missingModelMessageMongoDB = `
You don't have any ${(0, import_chunk_PG5FDKSF.bold)("models")} defined in your ${(0, import_chunk_PG5FDKSF.bold)(
  "schema.prisma"
)}, so nothing will be generated.

Prisma Client is typically generated from models defined in your schema. If you plan to use raw queries only, remove the ${(0, import_chunk_PG5FDKSF.bold)("--require-models")} flag to generate the client without models:

  ${(0, import_chunk_PG5FDKSF.dim)("$")} prisma generate

Otherwise, you can define a model like this:

${(0, import_chunk_PG5FDKSF.bold)(
  (0, import_chunk_TQCLUNM2.highlightDatamodel)(`model User {
  id    String  @id @default(auto()) @map("_id") @db.ObjectId
  email String  @unique
  name  String?
}`)
)}

More information in our documentation:
${(0, import_chunk_I6WLABB2.link)("https://pris.ly/d/prisma-schema")}
`;
