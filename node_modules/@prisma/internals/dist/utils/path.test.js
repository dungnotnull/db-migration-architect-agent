"use strict";
var import_chunk_VFNP7Q3Y = require("../chunk-VFNP7Q3Y.js");
var import_chunk_J77ZIDXB = require("../chunk-J77ZIDXB.js");
var import_chunk_4VNS5WPM = require("../chunk-4VNS5WPM.js");
var testIf = (condition) => condition ? import_chunk_VFNP7Q3Y.test : import_chunk_VFNP7Q3Y.test.skip;
var describeIf = (condition) => condition ? import_chunk_VFNP7Q3Y.describe : import_chunk_VFNP7Q3Y.describe.skip;
(0, import_chunk_VFNP7Q3Y.describe)("pathToPosix", () => {
  (0, import_chunk_VFNP7Q3Y.test)("forward slashes", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.pathToPosix)("a/b/c")).toBe("a/b/c");
  });
  testIf(process.platform === "win32")("backslashes on windows", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.pathToPosix)("a\\b\\c")).toBe("a/b/c");
  });
  testIf(process.platform !== "win32")("backslashes on posix", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.pathToPosix)("a\\b\\c")).toBe("a\\b\\c");
  });
});
(0, import_chunk_VFNP7Q3Y.describe)("longestCommonPathPrefix", () => {
  describeIf(process.platform !== "win32")("posix", () => {
    (0, import_chunk_VFNP7Q3Y.test)("common ancestor directory", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("/usr/lib/libprisma.so", "/usr/bin/prisma")).toBe("/usr");
    });
    (0, import_chunk_VFNP7Q3Y.test)("common ancestor is root", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("/usr/bin/prisma", "/home/prisma")).toBe("/");
    });
    (0, import_chunk_VFNP7Q3Y.test)("common ancestor is the path itself", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("/home/prisma", "/home/prisma")).toBe("/home/prisma");
    });
    (0, import_chunk_VFNP7Q3Y.test)("substring is not treated as a path component", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("/prisma", "/pri")).toBe("/");
    });
  });
  describeIf(process.platform === "win32")("windows", () => {
    (0, import_chunk_VFNP7Q3Y.test)("common ancestor directory", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("C:\\Common\\A\\Prisma", "C:\\Common\\B\\Prisma")).toBe("C:\\Common");
    });
    (0, import_chunk_VFNP7Q3Y.test)("common ancestor is disk", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("C:\\A\\Prisma", "C:\\B\\Prisma")).toBe("C:\\");
    });
    (0, import_chunk_VFNP7Q3Y.test)("substring is not treated as a path component", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("C:\\Prisma", "C:\\Pri")).toBe("C:\\");
    });
    (0, import_chunk_VFNP7Q3Y.test)("namespaced path works", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("C:\\Common\\A\\Prisma", "\\\\?\\C:\\Common\\B\\Prisma")).toBe("\\\\?\\C:\\Common");
    });
    (0, import_chunk_VFNP7Q3Y.test)("different disks", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("C:\\Prisma", "D:\\Prisma")).toBeUndefined();
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("\\\\?\\C:\\Prisma", "\\\\?\\D:\\Prisma")).toBeUndefined();
    });
    (0, import_chunk_VFNP7Q3Y.test)("different namespaces", () => {
      (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_J77ZIDXB.longestCommonPathPrefix)("\\\\?\\C:\\Prisma", "\\\\.\\COM1")).toBeUndefined();
    });
  });
});
