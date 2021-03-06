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

/*----------  CDX COMPONENT  ----------*/
const _CDX_LEFT_COMPONENT_ = '[component';
const _CDX_LEFT_COMPONENT_ESCAPED_ = '\\[component';
const _CDX_RIGHT_COMPONENT_ = 'component]';


function parser_parse(sPage)
{
	return new Promise(async (resolve) => {
		let tbLoop = parser_getLoops(sPage);
		let nDiffLength = 0;

		tbLoop.forEach((oLoop, i) => {
			parser_shiftLoop(oLoop, nDiffLength);

			let sLoopContent = parser_parseLoop(oLoop);
			let sToReplace = sPage.slice(oLoop.start, oLoop.end);
			sPage = sPage.replace(sToReplace, sLoopContent);

			if (sLoopContent !== undefined) {
				nDiffLength += sLoopContent.length - sToReplace.length;
			}

		});

		sPage = parser_parseCdx(sPage);

		sPage = replaceAll(sPage, _CDX_END_LOOP_ESCAPED_, '');

		sPage = await parser_parseCdxComponent(sPage);

		resolve(sPage);
	});
}

function parser_shiftLoop(oLoop, nDiffLength) {
	oLoop.start += nDiffLength;
	oLoop.end += nDiffLength;

	if (Array.isArray(oLoop.children)) {
		oLoop.children.forEach(function(l) {
			parser_shiftLoop(l, nDiffLength);
		});
	}
}

/*============================================
=            CDX COMPONENT PARSER            =
============================================*/

function parser_parseCdxComponent(sPage)
{
	return new Promise(async (resolve) => {
		let tbComponentParsed = await string_forEachOccurenceAsync(sPage, _CDX_LEFT_COMPONENT_, function(nStart, aTransverse)
		{

			if (aTransverse != undefined) {
				sPage = sTransverse;
			}

			return new Promise(async (resolve) => {
				let sComponent = string_searchContain(sPage.substr(nStart), _CDX_LEFT_COMPONENT_ESCAPED_, _CDX_RIGHT_COMPONENT_).trim();

				sComponentContent = await codex_parseCodex(sComponent);

				resolve(sPage.replace(_CDX_LEFT_COMPONENT_+' '+sComponent+' '+_CDX_RIGHT_COMPONENT_, sComponentContent));
			})
		});

		if (tbComponentParsed.length != 0) {
			sPage = tbComponentParsed[tbComponentParsed.length - 1]
		}

		resolve(sPage);
	});
}

/*=====  End of CDX COMPONENT PARSER  ======*/


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
	let sRes = '';
	let sSaveContent = '';

	tbRess = parser_parseContext(oLoop);

	let sContext = oLoop.context;

	if (Array.isArray(tbRess) && tbRess.length > 0) {
		let i = 0;
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
					if (sSubRes == 'undefined') {
						sSubRes = '';
					}
					sParsedContent = oLoop.content.replace(oLoop.content.slice(l.start - oLoop.start, l.end - oLoop.end), sSubRes);
				});
				let nId = (r.id == undefined) ? i : r.id;
				sParsedContent = parser_thisReplacer(sParsedContent, sContext+'-'+nId);
				sRes += sParsedContent;
			}
			else
			{
				let nId = (r.id == undefined) ? i : r.id;
				sLoopContent = parser_thisReplacer(oLoop.content, sContext+'-'+nId);
				sRes += sLoopContent;
			}
			i++;
		});
	}

	if (sRes != '') {
		return sRes;
	}
}

function parser_parseContext(oLoop)
{
	let sContext = oLoop.context;
	let tbContext = sContext.split('.');
	let aRes = [];

	if (tbContext.length == 1)
	{
		aRes = __CODEX_DATA_[sContext];
	}
	else
	{
		if (tbContext.length == 2)
		{
			let tbRess = tbContext[0].split('-');
			let tbRessource = parser_getRessource(tbRess[0], tbRess[1]);

			if (tbRessource !=  undefined && tbRessource[tbContext[1]].length > 0)
			{
				tbRessource = JSON.parse(tbRessource[tbContext[1]]);
				tbRessource.forEach(function(r) {
					try
					{
						r = JSON.parse(r);
						aRes.push(parser_getRessource(r.type, r.id));
						oLoop.context = r.type;
					}
					catch
					{
						aRes.push(tbRessource);
					}
				});
			}
		}
	}

	return aRes;
}

/*=====  End of CDX LOOP PARSER  ======*/


/*==================================
=            CDX PARSER            =
==================================*/

function parser_parseCdx(sPage)
{
	let nDiffLength = 0;
	let nSaveEnd = 0;
	let sPageToParse = sPage;

	string_forEachOccurence(sPage, _CDX_LEFT_, function(nStart)
	{
		nStart += nDiffLength;
		let sContext = string_searchContain(sPageToParse.substr(nStart), _CDX_LEFT_ESCAPED_, _CDX_RIGHT_);

		if (sContext.length == 0) { return };

		let sContent = parser_getData(sContext);

		if (sContent !== undefined) {
			nDiffLength += sContent.length - (_CDX_LEFT_+sContext+_CDX_RIGHT_).length;
			sPageToParse = sPageToParse.replace(_CDX_LEFT_+sContext+_CDX_RIGHT_, sContent);
		}
	});

	return sPageToParse;
}

function parser_getData(sContext) {
	let tbContext = sContext.split('.');
	let sAttrName = tbContext[1].trim();
	let tbRessource = tbContext[0].split('-');
	let ret = '';

	tbRessource[0] = tbRessource[0].trim();

	nIndexMultiple = sAttrName.split('-')[1];

	if (nIndexMultiple != undefined)
	{
		sAttrName = sAttrName.split('-')[0];
		ret = parser_getRessource(tbRessource[0], tbRessource[1]);
		ret = JSON.parse(ret[sAttrName])[nIndexMultiple];
	}
	else
	{
		ret = parser_getRessource(tbRessource[0], tbRessource[1]);
		ret = ret[sAttrName];
	}

	return ret;
}

function parser_getRessource(sRessName, nId) {
	let res;

	if (nId == undefined && sRessName == __CODEX_CURRENT_RESSOURCE_NAME_) {
		nId = __CODEX_CURRENT_RESSOURCE_ID_;
	}

	if (nId == undefined) {
		nId = 1;
	}

	sRessName = sRessName.trim();

	if (__CODEX_DATA_[sRessName] !== undefined) {
		__CODEX_DATA_[sRessName].forEach(function(r) {
			if (r.id == Number(nId)) {
				res = r;
			}
		});
	}

	return res;
}

/*=====  End of CDX PARSER  ======*/

function parser_thisReplacer(sLoopContent, sContext) {
	sLoopContent = replaceAll(sLoopContent, 'this', sContext);
	return string_searchContain(sLoopContent, _CDX_RIGHT_LOOP_, _CDX_END_LOOP_ESCAPED_).substr(1).trim();
}