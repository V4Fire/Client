/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { gc } from 'core/component';

import type iBlock from 'components/super/i-block/i-block';

export default class Friend {
	/**
	 * Type: the main component instance
	 */
	readonly C!: iBlock;

	/**
	 * Type: the main component context
	 */
	readonly CTX!: this['C']['unsafe'];

	/**
	 * The main component instance
	 */
	readonly component: this['C'];

	/**
	 * The main component context
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

	/** {@link iBlock.hook} */
	get hook(): this['CTX']['hook'] {
		return this.ctx.hook;
	}

	/** {@link iBlock.$el} */
	get node(): this['CTX']['$el'] {
		return this.refs[this.ctx.$resolveRef('$el')] ?? this.ctx.$el;
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

	/** {@link iBlock.remoteState} */
	protected get remoteState(): this['CTX']['remoteState'] {
		return this.ctx.remoteState;
	}

	constructor(component: iBlock) {
		this.ctx = component.unsafe;
		this.component = component;

		this.ctx.$async.worker(() => {
			const that = this;

			// We are cleaning memory in a deferred way, because this API may be needed when processing the destroyed hook
			gc.add(function* destructor() {
				Object.delete(that, 'ctx');
				Object.delete(that, 'component');
				yield;
			}());
		});
	}
}
