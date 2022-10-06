import type { UnsafeIBlock } from 'super/i-block/i-block';
import type { GatheringStrategyData } from 'super/i-block/modules/debug-mode/interface';

/**
 *
 * @param data
 * @param context
 */
export default function composeDataEngine(
	data: Array<PromiseSettledResult<GatheringStrategyData>>,
	context: UnsafeIBlock
): Promise<void> {
	return new Promise(async (resolve, reject) => {
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

		await context.storage.set(storageDebugData, 'DebugData');

		return resolve();
	});
}
