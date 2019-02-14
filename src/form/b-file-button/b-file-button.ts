/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bButton, { component, prop, wait, ButtonType } from 'form/b-button/b-button';

export * from 'form/b-button/b-button';
export class bUploaderError extends Error {}

export interface Test {
	(file: File): boolean;
}

export type ReadType =
	'readAsArrayBuffer' |
	'readAsBinaryString' |
	'readAsBlob' |
	'readAsDataURL' |
	'readAsText';

export const
	$$ = symbolGenerator();

@component()
export default class bFileButton<T extends Dictionary = Dictionary> extends bButton<T> {
	/** @override */
	@prop(String)
	readonly type: ButtonType<ReadType> = 'readAsBlob';

	/**
	 * Accept string
	 */
	@prop({type: String, required: false})
	readonly accept?: string;

	/**
	 * Test function
	 */
	@prop({type: Function, required: false})
	readonly test?: Test;

	/** @override */
	protected readonly $refs!: bButton['$refs'] & {
		file: HTMLInputElement;
	};

	/**
	 * Resets a value of the file input
	 */
	@wait('ready')
	reset(): CanPromise<void> {
		this.$refs.file.value = '';
	}

	/**
	 * Handler: file change
	 *
	 * @param e
	 * @emits change(result: InputEvent.target.result)
	 * @emits error(err: bUploaderError)
	 */
	protected onFileSelected(e: Event): void {
		const
			file = (<any>e.target).files[0],
			reader = new FileReader(),
			read = this.type;

		if (this.test && !this.test(file)) {
			this.emit('error', new bUploaderError('TEST_FAIL'));
			return;
		}

		this.async.on(reader, 'load', (e) => this.emit('change', e.target.result));
		reader[Object.isFunction(reader[read]) ? read : 'readAsBlob'](file);
	}

	/** @override */
	protected async onClick(e: Event): Promise<void> {
		this.$refs.file.click();
		this.emit('click', e);
	}
}
