'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import bButton from 'form/b-button/b-button';
import { component } from 'core/component';
export class bUploaderError extends Error {}

export const
	$$ = new Store();

@component()
export default class bFileButton extends bButton {
	/**
	 * Test function
	 */
	test: ?Function;

	/**
	 * Accept string
	 */
	accept: ?string;

	/**
	 * Read type
	 */
	read: string = 'readAsDataURL';

	/** @override */
	get $refs(): {file: HTMLInputElement, button: HTMLButtonElement} {}

	/**
	 * Handler: file change
	 *
	 * @param e
	 * @emits set(result: InputEvent.target.result)
	 * @emits error(err: bUploaderError)
	 */
	onFileSelected(e: InputEvent) {
		const
			file = e.target.files[0],
			reader = new FileReader();

		if (this.test && !this.test(file)) {
			this.emit('error', new bUploaderError('TEST_FAIL'));
			return;
		}

		reader.onload = this.async.proxy((e) => this.emit('set', e.target.result));
		reader[this.read](file);
	}

	/**
	 * Resetting value of the file input
	 */
	reset() {
		this.$refs.file.value = '';
	}

	/** @inheritDoc */
	mounted() {
		const {file, button} = this.$refs;
		this.async.on(button, 'click', {
			label: $$.activation,
			fn: () => file.click()
		});
	}
}
