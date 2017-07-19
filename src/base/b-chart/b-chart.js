'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData from 'super/i-data/i-data';
import { field, params, abstract, watch } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	Chart = require('chart.js'),
	$C = require('collection.js');

@component()
export default class bChart extends iData {
	/**
	 * Chart width
	 */
	width: number = 0;

	/**
	 * Chart height
	 */
	height: number = 0;

	/**
	 * Chart options
	 */
	@watch('renderChart')
	options: Object = {};

	/**
	 * Chart type
	 */
	@watch('renderChart')
	type: string = 'line';

	/**
	 * Data for building the chart
	 */
	chartData: Object | Array;

	/**
	 * If true, that at least in one dataset there are values different from 0
	 */
	@field()
	hasData: boolean = false;

	/**
	 * Default chart options
	 */
	@field()
	defaultOptions: Object = {};

	/**
	 * Chart instance
	 * @private
	 */
	@abstract
	_chart: ?Object;

	/**
	 * Input data synchronization
	 */
	@params({deep: true})
	$$chartData() {
		this.renderChart();
	}

	/**
	 * Draws the chart
	 */
	renderChart(): Chart {
		const
			options = Object.mixin({deep: true, concatArray: true}, {}, this.defaultOptions, this.options),
			{chartData, type} = this;

		this.hasData = $C(chartData.datasets).some((el) => $C(el.data).some((el) => el !== 0));
		this._chart.clear && this._chart.clear();
		this._chart.destroy && this._chart.destroy();

		if (this.hasData) {
			this._chart = new Chart(this.$refs.chart.getContext('2d'), {
				type,
				data: chartData,
				options
			});

		} else {
			this._chart = {};
		}

		return this._chart;
	}

	/** @inheritDoc */
	mounted() {
		this._chart = {};
		this.renderChart();
	}
}
