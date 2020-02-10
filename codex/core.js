var __VORTEX_ADDR_ = 'http://127.0.0.1:3000/vortex/';
var __CLIENT_NAME_ = 'dojo';
var __CODEX_DATA_ = {};

async function codex_init()
{
	__CODEX_DATA_ = await codex_API('ressource');

	console.log(__CODEX_DATA_);

	codex_parseHTML('home', 'content');
}

function codex_parseHTML(sPageName, sContainerId)
{
	let req = new XMLHttpRequest();
	req.open('GET', './page/'+sPageName+'.html');
	req.onload = function()
	{
		let sPage = req.response;

		while((nStart = sPage.search("\\[cdx")) != -1)
		{
			let sCdx = sPage.substr(nStart+4);
			let nEnd = sCdx.search('cdx]');
			sCdx = sCdx.substr(0, nEnd);
			sPage = sPage.replace('[cdx'+sCdx+'cdx]', codex_parseCodex(sCdx));
		}

		document.getElementById(sContainerId).innerHTML = sPage;
	}
	req.send();
}

function codex_parseCodex(sCdx) {
	let tbCdx = sCdx.trim().split('.');

	let sRessource = tbCdx[0];
	let sAttribute = tbCdx[1];
	let nRess = null;

	if (sRessource.search('-') != -1) {
		let tbRessource = sRessource.split('-');
		sRessource = tbRessource[0];
		nRess = tbRessource[1];
	}

	let ret = __CODEX_DATA_[sRessource][nRess][sAttribute];

	return ret;
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