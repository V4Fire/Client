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
 * @typeParam T - component
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

	/** {@link iBlock.componentId} */
	get componentId(): string {
		return this.ctx.componentId;
	}

	/** {@link iBlock.componentName} */
	get componentName(): string {
		return this.ctx.componentName;
	}

	/** {@link iBlock.globalName} */
	get globalName(): CanUndef<string> {
		return this.ctx.globalName;
	}

	/** {@link iBlock.componentStatus} */
	get componentStatus(): this['CTX']['componentStatus'] {
		return this.ctx.componentStatus;
	}

	/** {@link iBlock.$asyncLabel} */
	get asyncLabel(): symbol {
		return this.ctx.$asyncLabel;
	}

	/** {@link iBlock.hook} */
	get hook(): this['CTX']['hook'] {
		return this.ctx.hook;
	}

	/** {@link iBlock.$el} */
	get node(): this['CTX']['$el'] {
		return this.ctx.$el;
	}

	/** {@link iBlock.field} */
	get field(): this['CTX']['field'] {
		return this.ctx.field;
	}

	/** {@link iBlock.provide} */
	get provide(): this['CTX']['provide'] {
		return this.ctx.provide;
	}

	/** {@link iBlock.lfc} */
	get lfc(): this['CTX']['lfc'] {
		return this.ctx.lfc;
	}

	/** {@link iBlock.meta} */
	protected get meta(): this['CTX']['meta'] {
		return this.ctx.meta;
	}

	/** {@link iBlock.$activeField} */
	protected get activeField(): CanUndef<string> {
		return this.ctx.$activeField;
	}

	/** {@link iBlock.localEmitter} */
	protected get localEmitter(): this['CTX']['localEmitter'] {
		return this.ctx.localEmitter;
	}

	/** {@link iBlock.async} */
	protected get async(): this['CTX']['async'] {
		return this.ctx.async;
	}

	/** {@link iBlock.storage} */
	protected get storage(): this['CTX']['storage'] {
		return this.ctx.storage;
	}

	/** {@link iBlock.block} */
	protected get block(): this['CTX']['block'] {
		return this.ctx.block;
	}

	/** {@link iBlock.$refs} */
	protected get refs(): this['CTX']['$refs'] {
		return this.ctx.$refs;
	}

	/** {@link iBlock.dom} */
	protected get dom(): this['CTX']['dom'] {
		return this.ctx.dom;
	}

	constructor(component: iBlock) {
		if (!(Object.get(component, 'instance') instanceof iBlock)) {
			throw new TypeError("The specified component isn't inherited from iBlock");
		}

		this.ctx = component.unsafe;
		this.component = component;
	}
}
