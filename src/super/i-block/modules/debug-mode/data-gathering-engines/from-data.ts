import type iBlock from 'super/i-block/i-block';
import type { GatheringStrategyData } from 'super/i-block/modules/debug-mode/interface';

const
	renderBy = 'bottom-block';

/**
 *
 * @param context
 */
export default function getDataFromDataField(
	context: iBlock
): Promise<GatheringStrategyData> {
	return new Promise(async (resolve, reject) => {
		await context.waitStatus('beforeReady');

		const
			componentDb = context.field.get('data');

		if (componentDb == null || !Object.has(componentDb, 'debug')) {
			return reject('The debug field is not found in the data');
		}

		const
			data = <Dictionary>Object.get(componentDb, 'debug');

		return resolve({renderBy, data});
	});
}
