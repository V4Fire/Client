import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';

/**
 *
 */
export interface GatheringStrategyData {
	/**
	 *
	 */
	renderBy: string;

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
	component: iBlock
) => Promise<GatheringStrategyData>;

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
	context: UnsafeIBlock
) => Promise<void>;
