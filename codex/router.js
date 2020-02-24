
var __CODEX_ROUTE_ = [];

router_addRoute('plan');
router_addRoute('horaire');
router_addRoute('contact');
// router_addRoute('${Discipline.nom}');
router_addRoute('test');

function router_addRoute(sRoute)
{
	oRoute = {};
	oRoute.route = sRoute;

	__CODEX_ROUTE_.push(oRoute);
}


function router_execUrl(sPageQuery = window.location.href)
{
	__CODEX_CURRENT_RESSOURCE_NAME_ = '';
	__CODEX_CURRENT_RESSOURCE_ID_ = 1;

	sPageQuery = sPageQuery.split(__CODEX_ADDR_)[1];

	if (sPageQuery == '' || sPageQuery == 'home') {
		sPageQuery = 'home';
	} else {
		if (!(sPageQuery = router_match(sPageQuery))) {
			sPageQuery = '404';
		}
	}

	codex_parseCodex(sPageQuery, 'content');
}

function router_match(sPageQuery)
{
	let ret = false;

	__CODEX_ROUTE_.forEach(function(r)
	{
		if (r.route.includes('$')) {
			let tbContext = string_searchContain(r.route, '${', '}').substr(2).split('.');
			__CODEX_DATA_[tbContext[0]].forEach(function(c) {
				if (sPageQuery == c[tbContext[1]]) {
					ret = tbContext[0];
					__CODEX_CURRENT_RESSOURCE_NAME_ = tbContext[0];
					__CODEX_CURRENT_RESSOURCE_ID_ = c.id;
				}
			});
		} else {
			if (r.route == sPageQuery)
			{
				ret = sPageQuery;
			}
		}
	});

	return ret;
}

window.onpopstate = function(event) {
	router_execUrl();
};

function router_go(sPageName) {
	router_execUrl(__CODEX_ADDR_+sPageName);
	window.history.pushState(null, '', window.location.href);
	window.history.replaceState(null, '', sPageName);
}