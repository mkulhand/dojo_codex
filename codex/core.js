var __VORTEX_ADDR_ = 'http://127.0.0.1:3000/vortex/';
// var __VORTEX_ADDR_ = 'http://127.0.0.1/vortex/';
var __CLIENT_NAME_ = 'dojo';
var __CODEX_DATA_ = {};
// var __CODEX_CONFIG_ = {};

const _CDX_LEFT_ESCAPED_	 = '\\[cdx';
const _CDX_LEFT_ 			 ='[cdx';
const _CDX_RIGHT_			 = 'cdx]';
const _CDX_END_LOOP_ESCAPED_ = _CDX_LEFT_ESCAPED_+' endloop '+_CDX_RIGHT_;
const _CDX_END_LOOP_		 = _CDX_LEFT_+' endloop '+_CDX_RIGHT_;

var sCurrentPage = '';

async function codex_init()
{
	// __CODEX_CONFIG_ = await codex_API('config');
	__CODEX_DATA_ 	= await codex_API('ressource');

	if (__CODEX_DATA_['font'] !== 'undefined') {
		codex_IncludeFont(__CODEX_DATA_['font']);
	}

	// console.log(__CODEX_CONFIG_);
	console.dir(__CODEX_DATA_);

	codex_parseCodex('menu', 'top-menu');
	codex_parseCodex('home', 'content');
}

function codex_IncludeFont(tbFont)
{
	let sFontStyle = '';

	sFontStyle += '<style>';
	tbFont.forEach((f) => {
		sFontStyle += f['file'];
	});
	sFontStyle += '</style>';

	sCurrentPage += sFontStyle;
}

function codex_parseCodex(sPageName, sContainerId)
{
	let req = new XMLHttpRequest();
	req.open('GET', './page/'+sPageName+'.html');
	req.onload = function()
	{
		sCurrentPage += req.response;

		while((nStart = sCurrentPage.search(_CDX_LEFT_ESCAPED_)) != -1)
		{
			sCdx = string_searchContain(sCurrentPage, _CDX_LEFT_ESCAPED_, _CDX_RIGHT_);
			codex_parseCdx(sCdx);
		}

		document.getElementById(sContainerId).innerHTML = sCurrentPage;

		// console.dir(sCurrentPage);

		sCurrentPage = '';
	}
	req.send();
}

function codex_parseCdx(sCdx) {
	let ret = '';

	let tbCdx = sCdx.trim().split('.');

	let sRessource = tbCdx[0];

	if (sRessource == 'loop')
	{
		codex_parseLoop(sCdx, tbCdx[1]);
	}
	else
	{
		codex_parseRessource(sCdx);
	}
}

function codex_parseRessource(sCdx) {
	let tbCdx = sCdx.trim().split('.');

	let sRessource = tbCdx[0];
	let sAttribute = tbCdx[1];
	let nRess = null;

	//cherche pour un index
	if (sRessource.search('-') != -1) {
		let tbRessource = sRessource.split('-');
		sRessource = tbRessource[0];
		nRess = tbRessource[1];
	} else {
		nRess = 0;
	}

	sCurrentPage = sCurrentPage.replace(_CDX_LEFT_+sCdx+_CDX_RIGHT_, __CODEX_DATA_[sRessource][nRess][sAttribute]);

}

