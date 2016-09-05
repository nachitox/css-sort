var verbose = false;

function CSSSort(fileIn, fileOut, options)
{
	var fs = require('fs'),
	parse = require('css-parse'),
	cmp = require('specificity'),
	read = fs.readFileSync, 
	write = fs.writeFileSync,
	r;
	verbose = options.verbose;
	
	try
	{
		var css = read(fileIn, 'utf8'),
		parsedCSS = parse(css),
		parsedRules = parsedCSS.stylesheet.rules;

		parsedRules.sort(function(a, b) {
			if (a.type != 'rule')
				return -1;
			else if (b.type != 'rule')
				return 1;
			else
			{
				r = cmp.compare(a.selectors[0], b.selectors[0]);
				return r === 0 ? a.selectors[0] < b.selectors[0] : r;
			}
		});
		
		if (verbose)
		{
			parsedRules.forEach(function(rule) {
				if (rule.type == 'rule')
					log(rule.selectors[0] + ': ' + cmp.calculate(rule.selectors[0])[0].specificity);
			});
		}
		
		log('Writing file...');
		
		css = output_css(parsedRules);
		write(fileOut, css);

		log('Success!');
	}
	catch (e)
	{
		log('Darn it, something went wrong:' + "\n" + e.stack + "\n");
	}
}

function log(message)
{
	if (verbose)
		 console.log(message);
}

function output_css(rules)
{
	var outputCSS = '';
	
	rules.forEach(function(rule) {
		//@charset
		if (rule.charset !== undefined) {

			// console.log(rule.charset);
			outputCSS += '@charset ' + rule.charset + ';\n';
		}

		//@import
		if (rule.import !== undefined)
			outputCSS += '@import ' + rule.import + ';\n';

		//@keyframes
		if (rule.name !== undefined && rule.keyframes !== undefined)
		{
			// console.log(rule);
			outputCSS += '\n@keyframes ' + rule.name + ' {\n';

			rule.keyframes.forEach(function(rule) {
				outputCSS += _get_rule(rule, 1);
			});

			outputCSS += '}\n';
		}

		//@supports
		if (rule.supports !== undefined)
		{
			outputCSS += '\n@supports ' + rule.supports + ' {\n\n';

			rule.rules.forEach(function(rule) {
				outputCSS += _get_rule(rule, 1);
			});

			outputCSS += '}\n';
		}

		//@media
		if (rule.media !== undefined)
		{
			outputCSS += '\n@media ' + rule.media + ' {\n\n';

			rule.rules.forEach(function(rule) {
				outputCSS += _get_rule(rule, 1);
			});

			outputCSS += '}\n';
		}

		//handle normal selectors
		outputCSS += _get_rule(rule);
	});

	return outputCSS;
}


function _get_rule(rule, no_indents)
{
	var outputCSS = '',
	i;

	for (i = 0; i < no_indents; i++)
		outputCSS += '\t';

	if (rule.type !== undefined) 
		switch(rule.type)
		{
			case 'page': outputCSS += '@page '; break;
			case 'font-face': outputCSS += '@font-face {'; break;
		}

	if (rule.selectors !== undefined)
		outputCSS += '' + rule.selectors + ' {';
	else if (rule.values !== undefined)
		outputCSS += '' + rule.values + ' {';
	
	if (rule.declarations !== undefined)
	{
		rule.declarations.forEach(function(declaration) {
			outputCSS += '\n';

			for (i = 0; i < no_indents; i++)
				outputCSS += '\t';

		 	outputCSS += '\t' + declaration.property + ': ' + declaration.value + ';';
		});
	}

	outputCSS += '\n';

	for (i = 0; i < no_indents; i++)
		outputCSS += '\t';

	if (rule.selectors !== undefined || rule.values !== undefined)
		outputCSS += '}\n';
	else if (rule.type !== undefined) 
		switch(rule.type)
		{
			case 'font-face': outputCSS += '}\n'; break;
		}

	return outputCSS;
}

module.exports = CSSSort;
