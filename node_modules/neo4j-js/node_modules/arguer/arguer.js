/**
 * 
 * @param args {arguments}
 * @param format {Array}
 * @returns {{}|Error} A hash table with the names of each format elements as keys. Optional format elements which were not fulfilled by an argument are undefined. If the arguments failed to parse correctly, the returned object will be an Error object.
 */
module.exports = function (args, format)
{
	var deficit = format.length - args.length;

	if (!format._optional)
	{
		format._optional = 0;
		for (var x in format)
		{
			if (format[x] && (format[x].optional || format[x].mutex || format[x].requires || format[x].requiredBy))
			{
				format[x].optional = true;
				format._optional++;
			}
		}
	}

	var result = {};

	if (deficit > format._optional)
	{ 
		return new Error('Not enough arguments provided.');
	}

	var optionalIncluded = 0;
	var optionalSkipped = 0;
	var item;
	var argDex = 0;
	for (var i = 0; i < format.length; i++)
	{
		item = format[i];
		if (typeof item === 'string')
		{
			result[item] = args[argDex];
			argDex++;
		}
		else
		{
			if ((item.type && typeof args[argDex] !== item.type) ||
				(item.nType && typeof args[argDex] === item.nType) ||
				(item.instance && !(args[argDex] instanceof item.instance)) ||
				(item.nInstance && args[argDex] instanceof item.nInstance) ||
				(item.mutex && result[item.mutex] !== undefined) ||
				(item.requires && result[item.requires] === undefined))
			{
				if (item.optional && optionalSkipped < deficit && (!item.requiredBy || result[item.requiredBy] === undefined))
				{
					result[item.name] = undefined;
					optionalSkipped++;
				}
				else
				{
					return new Error('Invalid Arguments');
				}
			}
			else
			{
				if (item.optional)
				{
					if ((format._optional - optionalIncluded) > deficit)
					{
						optionalIncluded++
					}
					else
					{
						optionalSkipped++;
						result[item.name] = undefined;
						continue;
					}
				}

				result[item.name] = args[argDex];
				argDex++;
			}
		}
	}

	return result;
};