"use strict";
var import_chunk_VFNP7Q3Y = require("../chunk-VFNP7Q3Y.js");
var import_chunk_NIWBAJZV = require("../chunk-NIWBAJZV.js");
var import_chunk_4VNS5WPM = require("../chunk-4VNS5WPM.js");
(0, import_chunk_VFNP7Q3Y.test)("returns the result correctly", async () => {
  const wrapper = (0, import_chunk_NIWBAJZV.callOnceOnSuccess)(import_chunk_VFNP7Q3Y.vi.fn().mockResolvedValue("hello"));
  await (0, import_chunk_VFNP7Q3Y.globalExpect)(wrapper()).resolves.toBe("hello");
});
(0, import_chunk_VFNP7Q3Y.test)("forwards the arguments correctly", async () => {
  const wrapper = (0, import_chunk_NIWBAJZV.callOnceOnSuccess)((x) => Promise.resolve(x + 1));
  await (0, import_chunk_VFNP7Q3Y.globalExpect)(wrapper(2)).resolves.toBe(3);
});
(0, import_chunk_VFNP7Q3Y.test)("\u0441alls wrapped function only once before promise resolves", async () => {
  const wrapped = import_chunk_VFNP7Q3Y.vi.fn().mockResolvedValue("hello");
  const wrapper = (0, import_chunk_NIWBAJZV.callOnceOnSuccess)(wrapped);
  void wrapper();
  void wrapper();
  await wrapper();
  (0, import_chunk_VFNP7Q3Y.globalExpect)(wrapped).toHaveBeenCalledTimes(1);
});
(0, import_chunk_VFNP7Q3Y.test)("caches the result when it succeeds", async () => {
  const wrapped = import_chunk_VFNP7Q3Y.vi.fn().mockResolvedValue("hello");
  const wrapper = (0, import_chunk_NIWBAJZV.callOnceOnSuccess)(wrapped);
  await wrapper();
  await wrapper();
  const result = await wrapper();
  (0, import_chunk_VFNP7Q3Y.globalExpect)(wrapped).toHaveBeenCalledTimes(1);
  (0, import_chunk_VFNP7Q3Y.globalExpect)(result).toBe("hello");
});
(0, import_chunk_VFNP7Q3Y.test)("does not cache the result when it fails", async () => {
  const wrapped = import_chunk_VFNP7Q3Y.vi.fn().mockRejectedValue(new Error("hello"));
  const wrapper = (0, import_chunk_NIWBAJZV.callOnceOnSuccess)(wrapped);
  await Promise.allSettled([wrapper(), wrapper()]);
  await (0, import_chunk_VFNP7Q3Y.globalExpect)(wrapper()).rejects.toThrow("hello");
  (0, import_chunk_VFNP7Q3Y.globalExpect)(wrapped).toHaveBeenCalledTimes(2);
});
