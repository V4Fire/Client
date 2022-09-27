import type iBlock from 'super/i-block/i-block';
import type { DebugData } from 'super/i-block/modules/debug-mode/interface';

/**
 *
 * @param context
 */
export default function backendDebugDataEngine(
	context: iBlock
): DebugData {
	return Object.fastClone(context.field.get('DB.debug')) ?? {};
}
