/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { GatheringStrategyData } from 'components/friends/info-render/interface';

/**
 * Combines multiple data objects into one
 * @param data
 */
export default function composeDataEngine(
	...data: Array<PromiseSettledResult<GatheringStrategyData>>
): Promise<Dictionary> {
	return new Promise((resolve, reject) => {
		const
			composedData = {};

		data.forEach((result) => {
			if (result.status === 'rejected') {
				return;
			}

			const
				{value} = result,
				{renderBy, data} = value;

			if (!Object.has(composedData, renderBy)) {
				Object.set(composedData, renderBy, {});
			}

			const
				oldFieldData = <Dictionary>Object.get(composedData, renderBy),
				newFieldData = Object.assign(oldFieldData, data);

			Object.set(composedData, renderBy, newFieldData);
		});

		return Object.size(composedData) === 0 ?
			reject(new Error('No data was received')) :
			resolve(composedData);
	});
}
