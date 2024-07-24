/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import config from 'config';

import { delay } from 'core/component/gc/helpers';
import { queue } from 'core/component/gc/const';

(async () => {
	let time = Date.now();

	const sleep = () => delay().then(() => {
		time = Date.now();
	});

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const task = queue.shift();

		if (task == null) {
			await sleep();

		} else {
			while (!task.next().done) {
				if (Date.now() - time >= config.gc.quota) {
					await sleep();
				}
			}
		}
	}
})();
