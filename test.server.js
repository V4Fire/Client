'use strict';

const
	http = require('http'),
	nodeStatic = require('node-static'),
	path = require('upath');

const
	fileServer = new nodeStatic.Server(path.join('./dist/b-dummy_demo'));

http.createServer((req, res) => {
	req.addListener('end', () => {
		fileServer.serve(req, res);
	}).resume();

}).listen(8000);

console.log('start server');
