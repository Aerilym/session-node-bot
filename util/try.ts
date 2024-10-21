// From github.com/oxen-io/websites/ TODO - import from the package once its released

/**
 * Safely try to execute a promise, returning a tuple of [error, result].
 *
 * If the promise rejects or an error is thrown, the error will be the first element of the tuple.
 *
 * If the promise resolves, the result will be the second element of the tuple.
 *
 * @note If the tuple error value is null, the promise was not rejected and no error was thrown.
 * So the result value is guaranteed to be the promise's resolve value. (This can obviously be null
 * if the promise resolves to null, so always check the error value for the success state.)
 *
 * @param promise - The promise to try to execute.
 * @returns A tuple of [error, result].
 *
 * @example
 * ```ts
 * const [err, result] = await safeTry(Promise.resolve(42));
 *
 * console.log(result); // null or 42
 *
 * if (err) {
 *   console.error(err);
 *   return 'Not Found'
 * }
 *
 * console.log(result); // 42
 * return result;
 * ```
 */
export async function safeTry<T, E = Error>(promise: Promise<T>): Promise<[null, T] | [E, null]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (err) {
    return [err as E, null];
  }
}

type SyncFn<T> = (...args: Array<never>) => T extends Promise<unknown> ? never : T;

/**
 * Safely try to execute a synchronous function, returning a tuple of [error, result].
 *
 * If the function throws an error, the error will be the first element of the tuple. Otherwise, it will be null.
 *
 * If the function returns a value, the result will be the second element of the tuple. Otherwise, it will be null.
 *
 * @note If the tuple error value is null, the function did not throw an error. So the result value
 * is guaranteed to be the function's return value. (This can obviously be null if the function
 * returns null, so always check the error value for the success state.)
 *
 * @note This function is only safe to use with synchronous functions. If you need to use
 * a function that returns a promise, use {@link safeTry} instead. While calling an async
 * function will give the result as a promise, the promise isn't internally awaited, so any errors
 * will not be safely returned as a value (the `error` property will always be `null`). Any errors
 * thrown by the function will be thrown as a synchronous exception.
 *
 * @param fn - The function to try to execute.
 * @returns A tuple of [error, result].
 *
 * @example
 * ```ts
 * const [err, result] = safeTrySync(() => 42);
 * if (err) {
 *   console.error(err);
 *   return 'Not Found';
 * }
 * return result; // 42
 * ```
 */
export function safeTrySync<T, E = Error>(fn: SyncFn<T>): [null, T] | [E, null] {
  try {
    return [null, fn()];
  } catch (err) {
    return [err as E, null];
  }
}

export type Try<T, E = Error> = Awaited<ReturnType<typeof safeTry<T, E>>>;
