
/*----------  CDX  ----------*/
const _CDX_LEFT_ESCAPED_	 = '\\[cdx';
const _CDX_LEFT_ 			 ='[cdx';
const _CDX_RIGHT_			 = 'cdx]';

/*----------  CDX LOOP  ----------*/
const _CDX_LEFT_LOOP_ESCAPED_ = '\\[cdxloop';
const _CDX_LEFT_LOOP_ = '[cdxloop';
const _CDX_RIGHT_LOOP_ = 'cdxloop]';

/*----------  CDX ENDLOOP  ----------*/
const _CDX_END_LOOP_ESCAPED_ = '\\[endloop]';
const _CDX_END_LOOP_ = '[endloop]';


function parser_parse(sPage)
{
	tbLoop = parser_getLoop(sPage);
	let nLengthDiff = 0;

	tbLoop.forEach((oLoop, i) => {
		// oLoop.start -= nLengthDiff;
		// oLoop.end -= nLengthDiff;
		let sPageParsed = parser_parseLoop(sPage, oLoop);
		// nLengthDiff += sPage.length - sPageParsed.length;

		sPage = sPageParsed;
	});

	return parser_parseCdx(sPage);
}

/*==================================
=            CDX PARSER            =
==================================*/

function parser_parseCdx(sPage)
{
	let nStart = 0;
	let nSaveEnd = 0;

	while ((nStart = string_searchAfterIndex(sPage, _CDX_LEFT_ESCAPED_, nStart)) != -1)
	{
		if (nStart < nSaveEnd) { break; }

		let sCdx = string_searchContain(sPage.substr(nStart), _CDX_LEFT_ESCAPED_, _CDX_RIGHT_);

		sPage = sPage.replace(_CDX_LEFT_+sCdx+_CDX_RIGHT_, parser_parseRessource(sCdx));

		nSaveEnd = nStart;
	}

	return sPage;
}

function parser_parseRessource(sCdx)
{
	let tbCdx = sCdx.split('.');
	let sRessource = tbCdx[0].split('-');
	let nRessId = sRessource[1];
	sRessource = sRessource[0].trim();;
	let sAttribute = tbCdx[1].trim();

	let sValue = '';

	if (nRessId != undefined) {
		__CODEX_DATA_[sRessource].forEach((r) => {
			if (nRessId == r.id) {
				sValue = r[sAttribute];
				return
			}
		});
	} else {
		return __CODEX_DATA_[sRessource][0][sAttribute];
	}

	return sValue;
}

/*=====  End of CDX PARSER  ======*/


/*=======================================
=            CDX LOOP PARSER            =
=======================================*/

function parser_getLoop(sPage)
{
	let tbLoop = [];
	let nStart = 0;
	let nSaveEnd = 0;

	while ((nStart = string_searchAfterIndex(sPage, _CDX_LEFT_LOOP_ESCAPED_, nStart)) != -1)
	{
		if (nStart < nSaveEnd) { break; }

		let oLoop = {};

		oLoop.start = nStart;
		oLoop.ressource = string_searchContain(sPage.substr(nStart), _CDX_LEFT_LOOP_ESCAPED_, _CDX_RIGHT_LOOP_).trim();
		oLoop.content = string_searchContain(sPage.substr(nStart), _CDX_LEFT_LOOP_ESCAPED_+' '+oLoop.ressource+' '+_CDX_RIGHT_LOOP_, _CDX_END_LOOP_ESCAPED_).trim();

		oLoop.end = string_searchAfterIndex(sPage, _CDX_END_LOOP_ESCAPED_, nStart) + _CDX_END_LOOP_ESCAPED_.length;

		nStart = oLoop.end;
		nSaveEnd = oLoop.end;

		tbLoop.push(oLoop);
	}

	return tbLoop;
}

function parser_parseLoop(sPage, oLoop) {
	let nStart = 0;
	let nSaveEnd = 0;
	let sReplace = '';
	let sLoopContent = oLoop.content;

	__CODEX_DATA_[oLoop.ressource].forEach((r, i) => {
		nStart = 0;
		nSaveEnd = 0;
		while ((nStart = string_searchAfterIndex(oLoop.content, _CDX_LEFT_ESCAPED_, nStart)) != -1) {
			if (nStart < nSaveEnd) { break; }

			let sCdx = string_searchContain(oLoop.content.substr(nStart), _CDX_LEFT_ESCAPED_, _CDX_RIGHT_);

			tbCdx = sCdx.split('.');

			if (tbCdx.length > 1) {
				tbCdx[0] = tbCdx[0].trim();
				tbCdx[1] = tbCdx[1].trim();
				if (tbCdx[0] == 'this') {
					let sCdxParsed = _CDX_LEFT_+' '+oLoop.ressource+'-'+r.id+'.'+tbCdx[1]+' '+_CDX_RIGHT_+'\n';
					sLoopContent = oLoop.content.replace(_CDX_LEFT_+sCdx+_CDX_RIGHT_, sCdxParsed);
				}
			}

			nStart += sLoopContent.length;
			nSaveEnd = nStart;
		}

		sReplace += sLoopContent;
	});

	sPage = sPage.replace(sPage.substr(oLoop.start, oLoop.end), sReplace);

	return sPage;
}

/*=====  End of CDX LOOP PARSER  ======*/