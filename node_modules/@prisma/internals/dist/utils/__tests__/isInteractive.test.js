"use strict";
var import_chunk_VFNP7Q3Y = require("../../chunk-VFNP7Q3Y.js");
var import_chunk_ICFLO5JW = require("../../chunk-ICFLO5JW.js");
var import_chunk_4VNS5WPM = require("../../chunk-4VNS5WPM.js");
var originalEnv = { ...process.env };
function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === void 0) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}
(0, import_chunk_VFNP7Q3Y.describe)("isInteractive", () => {
  (0, import_chunk_VFNP7Q3Y.beforeEach)(() => {
    restoreEnv();
  });
  (0, import_chunk_VFNP7Q3Y.afterAll)(() => {
    restoreEnv();
  });
  (0, import_chunk_VFNP7Q3Y.describe)("in non TTY environment", () => {
    const mockedValue = { isTTY: false };
    (0, import_chunk_VFNP7Q3Y.test)("isInteractive should be false", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_ICFLO5JW.isInteractive)({ stream: mockedValue })).toBe(false);
    });
    (0, import_chunk_VFNP7Q3Y.test)("isInteractive should be false if TERM = dumb", () => {
      process.env.TERM = "dumb";
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_ICFLO5JW.isInteractive)({ stream: mockedValue })).toBe(false);
    });
  });
  (0, import_chunk_VFNP7Q3Y.describe)("in TTY environment", () => {
    const mockedValue = { isTTY: true };
    (0, import_chunk_VFNP7Q3Y.test)("isInteractive should be true", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_ICFLO5JW.isInteractive)({ stream: mockedValue })).toBe(true);
    });
    (0, import_chunk_VFNP7Q3Y.test)("isInteractive should be false if TERM = dumb", () => {
      process.env.TERM = "dumb";
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_ICFLO5JW.isInteractive)({ stream: mockedValue })).toBe(false);
    });
  });
});
