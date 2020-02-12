
function string_searchContain(sHaystack, sLeft, sRight)
{
	let nStart = sHaystack.search(sLeft);
	sHaystack = sHaystack.substr(nStart + sLeft.length - 1);
	let nEnd = sHaystack.search(sRight);
	return sHaystack.substr(0, nEnd);
}