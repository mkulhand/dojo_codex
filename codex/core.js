var __VORTEX_ADDR_ = 'http://127.0.0.1:3000/vortex/';
// var __VORTEX_ADDR_ = 'http://127.0.0.1/vortex/';

var __CODEX_ADDR_ = 'http://127.0.0.1:3000/dojo_codex/';
var __CLIENT_NAME_ = 'dojo';
var __CODEX_DATA_ = {};
var __CODEX_ROUTE_ = ['home', 'plan', 'discipline'];

async function codex_init()
{

	if (!await codex_getData()) {
		__CODEX_DATA_ 	= await codex_API('ressource');
		codex_saveData();
	}

	console.dir(__CODEX_DATA_);

	codex_parseCodex('style', 'css');
	codex_parseCodex('menu', 'top-menu');

	sPageQuery = (window.location.href).split(__CODEX_ADDR_);

	if (sPageQuery[1] == '') {
		sPageQuery = 'home';
	} else {
		sPageQuery = sPageQuery[1];
	}

	if (!__CODEX_ROUTE_.includes(sPageQuery)) {
		sPageQuery = '404';
	}

	codex_parseCodex(sPageQuery, 'content');
}

function codex_getData() {
	return new Promise(function(resolve, reject) {
		let req = new XMLHttpRequest();
		req.open('GET', './codex/data.json');
		req.onload = function()
		{
			if (req.response.length > 5) {
				__CODEX_DATA_ = JSON.parse(req.response);
				resolve(true);
			} else {
				resolve(false);
			}
		}
		req.send();
	});
}

function codex_saveData() {
	let req = new XMLHttpRequest();
	req.open('POST', __CODEX_ADDR_+'/codex/write_data.php', true);
	console.log(__CODEX_DATA_['Discipline'][1]['photo']);

	let fd = new FormData();

	fd.append('data', JSON.stringify(__CODEX_DATA_));
	req.onload = function()
	{
		// console.log(req.response);
	}
	req.send(fd);
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

function codex_loadPage(sPageName, sGet) {
	window.location = __CODEX_ADDR_+sPageName;
	// codex_parseCodex(sPageName, 'content');
	// window.history.replaceState(null, '', sPageName);
}