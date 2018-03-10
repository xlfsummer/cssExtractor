let cssModule = require('css');
let f = require('./lib/fs');


async function main(){
	let configRules = await getConfigRules("./extract.config.css");

	let filePaths = await f.readDirRecursive("./test");

	let extractedRules = [];

	//筛选 css
	filePaths = filePaths.filter(p => /\.css$/.test(p));

	for (let p of filePaths){
		await processFile(p);
	}

	let extractedContent = cssModule.stringify({
		stylesheet: { rules: extractedRules }
	});

	console.log(extractedContent)
	f.writeFile('./test/extracted.css', extractedContent);

	return;



	async function processFile(path) {
		let content = await f.readFile(path);
		let css = cssModule.parse(content);
		let rules = css.stylesheet.rules;

		//add comment to extracted rules
		extractedRules.push({
			comment: "extract from " + path,
			type: "comment",
		})
	
		for(let r of rules){
			if (r.type == "rule") {
				await processRule(r);
			} else if(r.type == "comment"){
				let comment = r.comment
			}
		}

		console.log(cssModule.stringify(css));
		console.log(cssModule.stringify({
			stylesheet: { rules: extractedRules }
		}));
	}
	
	/**
	 * 
	 * @param {Rule} rule 
	 */
	async function processRule(rule) {
		let selectors = rule.selectors;
	
		for (let d of rule.declarations) {
			if (d.type == "declaration") {
				/** @type {string} */
				let property = d.property;
		
				/** @type {string} */
				let value = d.value;

				for (let cr of configRules) {
					for (let cd of cr.declarations) {
						if (cd.property == d.property
							&& cd.value == d.value)
							extractedRules.push({
								selectors,
								declarations: rule.declarations.splice(rule.declarations.indexOf(d), 1),
								type: "rule"
							});
					}
				}

			} else {
				debugger;
			}
		}
	}

};

async function getConfigRules(path) {
	let content = await f.readFile(path);
	let cssObj = cssModule.parse(content);
	return cssObj.stylesheet.rules;
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
