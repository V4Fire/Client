import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';

/**
 *
 */
export interface DebugData {
	/**
	 *
	 */
	component: string;

	/**
	 *
	 */
	data: Dictionary;
}

/**
 *
 */
export type GatheringStrategy = (
	/**
	 *
	 */
	context: iBlock
) => Promise<CanUndef<DebugData>>;

/**
 *
 */
export type RenderStrategy = (
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
) => Promise<boolean>;
