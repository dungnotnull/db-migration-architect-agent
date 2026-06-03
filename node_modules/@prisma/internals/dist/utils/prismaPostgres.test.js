"use strict";
var import_chunk_VFNP7Q3Y = require("../chunk-VFNP7Q3Y.js");
var import_chunk_LPNBWFQ3 = require("../chunk-LPNBWFQ3.js");
var import_chunk_4VNS5WPM = require("../chunk-4VNS5WPM.js");
(0, import_chunk_VFNP7Q3Y.describe)("isPrismaPostgres", () => {
  (0, import_chunk_VFNP7Q3Y.test)("returns false on invalid or non Prisma Postgres protocols", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)()).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)("")).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)("mysql://database.url/test")).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)("prisma://database.url/test")).toBe(false);
  });
  (0, import_chunk_VFNP7Q3Y.test)("returns true on valid Prisma Postgres protocols", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)("prisma+postgres://database.url/test")).toBe(true);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)(`${import_chunk_LPNBWFQ3.PRISMA_POSTGRES_PROTOCOL}//database.url/test`)).toBe(true);
  });
});
(0, import_chunk_VFNP7Q3Y.describe)("isPrismaPostgresDev", () => {
  (0, import_chunk_VFNP7Q3Y.test)("returns false on invalid or non Prisma Postgres protocols", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)()).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)("")).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)("mysql://database.url/test")).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgres)("prisma://database.url/test")).toBe(false);
  });
  (0, import_chunk_VFNP7Q3Y.test)("returns false on valid Prisma Postgres protocols with non localhost host", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgresDev)("prisma+postgres://database.url/test")).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgresDev)(`${import_chunk_LPNBWFQ3.PRISMA_POSTGRES_PROTOCOL}//database.url/test`)).toBe(false);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgresDev)("prisma+postgres://127.0.0.2:5432/test")).toBe(false);
  });
  (0, import_chunk_VFNP7Q3Y.test)("returns true on valid Prisma Postgres protocols with localhost host", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgresDev)("prisma+postgres://localhost:5432/test")).toBe(true);
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_LPNBWFQ3.isPrismaPostgresDev)("prisma+postgres://127.0.0.1:5432/test")).toBe(true);
  });
});
