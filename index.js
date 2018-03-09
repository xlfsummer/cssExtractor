let cssModule = require('css');
let f = require('./lib/fs');

async function main(){
	let con = await f.readFile("./extract.config.css");
	let cssObj = cssModule.parse(con);
	console.dir(cssObj);

	let filePaths = await f.readDirRecursive("./test");

	//筛选 css
	filePaths = filePaths.filter(p => /\.css$/.test(p));

	let l = filePaths.length;
	for (let i = 0; i < l; i++){
		await processFile(filePaths[i]);
	}
};

async function processFile(path) {
	let content = await f.readFile(path);
	let css = cssModule.parse(content);
	let rules = css.stylesheet.rules;

	rules.map(rule => {
		if (rule.type == "rule") {
			await processRule(rule);
		} else {
			debugger;
		}
	});
}


async function processRule(rule) {
	let selectors = rule.selectors;

	rule.declarations = rule.declarations
		.map(d => {
			if (d.type == "declaration") {
				/** @type {string} */
				let property = d.property;

				/** @type {string} */
				let value = d.value;


			} else {
				debugger;
			}
		});
}

(async () => {
	try { await main(); }
	catch (e) { debugger; }
})();

function getParam() {
	let arguments = process.argv.splice(2);
	if (arguments[0] == null) {
		throw new Error("缺少目录参数");
	}
	if (arguments[1] == null) {
		throw new Error("缺少提取配置路径");
	}
	// let dirPath =
}
