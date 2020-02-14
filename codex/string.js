
function string_searchAfterIndex(sHaystack, sNeedle, i) {
	return sHaystack.substr(i).search(sNeedle);
}

function string_searchContain(sHaystack, sLeft, sRight)
{
	sHaystack = sHaystack.substr(sHaystack.search(sLeft) + sLeft.length - 1);
	return sHaystack.substr(0, sHaystack.search(sRight));
}