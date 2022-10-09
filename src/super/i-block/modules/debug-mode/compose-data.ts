import type { GatheringStrategyData } from 'super/i-block/modules/debug-mode/interface';

/**
 * Combines data into a single object
 * @param data
 */
export default function composeDataEngine(
	data: Array<PromiseSettledResult<GatheringStrategyData>>
): Promise<Dictionary> {
	return new Promise((resolve, reject) => {
		const
			storageDebugData = {};

		data.forEach((result) => {
			if (result.status === 'rejected') {
				return stderr(result.reason);
			}

			const
				{value} = result,
				{renderBy, data} = value;

			if (!Object.has(storageDebugData, renderBy)) {
				Object.set(storageDebugData, renderBy, {});
			}

			const
				oldFieldData = Object.get(storageDebugData, renderBy),
				newFieldData = Object.assign(oldFieldData, data);

			Object.set(storageDebugData, renderBy, newFieldData);
		});

		if (Object.size(storageDebugData) === 0) {
			return reject('No data was received');
		}

		return resolve(storageDebugData);
	});
}
