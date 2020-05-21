/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/friend/README.md]]
 * @packageDocumentation
 */

import iBlock from 'super/i-block/i-block';

/**
 * Class is friendly to a component
 * @typeparam T - component
 */
export default class Friend<C extends iBlock = iBlock> {
	/**
	 * Type: unsafe component instance
	 */
	readonly C!: C['unsafe'];

	/**
	 * Component instance
	 */
	protected readonly component: this['C'];

	/** @see [[iBlock.meta]] */
	protected get meta(): this['C']['meta'] {
		return this.component.meta;
	}

	/** @see [[iBlock.storage]] */
	protected get storage(): this['C']['storage'] {
		return this.component.storage;
	}

	/** @see [[iBlock.lfc]] */
	protected get lfc(): this['C']['lfc'] {
		return this.component.lfc;
	}

	/** @see [[iBlock.field]] */
	protected get field(): this['C']['field'] {
		return this.component.field;
	}

	/** @see [[iBlock.async]] */
	protected get async(): this['C']['async'] {
		return this.component.async;
	}

	/** @see [[iBlock.block]] */
	protected get block(): this['C']['block'] {
		return this.component.block;
	}

	/** @see [[iBlock.provide]] */
	protected get provide(): this['C']['provide'] {
		return this.component.provide;
	}

	/** @see [[iBlock.localEmitter]] */
	protected get localEmitter(): this['C']['localEmitter'] {
		return this.component.localEmitter;
	}

	/** @see [[iBlock.lazy]] */
	protected get lazy(): this['C']['lazy'] {
		return this.component.lazy;
	}

	constructor(component: C) {
		this.component = component.unsafe;
	}
}
