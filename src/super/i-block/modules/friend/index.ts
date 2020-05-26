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

	/** @see [[iBlock.componentId]] */
	get componentId(): string {
		return this.ctx.componentId;
	}

	/** @see [[iBlock.componentName]] */
	get componentName(): string {
		return this.ctx.componentName;
	}

	/** @see [[iBlock.globalName]] */
	get globalName(): CanUndef<string> {
		return this.ctx.globalName;
	}

	/** @see [[iBlock.componentStatus]] */
	get componentStatus(): this['CTX']['componentStatus'] {
		return this.ctx.componentStatus;
	}

	/** @see [[iBlock.$asyncLabel]] */
	get asyncLabel(): symbol {
		return this.ctx.$asyncLabel;
	}

	/** @see [[iBlock.hook]] */
	get hook(): this['CTX']['hook'] {
		return this.ctx.hook;
	}

	/** @see [[iBlock.$el]] */
	get node(): this['CTX']['$el'] {
		return this.ctx.$el;
	}

	/** @see [[iBlock.field]] */
	get field(): this['CTX']['field'] {
		return this.ctx.field;
	}

	/** @see [[iBlock.provide]] */
	get provide(): this['CTX']['provide'] {
		return this.ctx.provide;
	}

	/** @see [[iBlock.lfc]] */
	get lfc(): this['CTX']['lfc'] {
		return this.ctx.lfc;
	}

	/** @see [[iBlock.meta]] */
	protected get meta(): this['CTX']['meta'] {
		return this.ctx.meta;
	}

	/** @see [[iBlock.$activeField]] */
	protected get activeField(): CanUndef<string> {
		return this.ctx.$activeField;
	}

	/** @see [[iBlock.localEmitter]] */
	protected get localEmitter(): this['CTX']['localEmitter'] {
		return this.ctx.localEmitter;
	}

	/** @see [[iBlock.async]] */
	protected get async(): this['CTX']['async'] {
		return this.ctx.async;
	}

	/** @see [[iBlock.storage]] */
	protected get storage(): this['CTX']['storage'] {
		return this.ctx.storage;
	}

	/** @see [[iBlock.block]] */
	protected get block(): this['CTX']['block'] {
		return this.ctx.block;
	}

	/** @see [[iBlock.$refs]] */
	protected get refs(): this['CTX']['$refs'] {
		return this.ctx.$refs;
	}

	/** @see [[iBlock.dom]] */
	protected get dom(): this['CTX']['dom'] {
		return this.ctx.dom;
	}

	constructor(component: any) {
		if (!(component?.instance instanceof iBlock)) {
			throw new TypeError("The specified component isn't inherited from iBlock");
		}

		this.ctx = component.unsafe;
		this.component = component;
	}
}
