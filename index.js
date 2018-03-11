let cssModule = require('css');
let path = require('path');
let f = require('./lib/fs');

/** 是否移除源css声明
 * @type {boolean}
*/
let isUpdateSrc = false;
let srcDirPath = "./test/project"
let configPath = "./extract.config.css"
let outputPath = "./test/extracted.css"

async function main(){
	let configRules = await getConfigRules(configPath);

	let filePaths = await f.readDirRecursive(srcDirPath);
	//筛选 css 格式文件
	filePaths = filePaths.filter(p => /\.css$/.test(p));

	/** 筛选出的 css 规则 */
	let allExtractedRules = [];
	let extractedContent;


	for (let p of filePaths) {
		let oldContent = await f.readFile(p);
		let relativePath = path.relative(srcDirPath, p)
		let { processedContent, extractedRules } = await processFile(oldContent, relativePath);

		if (isUpdateSrc) {
			await f.writeFile(p, processedContent)
		}
		allExtractedRules = allExtractedRules.concat(extractedRules);
	}

	extractedContent = cssModule.stringify({
		stylesheet: { rules: allExtractedRules }
	})

	await f.writeFile(outputPath, extractedContent);

	return;

	async function processFile(content, relativePath) {
		let css = cssModule.parse(content);
		let rules = css.stylesheet.rules;
		let processedRules = [];
		let extractedRules = [];
	
		for (let r of rules) {
			switch (r.type) {
				case "rule":
					let { processedRule, extractedRule } = await processRule(r);
					if (processedRule) processedRules.push(processedRule);
					if (extractedRule) extractedRules.push(extractedRule);
					break;
				case "comment":
					processedRules.push(r);
					break;
				default:
					debugger;
			}
		}

		let processedCss = {
			stylesheet: { rules: processedRules }
		};

		if (extractedRules.length) {
			extractedRules.unshift({
				comment: "extract from " + relativePath,
				type: "comment",
			});
		}

		let processedContent = cssModule.stringify(processedCss);

		return { processedContent, extractedRules };
	}
	
	/**
	 * 
	 * @param {Rule} rule 
	 */
	async function processRule(rule) {
		let selectors = rule.selectors;
		let extractedRule , processedRule;
		let processedDeclar = [];
		let extractDeclar = [];

		for (let d of rule.declarations) {
			if (d.type == "declaration") {
				// /** @type {string} */
				// let property = d.property;
		
				// /** @type {string} */
				// let value = d.value;

				if (configRules.some(configRule => testDelaration(configRule, d))) {
					extractDeclar.push(d)
				} else {
					processedDeclar.push(d)
				}
			} else {
				processedDeclar.push(d)
			}
		}

		if (extractDeclar.length) {
			extractedRule = {
				selectors,
				declarations: extractDeclar,
				type: "rule"
			};
		}

		processedRule = {
			selectors,
			declarations: processedDeclar,
			type: "rule"
		};

		return {processedRule, extractedRule};
	}

};

function testDelaration(rule, declaration) {
	let declarations = rule.declarations;
	return declarations
		.filter(d => d.type == "declaration")
		.some(d => d.property == declaration.property && d.value == declaration.value);
}

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
