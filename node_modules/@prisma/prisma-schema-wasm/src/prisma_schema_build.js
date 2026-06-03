
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function decodeText(ptr, len) {
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}
/**
 * @param {string} input
 * @returns {string}
 */
exports.merge_schemas = function(input) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.merge_schemas(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * @param {string} input
 * @returns {string}
 */
exports.native_types = function(input) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.native_types(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
};

/**
 * @param {string} input
 * @returns {string}
 */
exports.lint = function(input) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.lint(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
};

/**
 * Docs: https://prisma.github.io/prisma-engines/doc/prisma_fmt/fn.get_dmmf.html
 * @param {string} params
 * @returns {string}
 */
exports.get_dmmf = function(params) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.get_dmmf(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * This API is modelled on an LSP [references
 * request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#find-references-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a
 * `CodeActionParams` object and the response being a list of
 * `CodeActionOrCommand` objects.
 * @param {string} schema
 * @param {string} params
 * @returns {string}
 */
exports.references = function(schema, params) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(schema, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.references(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * @param {string} schema
 * @param {string} params
 * @returns {string}
 */
exports.format = function(schema, params) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(schema, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.format(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * @param {string} params
 */
exports.validate = function(params) {
    const ptr0 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validate(ptr0, len0);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
};

/**
 * Trigger a panic inside the wasm module. This is only useful in development for testing panic
 * handling.
 */
exports.debug_panic = function() {
    wasm.debug_panic();
};

/**
 * The API is modelled on an LSP [completion
 * request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#completion-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a `CompletionParams` object and the response
 * being a `CompletionList` object.
 * @param {string} schema_files
 * @param {string} params
 * @returns {string}
 */
exports.text_document_completion = function(schema_files, params) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(schema_files, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.text_document_completion(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * @param {string} input
 * @returns {string}
 */
exports.referential_actions = function(input) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.referential_actions(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
};

/**
 * Serialize DMMF to a caller-owned buffer and return it as a handle.
 * Use `DmmfBuffer.read_chunk()` to read portions as `Uint8Array`, then
 * `DmmfBuffer.free()` (auto-provided by wasm-bindgen) to release WASM memory.
 *
 * This avoids implicit global state — each call returns an independent buffer.
 *
 * See: https://github.com/prisma/prisma/issues/29111
 * @param {string} params
 * @returns {DmmfBuffer}
 */
exports.get_dmmf_buffered = function(params) {
    const ptr0 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_dmmf_buffered(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DmmfBuffer.__wrap(ret[0]);
};

/**
 * Docs: https://prisma.github.io/prisma-engines/doc/prisma_fmt/fn.get_config.html
 * @param {string} params
 * @returns {string}
 */
exports.get_config = function(params) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.get_config(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
};

/**
 * This api is modelled on an LSP [hover request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#hover-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a `HoverParams` object
 * and the response being a `Hover` object.
 * @param {string} schema_files
 * @param {string} params
 * @returns {string}
 */
exports.hover = function(schema_files, params) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(schema_files, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.hover(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * @param {string} params
 * @returns {string}
 */
exports.get_datamodel = function(params) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.get_datamodel(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * This API is modelled on an LSP [code action
 * request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#code-action-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a
 * `CodeActionParams` object and the response being a list of
 * `CodeActionOrCommand` objects.
 * @param {string} schema
 * @param {string} params
 * @returns {string}
 */
exports.code_actions = function(schema, params) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(schema, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.code_actions(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * @returns {string}
 */
exports.preview_features = function() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.preview_features();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
};

const DmmfBufferFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dmmfbuffer_free(ptr >>> 0, 1));
/**
 * Handle-based DMMF buffer that holds serialized DMMF JSON as bytes.
 *
 * This bypasses V8's string length limit (~536MB / 0x1fffffe8 chars) by keeping the
 * serialized JSON as bytes in WASM linear memory. The JS side reads chunks as `Uint8Array`
 * (which has no V8 string limit) and can reassemble them with a streaming JSON parser.
 *
 * Usage from JS:
 * ```js
 * const buffer = get_dmmf_buffered(params);
 * const totalLen = buffer.len();
 * const chunks = [];
 * for (let offset = 0; offset < totalLen; offset += CHUNK_SIZE) {
 *     chunks.push(buffer.read_chunk(offset, CHUNK_SIZE));
 * }
 * buffer.free(); // release WASM memory
 * ```
 *
 * See: https://github.com/prisma/prisma/issues/29111
 */
class DmmfBuffer {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DmmfBuffer.prototype);
        obj.__wbg_ptr = ptr;
        DmmfBufferFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DmmfBufferFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dmmfbuffer_free(ptr, 0);
    }
    /**
     * Read a chunk of the buffer as `Uint8Array`.
     * `offset` is the byte offset, `length` is the max number of bytes to read.
     * Returns a `Vec<u8>` which wasm-bindgen converts to `Uint8Array` on the JS side.
     * @param {number} offset
     * @param {number} length
     * @returns {Uint8Array}
     */
    read_chunk(offset, length) {
        const ret = wasm.dmmfbuffer_read_chunk(this.__wbg_ptr, offset, length);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Returns the total byte length of the serialized DMMF JSON.
     * @returns {number}
     */
    len() {
        const ret = wasm.dmmfbuffer_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns `true` if the buffer is empty.
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm.dmmfbuffer_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) DmmfBuffer.prototype[Symbol.dispose] = DmmfBuffer.prototype.free;

exports.DmmfBuffer = DmmfBuffer;

exports.__wbg_Error_e83987f665cf5504 = function(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

exports.__wbg___wbindgen_throw_b855445ff6a94295 = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

exports.__wbg_set_message_f22ac4a6869ee695 = function(arg0, arg1) {
    global.PRISMA_WASM_PANIC_REGISTRY.set_message(getStringFromWasm0(arg0, arg1));
};

exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

const wasmPath = `${__dirname}/prisma_schema_build_bg.wasm`;
const wasmBytes = require('fs').readFileSync(wasmPath);
const wasmModule = new WebAssembly.Module(wasmBytes);
const wasm = exports.__wasm = new WebAssembly.Instance(wasmModule, imports).exports;

wasm.__wbindgen_start();

