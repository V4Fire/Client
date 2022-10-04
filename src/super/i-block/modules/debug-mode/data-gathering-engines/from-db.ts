import type iBlock from 'super/i-block/i-block';
import type { GatheringStrategyData } from 'super/i-block/modules/debug-mode/interface';

import { renderFromDbFieldIn } from 'super/i-block/modules/debug-mode/const';

/**
 *
 * @param context
 */
export default function getDataFromDbField(
	context: iBlock
): Promise<GatheringStrategyData> {
	return new Promise(async (resolve, reject) => {
		await context.waitStatus('beforeReady');

		const
			componentDb = context.field.get('db');

		if (componentDb == null || !Object.has(componentDb, 'debug')) {
			return reject('The debug field is not found in the db');
		}

		const
			data = <Dictionary>Object.get(componentDb, 'debug');

		return resolve({renderBy: renderFromDbFieldIn, data});
	});
}
