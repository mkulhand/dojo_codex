var __VORTEX_ADDR_ = 'http://127.0.0.1:3000/vortex/';
// var __VORTEX_ADDR_ = 'http://127.0.0.1/vortex/';
var __CLIENT_NAME_ = 'dojo';
var __CODEX_DATA_ = {};
// var __CODEX_CONFIG_ = {};

async function codex_init()
{
	// __CODEX_CONFIG_ = await codex_API('config');
	__CODEX_DATA_ 	= await codex_API('ressource');

	// console.log(__CODEX_CONFIG_);
	console.dir(__CODEX_DATA_);

	codex_parseCodex('style', 'css');
	codex_parseCodex('menu', 'top-menu');
	codex_parseCodex('home', 'content');
}

function codex_parseCodex(sPageName, sContainerId)
{
	let req = new XMLHttpRequest();
	req.open('GET', './page/'+sPageName+'.html');
	req.onload = function()
	{
		document.getElementById(sContainerId).innerHTML = parser_parse(req.response);
	}
	req.send();
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