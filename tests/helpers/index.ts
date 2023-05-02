/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import DOM from 'tests/helpers/dom';
import BOM from 'tests/helpers/bom';
import Utils from 'tests/helpers/utils';
import Component from 'tests/helpers/component';
import Scroll from 'tests/helpers/scroll';
import Router from 'tests/helpers/router';
import Request from 'tests/helpers/request';
import Gestures from 'tests/helpers/gestures';

/**
 * @deprecated - use static methods instead
 */
export class Helpers {
	/** {@link Request} */
	request: Request = new Request();

	/** {@link Utils} */
	utils: Utils = new Utils();

	/** {@link Component} */
	component: Component = new Component();

	/** {@link Gestures} */
	gestures: Gestures = new Gestures();

	/** {@link BOM} */
	bom: BOM = new BOM();

	/** {@link Router} */
	router: Router = new Router();

	/** {@link DOM} */
	dom: DOM = new DOM();

	/** {@link Scroll} */
	scroll: Scroll = new Scroll();
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new Helpers();
