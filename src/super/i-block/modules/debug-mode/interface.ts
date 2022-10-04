import type iBlock from 'super/i-block/i-block';
import type { UnsafeIBlock } from 'super/i-block/i-block';

/**
 *
 */
export type RenderBy = 'bottom-block' | 'upper-block';

/**
 *
 */
export type RenderComponent = 'b-debug-data';

/**
 *
 */
export type RenderData = Map<string, any>;

/**
 *
 */
export type ComponentDebugData = Map<RenderBy, RenderData>;

/**
 *
 */
export interface GatheringStrategyData {
	/**
	 *
	 */
	renderBy: RenderBy;

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
	context: UnsafeIBlock,

	/**
	 *
	 */
	renderComponent?: string
) => Promise<void>;
