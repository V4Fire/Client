'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import keyCodes from 'core/keyCodes';
import iBlock, { field, bindModTo } from 'super/i-block/i-block';
import { component } from 'core/component';

@component()
export default class iMessage extends iBlock {
	/**
	 * Initial information message
	 */
	infoProp: ?string;

	/**
	 * Initial error message
	 */
	errorProp: ?string;

	/**
	 * Information message store
	 */
	@field((o) => o.link('infoProp'))
	infoMsg: ?string;

	/**
	 * Error message store
	 */
	@field((o) => o.link('errorProp'))
	errorMsg: ?string;

	/** @inheritDoc */
	static mods = {
		@bindModTo('infoMsg')
		showInfo: [
			'true',
			['false']
		],

		@bindModTo('errorMsg')
		showError: [
			'true',
			['false']
		],

		opened: [
			'true',
			['false']
		]
	};

	/**
	 * Information message
	 */
	get info(): string {
		return this.infoMsg;
	}

	/**
	 * Sets a new information message
	 * @param value
	 */
	set info(value: string) {
		this.infoMsg = value;
	}

	/**
	 * Error message
	 */
	get error(): string {
		return this.errorMsg;
	}

	/**
	 * Sets a new error message
	 * @param value
	 */
	set error(value: string) {
		this.errorMsg = value;
	}

	/**
	 * Opens the block
	 * @emits open()
	 */
	async open(): boolean {
		if (await this.setMod('opened', true)) {
			this.emit('open');
			return true;
		}

		return false;
	}

	/**
	 * Closes the block
	 * @emits close()
	 */
	async close(): boolean {
		if (await this.setMod('opened', false)) {
			this.emit('close');
			return true;
		}

		return false;
	}

	/**
	 * Toggles the block
	 */
	toggle(): Promise<boolean> {
		return this.mods.opened === 'true' ? this.close() : this.open();
	}

	/**
	 * Initializes close helpers
	 */
	initCloseHelpers() {
		const
			{async: $a, localEvent: $e} = this,
			group = 'closeHelpers';

		const closeHelpers = () => {
			$a.on(document, 'keyup', {
				group,
				fn: (e) => {
					if (e.keyCode === keyCodes.ESC) {
						return this.close();
					}
				}
			});

			$a.on(document, 'click', {
				group,
				fn: (e) => {
					if (!e.target.closest(`.${this.blockId}`)) {
						return this.close();
					}
				}
			});
		};

		$e.removeAllListeners('block.mod.set.opened.*');
		$e.on('block.mod.set.opened.true', closeHelpers);
		$e.on('block.mod.set.opened.false', () => $a.off({group}));
	}

	/** @inheritDoc */
	created() {
		this.localEvent.on('block.mod.*.valid.*', ({type, value}) => {
			if (type === 'remove' && value === 'false' || type === 'set' && value === 'true') {
				this.error = '';
			}
		});
	}
}
