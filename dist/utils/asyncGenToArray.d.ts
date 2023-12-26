/**
 * @template T
 * @param {AsyncIterableIterator<T>} it
 * @return {Promise<T[]>}
 */
export declare function asyncGenToArray<T>(it: AsyncIterableIterator<T>): Promise<T[]>;
