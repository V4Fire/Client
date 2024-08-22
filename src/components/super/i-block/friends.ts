/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-var-requires */

import type * as browser from 'core/browser';
import type * as helpers from 'core/helpers';
import type * as presets from 'components/presets';

import type Daemons from 'components/friends/daemons';
import type { DaemonsDict } from 'components/friends/daemons';

import type Analytics from 'components/friends/analytics';
import type DOM from 'components/friends/dom';
import type VDOM from 'components/friends/vdom';
import type Opt from 'components/super/i-block/modules/opt';

import type AsyncRender from 'components/friends/async-render';
import type ModuleLoader from 'components/friends/module-loader';
import type Sync from 'components/friends/sync';

import type Field from 'components/friends/field';
import type Provide from 'components/friends/provide';
import type InfoRender from 'components/friends/info-render';
import type Block from 'components/friends/block';

import type Lfc from 'components/super/i-block/modules/lfc';
import type State from 'components/friends/state';
import type Storage from 'components/friends/storage';

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
		const Provide = require('components/friends/provide').default;
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
		const Field = require('components/friends/field').default;
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
		const Sync = require('components/friends/sync').default;
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
		const AsyncRender = require('components/friends/async-render').default;
		return new AsyncRender(Object.cast(this));
	}

	/**
	 * An API for low-level working with a component VDOM tree
	 */
	@computed({cache: 'forever'})
	get vdom(): VDOM {
		const VDOM = require('components/friends/vdom').default;
		return new VDOM(Object.cast(this));
	}

	/**
	 * An API for collecting and rendering various component information
	 */
	@computed({cache: 'forever'})
	get infoRender(): InfoRender {
		const InfoRender = require('components/friends/info-render').default;
		return new InfoRender(Object.cast(this));
	}

	/**
	 * An API for sending component analytic events
	 */
	@computed({cache: 'forever'})
	get analytics(): Analytics {
		const Analytics = require('components/friends/analytics').default;
		return new Analytics(Object.cast(this));
	}

	/**
	 * An API for working with the component life cycle
	 */
	@computed({cache: 'forever'})
	get lfc(): Lfc {
		const Lfc = require('components/super/i-block/modules/lfc').default;
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
		const DOM = require('components/friends/dom').default;
		return new DOM(Object.cast(this));
	}

	/**
	 * An API for persistent storage of component data
	 */
	@computed({cache: 'forever'})
	protected get storage(): Storage {
		const Storage = require('components/friends/storage').default;
		return new Storage(Object.cast(this));
	}

	/**
	 * An API for initializing the component state from various related sources
	 */
	@computed({cache: 'forever'})
	protected get state(): State {
		const State = require('components/friends/state').default;
		return new State(Object.cast(this));
	}

	/**
	 * An API for managing dynamically loaded modules
	 */
	@computed({cache: 'forever'})
	protected get moduleLoader(): ModuleLoader {
		const ModuleLoader = require('components/friends/module-loader').default;
		return new ModuleLoader(Object.cast(this));
	}

	/**
	 * An API for creating daemons associated with the component
	 */
	@computed({cache: 'forever'})
	protected get daemons(): Daemons {
		const Daemons = require('components/friends/daemons').default;
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
		const Opt = require('components/super/i-block/modules/opt').default;
		return new Opt(Object.cast(this));
	}

	/**
	 * An API for determining the current browser name/version
	 */
	@computed({cache: 'forever'})
	protected get browser(): typeof browser {
		return require('core/browser');
	}

	/**
	 * A dictionary containing component presets
	 */
	@computed({cache: 'forever'})
	protected get presets(): typeof presets {
		return require('components/presets');
	}

	/**
	 * A dictionary containing a set of helper functions
	 * that can be used within the component template to extend its functionality
	 */
	@computed({cache: 'forever'})
	protected get h(): typeof helpers {
		return require('core/helpers');
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
