'use strict';

const config = require('./build.json');
const fs = require('fs');

Object.keys(config)
	.map(process)
	.forEach(write);

function process(bundleName) {
	const bundle = {
		name: bundleName,
		content: config[bundleName].reduce(concat, `/**\n * ${bundleName}\n */\n`)
	}

	return bundle;

	function concat(content, path) {
		const file = fs.readFileSync(path, 'utf8');

		console.log('Processing: ' + path);

		return content += file;
	}
}

function write(bundle) {
	const pathTemplate = './dist/{bundle}.js';
	const path = pathTemplate.replace('{bundle}', bundle.name);

	fs.writeFileSync(path, bundle.content);
}
