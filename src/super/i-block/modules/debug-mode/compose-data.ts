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
			storageDebugData = new Map();

		data.forEach((result) => {
			if (result.status === 'rejected') {
				return stderr(result.reason);
			}

			const
				{value} = result,
				{renderBy, data} = value;

			if (!storageDebugData.has(renderBy)) {
				storageDebugData.set(renderBy, new Map());
			}

			const
				oldFieldData = storageDebugData.get(renderBy),
				newFieldData = new Map([oldFieldData, data]);

			storageDebugData.set(renderBy, newFieldData);
		});

		if (storageDebugData.size === 0) {
			return reject('No data was received');
		}

		await context.storage.set(storageDebugData, 'ComponentDebugData');

		return resolve();
	});
}
