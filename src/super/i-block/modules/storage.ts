/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export type MemoizedLiteral<T = unknown> =
	Readonly<Dictionary<T>> |
	ReadonlyArray<T>;

export const
	literalCache = Object.createDict<MemoizedLiteral>();

export default class Opt {
	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * Cache of ifOnce
	 */
	protected get ifOnceStore(): Dictionary {
		// @ts-ignore
		return this.component.ifOnceStore;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Saves the specified settings to a local storage by a key
	 *
	 * @param settings
	 * @param [key] - data storage key
	 */
	protected async save<T extends object = Dictionary>(settings: T, key: string = ''): Promise<T> {
		const
			$a = this.async,
			id = `${this.globalName}_${key}`;

		return $a.promise(async () => {
			try {
				const
					s = this.storage;

				if (s) {
					await s.set(id, settings);
					this.log('settings:save', () => Object.fastClone(settings));
				}

			} catch {}

			return settings;

		}, {
			label: id,
			group: 'saveSettings',
			join: 'replace'
		});
	}

	/**
	 * Loads settings from a local storage by the specified key
	 * @param [key] - data key
	 */
	protected load<T extends object = Dictionary>(key: string = ''): Promise<CanUndef<T>> {
		const
			id = `${this.globalName}_${key}`;

		return this.async.promise(async () => {
			try {
				const
					s = this.storage;

				if (s) {
					const res = await s.get<T>(id);
					this.log('settings:load', () => Object.fastClone(res));
					return res;
				}

			} catch {}

		}, {
			label: id,
			group: 'loadSettings',
			join: true
		});
	}
}
