const generateVariationsPrices = (variations, basePrice) => {
	if(!variations || variations.length === 0) {
		return [{value: "", price: basePrice}]
	}

	const valuesList = variations.filter(v => Array.isArray(v.values) && v.values.length > 0).map(v => v.values)

	let combinations = [[]]

	for(let i = 0; i < valuesList.length; i++) {
		const temp = []
		for(let j = 0; j < combinations.length; j++) {
			for(let k = 0; k < valuesList[i].length; k++) {
				temp.push([...combinations[j], valuesList[i][k]])
			}
		}
		combinations = temp
	}
	return combinations.map(c => ({ value: c.join(","), price: basePrice }))
}

module.exports = {generateVariationsPrices}