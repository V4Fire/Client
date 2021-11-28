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
		/**
		 * Доступные метрики
		 */
		type Type =
			'fcp' |
			'tti' |
			'xhr' |
			'long-task' |
			'dom-interactive' |
			'deltas';

		/**
		 * Данные метрик
		 */
		interface Data {
			// ...
		}
	}

	namespace Validator {
		/**
		 * Поля доступные для валидации
		 */
		interface ParamsToValidate {
			metrics: unknown;
		}

		/**
		 * Результат проверки валидатора
		 */
		interface ValidationResult {
			/**
			 * Если `true` - результат валидации был успешным
			 */
			isOk: boolean;

			/**
			 * Содержит массив параметров которые зафейлились
			 */
			failed: string[];
		}
	}

}
