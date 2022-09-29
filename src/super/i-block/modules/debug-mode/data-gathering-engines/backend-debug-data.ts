import type iBlock from 'super/i-block/i-block';
import type { DebugData } from 'super/i-block/modules/debug-mode/interface';

/**
 *
 * @param context
 */
export default async function backendDebugDataEngine(
	context: iBlock
): Promise<CanUndef<DebugData>> {
	await context.waitStatus('beforeReady');

	const
		componentData = context.field.get('data');

	if (componentData == null || !Object.has(componentData, 'debug')) {
		return;
	}

	const
		component = 'b-debug-data',
		data = <Dictionary>Object.get(componentData, 'debug');

	return {component, data};
}
