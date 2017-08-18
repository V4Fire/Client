'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { watch } from 'super/i-block/i-block';
import { component } from 'core/component';
import Store from 'core/store';

export const
	$$ = new Store();

@component()
export default class bImage extends iBlock {
	/**
	 * Target image src
	 */
	@watch('initOverlay')
	src: string;

	/**
	 * Show lazy overlay if true
	 */
	@watch('initOverlay')
	load: ?boolean = false;

	/**
	 * Icon value for broken state
	 */
	brokenIcon: string = 'damaged';

	/** @override */
	get refs(): {img: HTMLImageElement} {}

	/** @inheritDoc */
	static mods = {
		'hide-image': [
			'true',
			['false']
		]
	};

	/**
	 * Handler: image loaded
	 * @emits loaded
	 */
	onImageLoaded() {
		this.setMod('loading', false);
		this.$set(this.tmp, this.src, true);
		this.emit('loaded');
	}

	/**
	 * Handler: image load error
	 * @emits loadError
	 */
	onImageError() {
		this.setMod('error', true);
		this.emit('loadError');
	}

	/**
	 * Initializes overlay, that shown during the image loading process
	 */
	async initOverlay() {
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
				$a.on(img, 'load', {
					label: $$.imgLoad,
					fn: this.onImageLoaded
				});

				$a.on(img, 'error', {
					label: $$.imgLoad,
					fn: this.onImageError
				});
			}
		}
	}

	/** @inheritDoc */
	async created() {
		await this.initOverlay();
	}

	/** @inheritDoc */
	mounted() {
		if (!this.load) {
			this.setMod('disabled', true);
		}
	}
}
