/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

declare namespace Perf {
	namespace Browser {
		interface Options {
			// ...
		}
	}

	namespace Metrics {
		type Type =
			'fcp' |
			'tti' |
			'xhr' |
			'long-task' |
			'dom-interactive' |
			'deltas';

		interface Data {
			// ...
		}
	}

}
