/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { GLOBAL } from 'core/const/links';

export const hasIntersection =
	'IntersectionObserver' in GLOBAL &&
	'IntersectionObserverEntry' in GLOBAL &&
	'intersectionRatio' in GLOBAL.IntersectionObserverEntry.prototype;
