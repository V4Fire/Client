'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData from 'super/i-data/i-data';
import keyCodes from 'core/keyCodes';
import { field } from 'super/i-block/i-block';
import { component } from 'core/component';

@component()
export default class bWindow extends iData {
	/**
	 * Initial window title
	 */
	titleProp: ?string;

	/**
	 * Map of window titles ({stage: title})
	 */
	stageTitles: Object = {};

	/**
	 * Window title store
	 */
	@field((o) => o.link('titleProp'))
	titleStore: ?string;

	/** @inheritDoc */
	static mods = {
		hidden: [
			['true'],
			'false'
		]
	};

	/** @override */
	set error(value: string) {
		if (value) {
			this.stage = 'error';
		}

		this.errorMsg = value;
	}

	/**
	 * Window title
	 */
	get title(): ?string {
		return this.titleStore || this.t(this.stageTitles[this.stage]);
	}

	/**
	 * Sets the specified window title
	 */
	set title(value: ?string) {
		this.titleStore = value;
	}

	/** @inheritDoc */
	$$stage(value, oldValue) {
		this.async.clearAll({group: `stage.${oldValue}`});
	}

	/**
	 * Handler: error
	 * @param err
	 */
	onError(err: Error) {
		this.error = this.getDefaultErrorText(err);
	}

	/**
	 * @override
	 * @param [stage] - window stage
	 */
	async open(stage?: string): boolean {
		if (await this.setMod('hidden', false)) {
			if (stage) {
				this.stage = stage;

			} else {
				this.stage = this.id ? 'edit' : 'new';
			}

			await this.nextTick();
			this.emit('open');
			return true;
		}

		return false;
	}

	/** @override */
	async close(): boolean {
		if (await this.setMod('hidden', true)) {
			this.emit('close');
			return true;
		}

		return false;
	}

	/** @override */
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
					if (e.target.matches(this.block.getElSelector('wrapper'))) {
						return this.close();
					}
				}
			});
		};

		$e.removeAllListeners('block.mod.*.hidden.*');
		$e.on('block.mod.remove.hidden.*', closeHelpers);
		$e.on('block.mod.set.hidden.false', closeHelpers);
		$e.on('block.mod.set.hidden.true', () => $a.off({group}));
	}

	/** @inheritDoc */
	created() {
		this.initCloseHelpers();
	}

	/** @inheritDoc */
	mounted() {
		document.body.prepend(this.$el);
	}
}
