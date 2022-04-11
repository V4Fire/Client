/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable import/no-nodejs-modules */

import http from 'http';
import nodeStatic from 'node-static';

import { build, webpack, src } from '@config/config';

const
	server = new nodeStatic.Server(src.clientOutput(), {cache: 3600});

http.createServer((req, res) => {
	req.addListener('end', () => {
		if (req.url?.startsWith(webpack.publicPath())) {
			req.url = req.url.replace(webpack.publicPath(), '/');
		}

		return server.serve(req, res);

	}).resume();

}).listen(build.testPort);

console.log(`listen at ${build.testPort}`);
