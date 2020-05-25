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
 * Class that friendly to a component
 * @typeparam T - component
 */
export default class Friend {
	/**
	 * Type: component instance
	 */
	readonly C!: iBlock;

	/**
	 * Type: component context
	 */
	readonly CTX!: this['C']['unsafe'];

	/**
	 * Component instance
	 */
	readonly component: this['C'];

	/**
	 * Component context
	 */
	protected readonly ctx: this['CTX'];

	/** @see [[iBlock.meta]] */
	protected get meta(): this['CTX']['meta'] {
		return this.ctx.meta;
	}

	/** @see [[iBlock.storage]] */
	protected get storage(): this['CTX']['storage'] {
		return this.ctx.storage;
	}

	/** @see [[iBlock.lfc]] */
	protected get lfc(): this['CTX']['lfc'] {
		return this.ctx.lfc;
	}

	/** @see [[iBlock.field]] */
	protected get field(): this['CTX']['field'] {
		return this.ctx.field;
	}

	/** @see [[iBlock.async]] */
	protected get async(): this['CTX']['async'] {
		return this.ctx.async;
	}

	/** @see [[iBlock.block]] */
	protected get block(): this['CTX']['block'] {
		return this.ctx.block;
	}

	/** @see [[iBlock.provide]] */
	protected get provide(): this['CTX']['provide'] {
		return this.ctx.provide;
	}

	/** @see [[iBlock.localEmitter]] */
	protected get localEmitter(): this['CTX']['localEmitter'] {
		return this.ctx.localEmitter;
	}

	/** @see [[iBlock.dom]] */
	protected get dom(): this['CTX']['dom'] {
		return this.ctx.dom;
	}

	/** @see [[iBlock.$refs]] */
	protected get refs(): this['CTX']['$refs'] {
		return this.ctx.$refs;
	}

	constructor(component: any) {
		if (!(component?.instance instanceof iBlock)) {
			throw new TypeError("The specified component isn't inherited from iBlock");
		}

		this.ctx = component.unsafe;
		this.component = component;
	}
}
