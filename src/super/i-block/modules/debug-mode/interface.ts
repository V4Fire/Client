import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';

/**
 *
 */
export type DebugData = Dictionary<unknown>;

/**
 *
 */
export type GatheringStrategy = (
	/**
	 *
	 */
	context: iBlock
) => DebugData;

/**
 *
 */
export type RenderStrategy = (
	/**
	 *
	 */
	debugData: DebugData,

	/**
	 *
	 */
	rootComponent: iBlock,

	/**
	 *
	 */
	context: UnsafeIBlock,

	/**
	 *
	 */
	renderComponent?: string
) => void;
