// var __VORTEX_ADDR_ = 'http://127.0.0.1:3000/vortex/';
var __VORTEX_ADDR_ = 'http://127.0.0.1/vortex/';
var __CLIENT_NAME_ = 'dojo';
var __CODEX_DATA_ = {};

const _CDX_LEFT_ESCAPED_	 = '\\[cdx';
const _CDX_LEFT_ 			 ='[cdx';
const _CDX_RIGHT_			 = 'cdx]';
const _CDX_END_LOOP_ESCAPED_ = _CDX_LEFT_ESCAPED_+' endloop '+_CDX_RIGHT_;
const _CDX_END_LOOP_		 = _CDX_LEFT_+' endloop '+_CDX_RIGHT_;

var sCurrentPage = '';

async function codex_init()
{
	__CODEX_DATA_ = await codex_API('ressource');

	console.log(__CODEX_DATA_);

	codex_parseCodex('home', 'content');
}

function codex_parseCodex(sPageName, sContainerId)
{
	let req = new XMLHttpRequest();
	req.open('GET', './page/'+sPageName+'.html');
	req.onload = function()
	{
		sCurrentPage = req.response;

		while((nStart = sCurrentPage.search(_CDX_LEFT_ESCAPED_)) != -1)
		{
			sCdx = string_searchContain(sCurrentPage, _CDX_LEFT_ESCAPED_, _CDX_RIGHT_);
			codex_parseCdx(sCdx);
		}

		// console.log(sCurrentPage);

		document.getElementById(sContainerId).innerHTML = sCurrentPage;
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

	if (sRessource.search('-') != -1) {
		let tbRessource = sRessource.split('-');
		sRessource = tbRessource[0];
		nRess = tbRessource[1];
	}

	sCurrentPage = sCurrentPage.replace(_CDX_LEFT_+sCdx+_CDX_RIGHT_, __CODEX_DATA_[sRessource][nRess][sAttribute]);
}

function codex_parseLoop(sCdx, sRessource)
{
	let ret = '';

	sComponent = string_searchContain(sCurrentPage, _CDX_LEFT_ESCAPED_+sCdx+_CDX_RIGHT_, _CDX_END_LOOP_ESCAPED_);

	__CODEX_DATA_[sRessource].forEach((r, i) => {
		let sSubCdx = '';
		let sSaveComponent = sComponent;
		let sResultComponent = sComponent;
		let tbSubCdx = [];
		while ((sSubCdx = string_searchContain(sSaveComponent, _CDX_LEFT_ESCAPED_, _CDX_RIGHT_))) {
			let tbSubCdx = sSubCdx.split('.');
			tbSubCdx[0] = tbSubCdx[0]+'-'+i;
			sResultComponent = sResultComponent.replace(sSubCdx, tbSubCdx.join('.'));
			sSaveComponent = sSaveComponent.replace(_CDX_LEFT_+sSubCdx+_CDX_RIGHT_, '');
		}
		ret += sResultComponent;
	});

	let sComponentReplace = _CDX_LEFT_+sCdx+_CDX_RIGHT_+sComponent+_CDX_END_LOOP_;

	sCurrentPage = sCurrentPage.replace(sComponentReplace, ret);
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