/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock, { component, prop, wait, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component({functional: true})
export default class bImage extends iBlock {
	/**
	 * Target image src
	 */
	@prop({type: String, watch: {fn: 'initOverlay', immediate: true}})
	readonly src!: string;

	/**
	 * Show lazy overlay if true
	 */
	@prop({type: Boolean, watch: 'initOverlay'})
	readonly load: boolean = false;

	/**
	 * Icon value for a broken state
	 */
	@prop(String)
	readonly brokenIcon: string = 'damaged';

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		hideImage: [
			'true',
			['false']
		]
	};

	/** @override */
	protected readonly $refs!: {
		img: HTMLImageElement;
	};

	/**
	 * Handler: image loaded
	 * @emits load
	 */
	protected onImageLoaded(): void {
		this.setMod('loading', false);
		this.tmp[this.src] = true;
		this.emit('load');
	}

	/**
	 * Handler: image load error
	 * @emits loadError
	 */
	protected onImageError(): void {
		this.setMod('error', true);
		this.emit('loadError');
	}

	/**
	 * Initializes overlay, that shown during the image loading process
	 */
	@wait('ready', {label: $$.initOverlay, defer: true})
	protected async initOverlay(): Promise<void> {
		if (this.load && !this.tmp[this.src]) {
			await this.setMod('disabled', false);
			await this.setMod('loading', true);
			await this.waitRef('img');

			const
				{async: $a} = this,
				{img} = this.$refs,
				{width, height} = img;

			if (width || height) {
				this.onImageLoaded();

			} else {
				$a.on(img, 'load', this.onImageLoaded, {
					label: $$.imgLoad
				});

				$a.on(img, 'error', this.onImageError, {
					label: $$.imgLoad
				});
			}
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.bindModTo('disabled', 'load');
	}
}
