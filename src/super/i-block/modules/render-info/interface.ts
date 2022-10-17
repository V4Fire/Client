import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';

/**
 * Data collection result
 */
export interface GatheringStrategyData {
	/**
	 * Component in which you want to render the data
	 */
	renderBy: string;

	/**
	 * Collected data
	 */
	data: Dictionary;
}

/**
 * Data collection strategy
 */
export type GatheringStrategy = (
	/**
	 * Current component
	 */
	component: iBlock
) => Promise<GatheringStrategyData>;

/**
 * Data rendering strategy
 */
export type RenderStrategy = (
	/**
	 * Current component
	 */
	rootComponent: iBlock,

	/**
	 * Current context
	 */
	context: UnsafeIBlock,

	/**
	 * Data for rendering
	 */
	data: Dictionary
) => Promise<void>;
