'use strict';

const util = require('node:util');
const {promises: fs} = require('node:fs');
const $C = require('collection.js');
const exec = util.promisify(require('node:child_process').exec);

const findPackageCommand = (packageName) => `yarn info --json ${packageName} versions`;

const findNearsetVersion = (versions, version) => {
	const majorVersion = version.split('.')[0];

	return versions.filter((version) => version.split('.')[0] === majorVersion).at(-1);
};

(async () => {
	// await exec('npm query "*" > deps.json');
	// const deps = JSON.parse(await fs.readFile('deps.json', 'utf-8'));
	// const missedPackages = [];
	// const checkedPackages = {};

	// await $C(deps).forEach(async (dep) => {
	// 	const hashKey = `${dep.name}@${dep.version}`;

	// 	if (!checkedPackages[`${dep.name}@${dep.version}`]) {
	// 		checkedPackages[hashKey] = true;

	// 		const {stdout} = await exec(findPackageCommand(dep.name));
	// 		const versionsList = JSON.parse(stdout).data;

	// 		if (!versionsList.includes(dep.version)) {
	// 			console.log(`Package ${dep.name} of ${dep.version} not exists`);

	// 			missedPackages.push({name: dep.name, version: dep.version, availableVersions: versionsList});
	// 		}
	// 	}

	// }, {parallel: 32});

	// console.log('Операция выполнена! Запись результатов в файл...');

	// const packagesForAdd = missedPackages.map(
	// 	(pack) => ({package: pack.name, version: findNearsetVersion(pack.availableVersions, pack.version)})
	// );

	const packagesForAdd = JSON.parse(await fs.readFile('./packages-for-install.json', 'utf-8'));

	const packagesForAddArg = packagesForAdd.reduce((acc, item) => acc += ` ${item.package}@${item.version}`, '');
	await fs.writeFile('packages-for-install.json', JSON.stringify(packagesForAdd, null, 2));

	await exec(`npm i --save-exact ${packagesForAddArg}`);
})();
