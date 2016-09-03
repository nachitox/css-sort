var fs = require('fs'),
parse = require('css-parse'), 
read = fs.readFileSync, 
write = fs.writeFileSync,
verbose = false;

function CSSSort(fileIn, fileOut, options)
{
	verbose = options.verbose;
	
	try
	{
		var css = read(fileIn, 'utf8');

		var parsedCSS = parse(css),
			parsedRules = parsedCSS.stylesheet.rules,
			parsedRulesLen = parsedRules.length;
			
		log(parsedRules);
	}
	catch (e)
	{
		log('Darn it, something went wrong:' + "\n" + e.message + "\n");
	}
}

function log(message)
{
	if (verbose)
		 console.log(message);
}

module.exports = CSSSort;
