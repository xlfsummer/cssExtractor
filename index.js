let postcss = require('postcss');
let path = require('path');
let f = require('./lib/fs');

/** 是否移除源css声明
 * @type {boolean}
*/
let isUpdateSrc = false;
let srcDirPath =
	// "F:\\商城\\branch\\Codes\\controls\\pc";
	"./test/project";
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


	if (allExtractedRules.length) {
		allExtractedRules[0].raws.before = "";
	}

	extractedContent = postcss.root({
		nodes: allExtractedRules,
		raws: { after: "\n" }
	}).toString();

	await f.writeFile(outputPath, extractedContent);

	return;

	async function processFile(content, relativePath) {
		let css = postcss.parse(content);

		let rules = css.nodes;
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
				case "charset":
					processedRules.push(r);
					break;
				default:
					debugger;
			}
		}


		let processedCss = postcss.root({
			nodes: processedRules,
		});

		if (extractedRules.length) {
			extractedRules.unshift(
				postcss.comment({
					text: "extract from " + relativePath,
					raws: { before: "\n\n" }
				})
			);
		}



		let processedContent =
			// postcss.stringify(processedCss);
			processedCss.toString();

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

		for (let d of rule.nodes) {
			if (d.type == "decl") {
				if (configRules.some(configRule => testDelaration(configRule, d))) {
					extractDeclar.push(d)
				} else {
					processedDeclar.push(d)
				}
			} else {
				debugger;
				processedDeclar.push(d)
			}
		}

		if (extractDeclar.length) {
			extractedRule = rule.clone({
				nodes: extractDeclar,
				raws: { before: "\n\n", after: "\n", }
			});
		}

		processedRule = rule.clone({
			nodes: processedDeclar,
		});

		return {processedRule, extractedRule};
	}

};

function testDelaration(rule, declaration) {
	if (rule.type == "comment") {
		return false;
	}

	let declarations = rule.nodes;
	return declarations
		.filter(d => d.type == "decl")
		.some(d => d.prop == declaration.prop && d.value == declaration.value);
}

async function getConfigRules(path) {

	let content = await f.readFile(path);

	let cssObj = postcss.parse(content);

	return cssObj.nodes;
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
