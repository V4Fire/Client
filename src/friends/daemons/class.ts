/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'friends/friend';

import type iBlock from 'super/i-block/i-block';
import type { DaemonsDict } from 'friends/daemons/interface';

import type { run } from 'friends/daemons/init';
import type { spawn } from 'friends/daemons/create';

interface Daemons {
	run: typeof run;
	spawn: typeof spawn;
}

@fakeMethods('run')
class Daemons extends Friend {
	/**
	 * A dictionary with the declared component daemons
	 */
	protected get daemons(): DaemonsDict<this['CTX']> {
		return (<typeof iBlock>this.ctx.instance.constructor).daemons;
	}

	constructor(component: iBlock) {
		super(component);
		this.init();
	}

	init(): void {
		if (Object.size(this.daemons) === 0) {
			return;
		}

		Object.throw(
			`This is a loopback method. To use the real \`init\` method, register it to the \`${Daemons.name}\` class.`
		);
	}
}

export default Daemons;
