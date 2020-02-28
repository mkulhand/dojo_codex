
function string_searchAfterIndex(sHaystack, sNeedle, i) {
	return sHaystack.indexOf(sNeedle, i);
}

function string_searchContain(sHaystack, sLeft, sRight)
{
	sHaystack = sHaystack.substr(sHaystack.search(sLeft) + sLeft.length - 1);
	return sHaystack.substr(0, sHaystack.search(sRight));
}

function string_forEachOccurenceAsync(sHaystack, sNeedle, fFunc)
{
	return new Promise(async function(resolve) {
		let tbReturn = [];
		let nStart = 0;
		let nSaveStart = 0;
		let sRet;

		while ((nStart = string_searchAfterIndex(sHaystack, sNeedle, nStart)) != -1) {
			if (nStart < nSaveStart) { break; }

			let res = await fFunc(nStart, sRet);
			sRet = res;
			tbReturn.push(res);

			nStart += sNeedle.length;
			nSaveStart = nStart;
		}

		resolve(tbReturn);
	});
}

function string_forEachOccurence(sHaystack, sNeedle, fFunc)
{
	let tbReturn = [];
	let nStart = 0;
	let nSaveStart = 0;

	while ((nStart = string_searchAfterIndex(sHaystack, sNeedle, nStart)) != -1) {
		if (nStart < nSaveStart) { break; }

		let res = fFunc(nStart);

		if (res != 'undefined' && res != null) {
			tbReturn.push(res);
		}

		nStart += sNeedle.length;
		nSaveStart = nStart;
	}

	return (tbReturn);
}