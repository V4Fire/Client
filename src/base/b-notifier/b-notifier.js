'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iData from 'super/i-data/i-data';
import { component } from 'core/component';

const
	$C = require('collection.js'),
	ion = require('ion-sound');

ion.sound({
	sounds: [
		{name: 'door_bell'}
	],

	volume: 1,
	path: `/dist/packages/${PATH.sounds}/`,
	preload: true
});

export const
	$$ = new Store();

@component()
export default class bNotifier extends iData {
	/** @override */
	dataProviderParams: Object = {listenAllEvents: true};

	/**
	 * Default project title
	 */
	title: string = 'V4Fire';

	/**
	 * Notify rules
	 */
	rules: Object = {};

	/**
	 * If false, the helper tooltip won't be displayed
	 */
	showTooltip: boolean = true;

	/**
	 * Notification permission
	 */
	get permission(): string {
		try {
			return Notification.permission;

		} catch (_) {
			return 'denied';
		}
	}

	/** @override */
	async initLoad() {
		const
			opts = await this.loadSettings() || {};

		if (opts.hidden) {
			this.setMod('hidden', opts.hidden);
		}

		await super.initLoad();
	}

	/**
	 * Requests for notifications
	 */
	async requestPermissions() {
		if (await Notification.requestPermission()) {
			await this.setMod('hidden', true);
		}
	}

	/**
	 * Sends notifications
	 * @param data
	 */
	notify(data: {instance: string, type: string, data: Object}) {
		if (!data.instance) {
			return;
		}

		try {
			if (!Notification.permission) {
				return;
			}

			let
				rule = $C(this.rules).get([data.instance, data.type]);

			if (!rule || rule.test && !rule.test(data)) {
				return;
			}

			const
				{onshow} = rule;

			rule = {...rule, silent: true};
			rule.onshow = function () {
				ion.sound.play('door_bell');
				onshow && onshow.apply(this, arguments);
			};

			Object.assign(
				new Notification(rule.title ? rule.title(data) : this.title, {
					tag: data.instance,
					body: rule.body(data),
					icon: '/assets/favicons/favicon.ico',
					...Object.reject(rule, /^(on|body$)/),
				}),

				$C(Object.select(rule, /^on/)).map((fn) => (e) => fn(e, data))
			);

		} catch (_) {}
	}

	/** @override */
	async onAddData(data: Object) {
		await this.notify(data);
	}

	/** @override */
	async onUpdData(data: Object) {
		await this.notify(data);
	}

	/** @override */
	async onDelData(data: Object) {
		await this.notify(data);
	}

	/** @inheritDoc */
	created() {
		this.localEvent.on('block.mod.*.hidden.*', (el) => this.saveSettings({[el.name]: el.value}));
	}
}
