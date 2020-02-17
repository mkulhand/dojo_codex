
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
	let tbLoop = parser_getLoops(sPage);

	tbLoop.forEach((oLoop, i) => {
		let sLoopContent = parser_parseLoop(oLoop);
		sPage = sPage.replace(sPage.slice(oLoop.start, oLoop.end), sLoopContent);
	});

	return parser_parseCdx(sPage);
}

/*=======================================
=            CDX LOOP PARSER            =
=======================================*/

function parser_getLoops(sPage)
{
	let tbLoop = [];
	let nLastLoop = 0;

	tbLoop = string_forEachOccurence(sPage, _CDX_LEFT_LOOP_, function(nStart)
	{
		if (nLastLoop > nStart) { return }

		let oLoop = parser_getLoop(sPage, nStart, parser_getLoopContext(sPage, nStart));

		nLastLoop = oLoop.end;

		return oLoop;
	});

	return tbLoop;
}

function parser_getLoop(sPage, nStart, sContext, i)
{
	let oLoop = {};
	oLoop.context = sContext;
	oLoop.children = [];

	let nEndLoop = sPage.indexOf(_CDX_END_LOOP_, nStart);
	let nNextLoop = sPage.indexOf(_CDX_LEFT_LOOP_, nStart + _CDX_LEFT_LOOP_ESCAPED_.length);

	if (nNextLoop != -1 && nEndLoop > nNextLoop) {
		oLoop.children.push(parser_getLoop(sPage, nNextLoop, parser_getLoopContext(sPage, nNextLoop)));
		nEndLoop = sPage.indexOf(_CDX_END_LOOP_, nEndLoop+_CDX_END_LOOP_ESCAPED_.length);
	}

	oLoop.start = nStart;
	oLoop.end = nEndLoop;
	oLoop.content = sPage.slice(nStart, nEndLoop + _CDX_END_LOOP_ESCAPED_.length);

	return oLoop;
}

function parser_getLoopContext(sPage, nStart) {
	return string_searchContain(sPage.substr(nStart), _CDX_LEFT_LOOP_ESCAPED_, _CDX_RIGHT_LOOP_).trim();
}

function parser_parseLoop(oLoop)
{
	let sContext = oLoop.context;
	let sRes = '';
	let sSaveContent = '';

	tbRess = parser_parseContext(oLoop.context);

	if (Array.isArray(tbRess)) {
		tbRess.forEach(function(r)
		{
			sSaveContent = oLoop.content;
			let sLocalContext = oLoop.context+'-'+r.id;

			if (oLoop.children.length > 0)
			{
				let sParsedContent = '';
				oLoop.children.forEach(function(l)
				{
					let oSubLoop = {};
					let sSubRes = '';
					Object.assign(oSubLoop, l);
					oSubLoop.context = l.context.replace('this', sLocalContext);
					sSubRes += parser_parseLoop(oSubLoop);
					sParsedContent = oLoop.content.replace(oLoop.content.slice(l.start - oLoop.start, l.end - oLoop.end), sSubRes);
				});
				sParsedContent = parser_thisReplacer(sParsedContent, sContext+'-'+r.id);
				sRes += sParsedContent;
			}
			else
			{
				sLoopContent = parser_thisReplacer(oLoop.content, sContext+'-'+r.id);
				sRes += sLoopContent;
			}
		});
	}

	if (sRes != '') {
		return sRes;
	}
}

function parser_thisReplacer(sLoopContent, sContext) {
		sLoopContent = replaceAll(sLoopContent, 'this', sContext);
		return string_searchContain(sLoopContent, _CDX_RIGHT_LOOP_, _CDX_END_LOOP_ESCAPED_).substr(1).trim();
}

function parser_parseContext(sContext)
{
	let tbContext = sContext.split('.');
	let aRes = [];

	if (tbContext.length == 1)
	{
		aRes = __CODEX_DATA_[sContext];
	}
	else
	{
		if (tbContext.length == 2) {
			let tbRess = tbContext[0].split('-');

			let tbRessource = parser_getRessource(tbRess[0], tbRess[1]);
			if (tbRessource !=  undefined && tbRessource[tbContext[1]].length > 0) {
				tbRessource = JSON.parse(tbRessource[tbContext[1]]);
				tbRessource.forEach(function(r) {
					r = JSON.parse(r);
					aRes.push(parser_getRessource(r.type, r.id));
				});
			}
		}
	}

	return aRes;
}

function parser_getRessource(sRessName, nId) {
	let res;

	__CODEX_DATA_[sRessName].forEach(function(r) {
		if (r.id == Number(nId)) {
			res = r;
		}
	});

	return res;
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}

/*=====  End of CDX LOOP PARSER  ======*/


/*==================================
=            CDX PARSER            =
==================================*/

function parser_parseCdx(sPage)
{
	string_forEachOccurence(sPage, _CDX_LEFT_, function(nStart) {
		let sContext = string_searchContain(sPage.substr(nStart), _CDX_LEFT_ESCAPED_, _CDX_RIGHT_);
		let test = parser_getData(sContext);
		console.log(test);
	});
}

function parser_getData(sContext) {
	console.log(sContext);
	tbContext = sContext.split('.');

	// tbContext = tbContext.slice(-2);
	// console.log(tbContext);
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