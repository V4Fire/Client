/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Range from 'core/range';
import { seq } from 'core/iter/combinators';

import type Friend from 'components/friends/friend';
import type { IterOptions, IterDescriptor } from 'components/friends/async-render/interface';

/**
 * Returns an iterator descriptor based on the passed value and options
 *
 * @param value
 * @param [opts]
 * @param [opts.start]
 * @param [opts.perChunk]
 * @param [opts.filter]
 */
export function getIterDescriptor(
	this: Friend,
	value: unknown,
	{start = 0, perChunk = 1, filter}: IterOptions = {}
): IterDescriptor {
	const
		iterable = getIterable.call(this, value, filter != null);

	let
		iterator: AnyIterableIterator,
		isAsyncIterable = false;

	const
		readEls: unknown[] = [],
		discardedReadEls: unknown[] = [];

	let
		readI = 0,
		readTotal = 0,
		lastReadValue: CanUndef<IteratorResult<unknown>> = undefined;

	if (Object.isAsyncIterable(iterable)) {
		isAsyncIterable = true;
		iterator = Object.cast(iterable[Symbol.asyncIterator]());

	} else if (Object.isPromise(iterable)) {
		isAsyncIterable = true;

		let
			innerIter: Nullable<Iterator<unknown>>,
			pendedResult: Nullable<Promise<IteratorResult<unknown>>>;

		iterator = {
			[Symbol.asyncIterator]() {
				return this;
			},

			next: () => {
				if (innerIter != null) {
					return Promise.resolve(innerIter.next());
				}

				if (pendedResult != null) {
					return pendedResult;
				}

				const res = iterable.then(async (v) => {
					const i = await getIterable.call(this, v);
					innerIter = i[Object.isAsyncIterable(i) ? Symbol.asyncIterator : Symbol.iterator]();
					return innerIter!.next();
				});

				pendedResult = res;
				return res;
			}
		};

	} else {
		iterator = <IterableIterator<unknown>>iterable[Symbol.iterator]();

		// eslint-disable-next-line no-multi-assign
		for (let o = iterator, el = lastReadValue = o.next(); !el.done; el = o.next(), readI++) {
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
				const filterRes = filter.call(this.component, iterVal, readI, {
					iterable,
					total: readTotal
				});

				if (Object.isPromise(filterRes)) {
					valIsPromise = true;
					canRender = false;

				} else {
					canRender = Object.isTruly(filterRes);
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
		if (Object.isAsyncIterator(iterator)) {
			return iterator;
		}

		const
			innerIter = seq(discardedReadEls, iterator);

		const next = () => {
			if (discardedReadEls.length === 0 && lastReadValue?.done) {
				return lastReadValue;
			}

			return innerIter.next();
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
export function getIterable(
	this: Friend,
	value: unknown,
	hasFilter?: boolean
): CanPromise<AnyIterable> {
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
		return value.then(getIterable.bind(this));
	}

	if (typeof value === 'object') {
		if (Object.isIterable(value) || Object.isAsyncIterable(value)) {
			return value;
		}

		return Object.entries(value);
	}

	return [value];
}
