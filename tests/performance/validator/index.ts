/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-extraneous-class */

import ValidationError from 'tests/performance/helpers/validator/error';

import { Metrics } from 'tests/performance/metrics';

export class Validator {
	/**
	 * Возвращает `true` если переданный массив является массивом метрик
	 * @param array
	 */
	static isMetricsArray(array: any): array is Perf.Metrics.Type[] {
		return Array.isArray(array) && array.every(this.isMetric);
	}

	/**
	 * Возвращает `true` если переданное значение является наименованием метрики
	 * @param value
	 */
	static isMetric(value: any): value is Perf.Metrics.Type {
		return Metrics.availableMetrics.includes(value);
	}

	/**
	 * Возвращает `true` если все переданные параметры валидны
	 *
	 * @param params
	 * @param [throwErrorOnFail]
	 */
	static validateParams(
		params: Perf.Validator.ParamsToValidate,
		throwErrorOnFail: boolean = false
	): Perf.Validator.ValidationResult {
		const validatorsToKeyName = {
			metrics: this.isMetricsArray
		};

		const validationResult: Perf.Validator.ValidationResult = {
			isOk: true,
			failed: []
		};

		Object.keys(params).forEach((key) => {
			const
				res = <CanUndef<boolean>>validatorsToKeyName[key]?.(params[key]);

			if (res == null) {
				this.throwMissingValidatorError(key);
			}

			if (res === false) {
				validationResult.isOk = false;
				validationResult.failed.push(key);
			}
		});

		if (throwErrorOnFail && !validationResult.isOk) {
			this.throwValidationError(validationResult);
		}

		return validationResult;
	}

	/**
	 * Выкидывает ошибку с сообщением что валидация завершилась с ошибкой
	 * @param validationResult
	 */
	static throwValidationError(validationResult: Perf.Validator.ValidationResult): void {
		throw new ValidationError(`Failed to validate provided fields: ${validationResult.failed.join(', ')}`);
	}

	/**
	 * Выкидывает ошибку с сообщением что не найдено подходящего валидатора
	 * @param validateName
	 */
	protected static throwMissingValidatorError(validateName: string): void {
		throw new ValidationError(`Missing validator for ${validateName}`);
	}
}
