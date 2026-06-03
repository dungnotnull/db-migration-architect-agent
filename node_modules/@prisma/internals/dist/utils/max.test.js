"use strict";
var import_chunk_VFNP7Q3Y = require("../chunk-VFNP7Q3Y.js");
var import_chunk_CGFNDGGI = require("../chunk-CGFNDGGI.js");
var import_chunk_4VNS5WPM = require("../chunk-4VNS5WPM.js");
(0, import_chunk_VFNP7Q3Y.describe)("maxWithComparator", () => {
  (0, import_chunk_VFNP7Q3Y.test)("empty array", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_CGFNDGGI.maxWithComparator)([], () => 0)).toBe(void 0);
  });
  (0, import_chunk_VFNP7Q3Y.test)("with items", () => {
    const items = [{ count: 1 }, { count: 10 }, { count: 5 }];
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_CGFNDGGI.maxWithComparator)(items, (a, b) => a.count - b.count)).toBe(items[1]);
  });
});
(0, import_chunk_VFNP7Q3Y.describe)("maxBy", () => {
  (0, import_chunk_VFNP7Q3Y.test)("empty array", () => {
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_CGFNDGGI.maxBy)([], () => 1)).toBe(void 0);
  });
  (0, import_chunk_VFNP7Q3Y.test)("with items", () => {
    const items = [{ count: 1 }, { count: 10 }, { count: 5 }];
    (0, import_chunk_VFNP7Q3Y.globalExpect)((0, import_chunk_CGFNDGGI.maxBy)(items, (item) => item.count)).toBe(items[1]);
  });
});
