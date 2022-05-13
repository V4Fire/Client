'use strict';

const config = require('config');

const cliProgress = require('cli-progress');
const webpack = require('webpack');

class Logger {
	constructor() {
		this.handlers = {};

		function formatter(options, params, payload) {
			const completeSize = Math.round(params.progress * options.barsize);
			const incompleteSize = options.barsize - completeSize;
			const bar = options.barCompleteString.substr(0, completeSize) +
			options.barGlue + options.barIncompleteString.substr(0, incompleteSize);

			const name = payload.name.padEnd(10).capitalize();

			return `# ${name} ${bar} ${params.value}%`;
	}

		this.multibar = new cliProgress.MultiBar(
			{
				format: formatter,
				...config.progressPlugin()
			},
			cliProgress.Presets.shades_grey
		);
	}

	addHandler(name) {
		this.handlers[name] = this.multibar.create(100, 0, {name});

		return this.webpackHandler.bind(this, name);
	}

	webpackHandler(name, value) {
		this.updateProgress(name, value);
	}

	updateProgress(name, value) {
		const percentage = Math.floor(value * 100);

		this.handlers[name].update(percentage);
	}
}

const logger = new Logger();

function createProgressPlugin(name) {
	return new webpack.ProgressPlugin(logger.addHandler(name));
}

module.exports = createProgressPlugin;
