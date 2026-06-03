/* tslint:disable */
/* eslint-disable */
export function merge_schemas(input: string): string;
export function native_types(input: string): string;
export function lint(input: string): string;
/**
 * Docs: https://prisma.github.io/prisma-engines/doc/prisma_fmt/fn.get_dmmf.html
 */
export function get_dmmf(params: string): string;
/**
 * This API is modelled on an LSP [references
 * request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#find-references-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a
 * `CodeActionParams` object and the response being a list of
 * `CodeActionOrCommand` objects.
 */
export function references(schema: string, params: string): string;
export function format(schema: string, params: string): string;
export function validate(params: string): void;
/**
 * Trigger a panic inside the wasm module. This is only useful in development for testing panic
 * handling.
 */
export function debug_panic(): void;
/**
 * The API is modelled on an LSP [completion
 * request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#completion-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a `CompletionParams` object and the response
 * being a `CompletionList` object.
 */
export function text_document_completion(schema_files: string, params: string): string;
export function referential_actions(input: string): string;
/**
 * Serialize DMMF to a caller-owned buffer and return it as a handle.
 * Use `DmmfBuffer.read_chunk()` to read portions as `Uint8Array`, then
 * `DmmfBuffer.free()` (auto-provided by wasm-bindgen) to release WASM memory.
 *
 * This avoids implicit global state — each call returns an independent buffer.
 *
 * See: https://github.com/prisma/prisma/issues/29111
 */
export function get_dmmf_buffered(params: string): DmmfBuffer;
/**
 * Docs: https://prisma.github.io/prisma-engines/doc/prisma_fmt/fn.get_config.html
 */
export function get_config(params: string): string;
/**
 * This api is modelled on an LSP [hover request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#hover-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a `HoverParams` object
 * and the response being a `Hover` object.
 */
export function hover(schema_files: string, params: string): string;
export function get_datamodel(params: string): string;
/**
 * This API is modelled on an LSP [code action
 * request](https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/specification-3-16.md#code-action-request-leftwards_arrow_with_hook).
 * Input and output are both JSON, the request being a
 * `CodeActionParams` object and the response being a list of
 * `CodeActionOrCommand` objects.
 */
export function code_actions(schema: string, params: string): string;
export function preview_features(): string;
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
export class DmmfBuffer {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Read a chunk of the buffer as `Uint8Array`.
   * `offset` is the byte offset, `length` is the max number of bytes to read.
   * Returns a `Vec<u8>` which wasm-bindgen converts to `Uint8Array` on the JS side.
   */
  read_chunk(offset: number, length: number): Uint8Array;
  /**
   * Returns the total byte length of the serialized DMMF JSON.
   */
  len(): number;
  /**
   * Returns `true` if the buffer is empty.
   */
  is_empty(): boolean;
}
