/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Range from 'core/range';
import Super from 'super/i-block/modules/async-render/modules/base';

import type { IterOptions, IterDescriptor } from 'super/i-block/modules/async-render/modules/interface';

export * from 'super/i-block/modules/async-render/modules/base';
export * from 'super/i-block/modules/async-render/interface';

export default class AsyncRender extends Super {
	//#if runtime has component/async-render

	/**
	 * Returns an iterator descriptor object based on the passed value and options
	 *
	 * @param value
	 * @param [start] - start positions to iterate
	 * @param [perChunk] - elements per one iteration chunk
	 * @param [filter] - function to filter iteration elements
	 */
	protected getIterDescriptor(value: unknown, {start = 0, perChunk = 1, filter}: IterOptions = {}): IterDescriptor {
		const
			iterable = this.getIterable(value, filter != null),
			isAsyncIterable = Object.isPromise(iterable) || Object.isAsyncIterable(iterable),
			syncIterator: Iterator<unknown> = isAsyncIterable ? [].values() : iterable[Symbol.iterator]();

		const
			readEls: unknown[] = [],
			discardedReadEls: unknown[] = [];

		let
			readI = 0,
			readTotal = 0,
			lastReadValue: CanUndef<IteratorResult<unknown>> = undefined;

		if (!isAsyncIterable) {
			// eslint-disable-next-line no-multi-assign
			for (let o = syncIterator, el = lastReadValue = o.next(); !el.done; el = o.next(), readI++) {
				if (start > 0) {
					start--;
					continue;
				}

				const
					iterVal = el.value;

				let
					valIsPromise = Object.isPromise(iterVal),
					canRender = !valIsPromise;

				if (canRender && filter != null) {
					canRender = filter.call(this.component, iterVal, readI, {
						iterable,
						i: readI,
						total: readTotal
					});

					if (Object.isPromise(canRender)) {
						valIsPromise = true;
						canRender = false;

					} else if (!Object.isTruly(canRender)) {
						canRender = false;
					}
				}

				if (canRender) {
					readTotal++;
					readEls.push(iterVal);

				} else if (valIsPromise) {
					discardedReadEls.push(iterVal);
				}

				if (readTotal >= perChunk || valIsPromise) {
					break;
				}
			}
		}

		return {
			isAsync: isAsyncIterable,

			readI,
			readTotal,
			readEls,

			iterable,
			iterator: createFinalIterator()
		};

		function createFinalIterator() {
			if (isAsyncIterable) {
				const next = () => {
					if (Object.isPromise(iterable)) {
						return iterable.then((i) => {
							const iter = i[Object.isAsyncIterable(i) ? Symbol.asyncIterator : Symbol.iterator]();
							return Promise.resolve(iter.next());
						});
					}

					return Promise.resolve(syncIterator.next());
				};

				return {
					[Symbol.asyncIterator]() {
						return this;
					},

					next
				};
			}

			let
				i = 0;

			const next = () => {
				if (discardedReadEls.length === 0 && lastReadValue?.done) {
					return lastReadValue;
				}

				if (i < discardedReadEls.length) {
					return {
						value: discardedReadEls[i++],
						done: false
					};
				}

				return syncIterator.next();
			};

			return {
				[Symbol.iterator]() {
					return this;
				},

				next
			};
		}
	}

	/**
	 * Returns an iterable structure based on the passed value
	 *
	 * @param value
	 * @param [hasFilter] - true if the passed value will be filtered
	 */
	protected getIterable(value: unknown, hasFilter?: boolean): CanPromise<AsyncIterable<unknown> | Iterable<unknown>> {
		if (value == null) {
			return [];
		}

		if (value === true) {
			if (hasFilter) {
				return new Range(0, Infinity);
			}

			return [];
		}

		if (value === false) {
			if (hasFilter) {
				return new Range(0, -Infinity);
			}

			return [];
		}

		if (Object.isNumber(value)) {
			return new Range(0, [value]);
		}

		if (Object.isArray(value)) {
			return value;
		}

		if (Object.isString(value)) {
			return value.letters();
		}

		if (Object.isPromise(value)) {
			return value.then(this.getIterable.bind(this));
		}

		if (typeof value === 'object') {
			if (Object.isIterable(value) || Object.isAsyncIterable(value)) {
				return value;
			}

			return Object.entries(value);
		}

		return [value];
	}

	//#endif
}

