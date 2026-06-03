"use strict";
var import_chunk_VFNP7Q3Y = require("../../chunk-VFNP7Q3Y.js");
var import_chunk_H4NI2RIK = require("../../chunk-H4NI2RIK.js");
var import_chunk_4VNS5WPM = require("../../chunk-4VNS5WPM.js");
var originalEnv = { ...process.env };
var originalStdinisTTY = process.stdin.isTTY;
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
(0, import_chunk_VFNP7Q3Y.describe)("isCi", () => {
  (0, import_chunk_VFNP7Q3Y.beforeEach)(() => {
    restoreEnv();
    process.stdin.isTTY = originalStdinisTTY;
  });
  (0, import_chunk_VFNP7Q3Y.afterAll)(() => {
    restoreEnv();
    process.stdin.isTTY = originalStdinisTTY;
  });
  (0, import_chunk_VFNP7Q3Y.describe)("in non TTY environment", () => {
    (0, import_chunk_VFNP7Q3Y.beforeEach)(() => {
      delete process.env.GITHUB_ACTIONS;
      delete process.env.CI;
      process.stdin.isTTY = false;
    });
    (0, import_chunk_VFNP7Q3Y.test)("with undefined env vars, isCi should be false", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_H4NI2RIK.isCi)()).toBe(false);
    });
  });
  (0, import_chunk_VFNP7Q3Y.describe)("in TTY environment", () => {
    (0, import_chunk_VFNP7Q3Y.beforeEach)(() => {
      delete process.env.GITHUB_ACTIONS;
      delete process.env.CI;
      process.stdin.isTTY = true;
    });
    (0, import_chunk_VFNP7Q3Y.test)("with CI env var, isCi should be true", () => {
      process.env.CI = "true";
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_H4NI2RIK.isCi)()).toBe(true);
    });
    (0, import_chunk_VFNP7Q3Y.test)("with GitHub Actions env var, isCi should be true", () => {
      process.env.GITHUB_ACTIONS = "true";
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_H4NI2RIK.isCi)()).toBe(true);
    });
    (0, import_chunk_VFNP7Q3Y.test)("with undefined env vars, isCi should be false", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_H4NI2RIK.isCi)()).toBe(false);
    });
  });
});
