// var __VORTEX_ADDR_ = 'http://mathias-kulhandjian.fr/vortex/';
var __VORTEX_ADDR_ = 'http://127.0.0.1/vortex/';

// var __CODEX_ADDR_ = 'http://mathias-kulhandjian.fr/dojo/';
var __CODEX_ADDR_ = 'http://127.0.0.1/dojo/';

var __CLIENT_NAME_ = 'dojo';
var __CODEX_DATA_ = [];
var __CODEX_CURRENT_RESSOURCE_NAME_ = '';
var __CODEX_CURRENT_RESSOURCE_ID_ = 1;

var __CODEX_CALLBACK_QUEUE_ = [];

async function codex_init()
{
	let tbData 	= await codex_API('ressource');

	if (tbData.length > 0) {
		__CODEX_DATA_ = tbData;
		codex_saveData();
	}

	await codex_parseCodex('style', 'css');
	await codex_parseCodex('menu', 'top-menu');

	await codex_parseCodex(window.location.href, 'content');
}

function codex_saveData() {
	let req = new XMLHttpRequest();
	req.open('POST', __CODEX_ADDR_+'/codex/write_data.php', true);

	let fd = new FormData();
	fd.append('data', JSON.stringify(__CODEX_DATA_));

	req.send(fd);
}

async function codex_parseCodex(sPageQuery, sContainerId = null)
{
	let oRoute = await router_match(sPageQuery);
	let sPageName = (oRoute.page != undefined) ? oRoute.page : oRoute.route;
	return new Promise((resolve) => {
		let req = new XMLHttpRequest();
		req.open('GET', './page/'+sPageName+'.html');
		req.onload = async function()
		{
			let sContent = await parser_parse(req.response);
			if (sContainerId != null) {
				document.getElementById(sContainerId).innerHTML = sContent;
				if (oRoute.callback != undefined) {
					oRoute.callback(oRoute);
				}
				__CODEX_CALLBACK_QUEUE_.forEach((cb) => {
					cb();
				});
			} else {
				__CODEX_CALLBACK_QUEUE_.push(oRoute.callback);
			}
			resolve(sContent);
		}
		req.send();
	});
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

function codex_fetchLocalRessource(sRessName)
{
	return new Promise(function(resolve, reject) {
		if (typeof __CODEX_DATA_[sRessName] == 'undefined')
		{
			let req = new XMLHttpRequest();
			req.open('GET', './codex/data/'+sRessName+'.json');
			req.onload = function()
			{
				if (req.response.length > 5) {
					try {
						__CODEX_DATA_[sRessName] = JSON.parse(req.response);
						resolve(true);
					}
					catch {
						resolve(false);
					}
				} else {
					resolve(false);
				}
			}
			req.send();
		} else {
			resolve();
		}
	});
}
