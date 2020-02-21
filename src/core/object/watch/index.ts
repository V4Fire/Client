/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import proxyWatch from 'core/object/watch/engines/proxy';
import { WatchOptions, WatchHandler } from 'core/object/watch/interface';

export function watch(obj: object, cb: WatchHandler, opts?: WatchOptions) {
	let
		timer;

	if (opts?.collapseToTopProperties) {
		const
			original = cb;

		cb = (val, oldVal, p) => {
			if (!timer) {
				// tslint:disable-next-line:no-string-literal
				timer = globalThis['setImmediate'](() => {
					original(p.isRoot ? val : p.top, p.isRoot ? oldVal : p.top, p);
					timer = undefined;
				});
			}
		};
	}

	if (typeof Proxy === 'function') {
		return proxyWatch(obj, undefined, cb, opts);
	}
}

let foo = {a: {b: {c: []}}};

foo = watch(foo, (val, oldVal, key) => {
	console.log(555, val, oldVal, key);
}, {collapseToTopProperties: true, deep: true});

foo.a.b.c.push(3434);

setTimeout(() => {
	console.log(77);
	foo.a.b.c.push(232);
}, 10);