function codex_parseLoop(sCdx, sRessource)
{
	let ret = '';

	console.log(sCdx);

	sComponent = string_searchContain(sCurrentPage, _CDX_LEFT_ESCAPED_+sCdx+_CDX_RIGHT_, _CDX_END_LOOP_ESCAPED_);

	if (__CODEX_DATA_[sRessource] != undefined) {
		__CODEX_DATA_[sRessource].forEach((r, i) => {
			let sSubCdx = '';
			let sSaveComponent = sComponent;
			let sResultComponent = sComponent;
			let tbSubCdx = [];

			let a = 0;
			while ((sSubCdx = string_searchContain(sSaveComponent, _CDX_LEFT_ESCAPED_, _CDX_RIGHT_)))
			{
				let tbSubCdx = sSubCdx.trim().split('.');

				//subloop
				if (tbSubCdx[0] == 'loop') {
					if (tbSubCdx[1] == 'this') {
						let sCdxLoop = string_searchContain(sCurrentPage, _CDX_LEFT_ESCAPED_+sSubCdx+_CDX_RIGHT_, _CDX_END_LOOP_ESCAPED_);
						let sSubLoopRet = codex_parseSubLoop(sRessource, i, tbSubCdx[2], sCdxLoop, sSubCdx);
						sResultComponent = sResultComponent.replace(_CDX_LEFT_+sSubCdx+_CDX_RIGHT_+sCdxLoop, sSubLoopRet);
						sSaveComponent = sSaveComponent.replace(_CDX_LEFT_+sSubCdx+_CDX_RIGHT_, '');
						// console.log('subloop:', sResultComponent);
					}
				}
				else
				{
					tbSubCdx[0] = tbSubCdx[0]+'-'+i;
					sResultComponent = sResultComponent.replace(sSubCdx, tbSubCdx.join('.'));
					sSaveComponent = sSaveComponent.replace(_CDX_LEFT_+sSubCdx+_CDX_RIGHT_, '');
				}


				a++;
				if (a > 10) {
					break;
				}

			}
			ret += sResultComponent;
		});
	}

	// console.log(ret);

	let sComponentReplace = _CDX_LEFT_+sCdx+_CDX_RIGHT_+sComponent+_CDX_END_LOOP_;

	console.log(sComponentReplace);
	console.log(ret);

	sCurrentPage = sCurrentPage.replace(sComponentReplace, ret);
}

function codex_parseSubLoop(sRessource, i, sAttr, sCdxLoop, sSubCdx)
{
	let tbRess = [];

	if (!Array.isArray(__CODEX_DATA_[sRessource][i][sAttr]))
	{
		let tbAttr = '';
		try {
			tbAttr = JSON.parse(__CODEX_DATA_[sRessource][i][sAttr]);
		} catch {
			sCurrentPage = sCurrentPage.replace(_CDX_LEFT_+sSubCdx+_CDX_RIGHT_+sCdxLoop+_CDX_END_LOOP_, '');
			return '';
		}

		tbAttr.forEach((a) => {
			a = JSON.parse(a);
			__CODEX_DATA_[a.type].forEach((b) => {
				if (b.id === a.id) {
					b.type = a.type;
					tbRess.push(b);
					return
				}
			});
		});
	}

	let sReplace = '';

	while ((sCdx = string_searchContain(sCdxLoop, _CDX_LEFT_ESCAPED_, _CDX_RIGHT_)))
	{
		let tbCdx = sCdx.trim().split('.');

		if (tbCdx[0] === sAttr)
		{
			tbRess.forEach((r, i) => {
				tbCdx[0] = r.type+'-'+i;
				sReplace += _CDX_LEFT_+' '+tbCdx.join('.')+' '+_CDX_RIGHT_+'\n';
				tbCdx[0] = r.type;
			});
		}

		sCdxLoop = sCdxLoop.replace(_CDX_LEFT_ESCAPED_+sCdx+_CDX_RIGHT_, sReplace);
		break;
	}

	return sReplace;

	// sCurrentPage = sCurrentPage.replace(_CDX_LEFT_+sSubCdx+_CDX_RIGHT_+sCdxLoop+_CDX_END_LOOP_, sReplace);
}

function codex_API(sRoute)
{
	return new Promise(function(resolve, reject) {
		let req = new XMLHttpRequest();
		req.open('GET', __VORTEX_ADDR_+__CLIENT_NAME_+'/'+sRoute);
		req.onload = function()
		{
			if (req.readyState === 4)
			{
				if (req.status === 200)
				{
					try {
						JSON.parse(req.response);
					}
					catch {
						console.log(req.response);
						return false;
					}
					let response = JSON.parse(req.response);
					if (response.success)
					{
						resolve(response.data);
					}
					else
					{
						reject(response.data);
					}
				}
			}
		}

		req.send()
	});
}

function codex_loadPage(sPageName) {
	codex_parseCodex(sPageName, 'content');
	window.history.replaceState(null, '', sPageName);
}