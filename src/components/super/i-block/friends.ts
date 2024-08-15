/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as browser from 'core/browser';
import * as helpers from 'core/helpers';
import * as presets from 'components/presets';

import Daemons, { DaemonsDict } from 'components/friends/daemons';
import Analytics from 'components/friends/analytics';

import DOM from 'components/friends/dom';
import VDOM from 'components/friends/vdom';
import Opt from 'components/super/i-block/modules/opt';

import AsyncRender from 'components/friends/async-render';
import ModuleLoader from 'components/friends/module-loader';
import Sync from 'components/friends/sync';

import Field from 'components/friends/field';
import Provide from 'components/friends/provide';
import InfoRender from 'components/friends/info-render';
import type Block from 'components/friends/block';

import Lfc from 'components/super/i-block/modules/lfc';
import State from 'components/friends/state';
import Storage from 'components/friends/storage';

import { component } from 'core/component';
import { system, hook, computed } from 'components/super/i-block/decorators';

import iBlockProps from 'components/super/i-block/props';

@component({partial: 'iBlock'})
export default abstract class iBlockFriends extends iBlockProps {
	/**
	 * An API for providing component classes, styles and other related properties to another component
	 */
	@computed({cache: 'forever'})
	get provide(): Provide {
		return new Provide(Object.cast(this));
	}

	/**
	 * An API for safely accessing the component's properties or any other object
	 *
	 * @example
	 * ```js
	 * this.field.get('foo.bar.bla')
	 * ```
	 */
	@computed({cache: 'forever'})
	get field(): Field {
		return new Field(Object.cast(this));
	}

	/**
	 * An API for synchronizing fields and props of the component
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo {
	 *   @prop()
	 *   blaProp: string;
	 *
	 *   @field((ctx) => ctx.sync.link('blaProp'))
	 *   bla: string;
	 * }
	 * ```
	 */
	@computed({cache: 'forever'})
	get sync(): Sync {
		return new Sync(Object.cast(this));
	}

	/**
	 * An API for rendering component fragments asynchronously
	 *
	 * @example
	 * ```
	 * < .bla v-for = el in asyncRender.iterate(veryBigList, 10)
	 *   {{ el }}
	 * ```
	 */
	@computed({cache: 'forever'})
	get asyncRender(): AsyncRender {
		return new AsyncRender(Object.cast(this));
	}

	/**
	 * An API for low-level working with a component VDOM tree
	 */
	@computed({cache: 'forever'})
	get vdom(): VDOM {
		return new VDOM(Object.cast(this));
	}

	/**
	 * An API for collecting and rendering various component information
	 */
	@computed({cache: 'forever'})
	get infoRender(): InfoRender {
		return new InfoRender(Object.cast(this));
	}

	/**
	 * An API for sending component analytic events
	 */
	@computed({cache: 'forever'})
	get analytics(): Analytics {
		return new Analytics(Object.cast(this));
	}

	/**
	 * An API for working with the component life cycle
	 */
	@computed({cache: 'forever'})
	get lfc(): Lfc {
		return new Lfc(Object.cast(this));
	}

	/**
	 * A dictionary containing component daemons
	 */
	static readonly daemons: DaemonsDict = {};

	/**
	 * An API for working with the component in terms of [BEM](https://en.bem.info/methodology/quick-start/)
	 */
	protected block?: Block;

	/**
	 * An API for low-level working with a component DOM tree
	 */
	@computed({cache: 'forever'})
	protected get dom(): DOM {
		return new DOM(Object.cast(this));
	}

	/**
	 * An API for persistent storage of component data
	 */
	@computed({cache: 'forever'})
	protected get storage(): Storage {
		return new Storage(Object.cast(this));
	}

	/**
	 * An API for initializing the component state from various related sources
	 */
	@computed({cache: 'forever'})
	protected get state(): State {
		return new State(Object.cast(this));
	}

	/**
	 * An API for managing dynamically loaded modules
	 */
	@computed({cache: 'forever'})
	protected get moduleLoader(): ModuleLoader {
		return new ModuleLoader(Object.cast(this));
	}

	/**
	 * An API for creating daemons associated with the component
	 */
	@computed({cache: 'forever'})
	protected get daemons(): Daemons {
		return new Daemons(Object.cast(this));
	}

	/**
	 * A cache dictionary for the `opt.ifOnce` method
	 */
	@system({merge: true, init: () => ({})})
	protected readonly ifOnceStore!: Dictionary<number>;

	/**
	 * An API containing helper methods for optimizing and profiling component rendering
	 */
	@computed({cache: 'forever'})
	protected get opt(): Opt {
		return new Opt(Object.cast(this));
	}

	/**
	 * An API for determining the current browser name/version
	 */
	@computed({cache: 'forever'})
	protected get browser(): typeof browser {
		return browser;
	}

	/**
	 * A dictionary containing component presets
	 */
	@computed({cache: 'forever'})
	protected get presets(): typeof presets {
		return presets;
	}

	/**
	 * A dictionary containing a set of helper functions
	 * that can be used within the component template to extend its functionality
	 */
	@computed({cache: 'forever'})
	protected get h(): typeof helpers {
		return helpers;
	}

	/**
	 * A link to the global object
	 */
	@computed({cache: 'forever'})
	protected get global(): Window {
		return Object.cast(globalThis);
	}

	/**
	 * A link to the native `console` API
	 */
	@computed({cache: 'forever'})
	protected get console(): Console {
		return console;
	}

	/**
	 * Initializes the process of collecting debugging information for the component
	 */
	@hook(['mounted', 'updated'])
	protected initInfoRender(): void {
		this.infoRender.initDataGathering();
	}

	/**
	 * Initializes the component daemons
	 */
	@hook('beforeCreate')
	protected initDaemons(): void {
		this.daemons.init();
	}
}
