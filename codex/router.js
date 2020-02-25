
var __CODEX_ROUTE_ = [];

router_add({
	route: 'plan',
});

router_add({
	route: 'horaire',
	ressource: ['Horaire']
});

router_add({
	route: 'style',
	ressource: ['font']
})

router_add({
	route: 'menu',
	ressource: ['Accueil']
})

router_add({
	route: 'contact',
	ressource: ['Contact']
});

router_add({
	route: '${Discipline.nom}',
	ressource: ['Discipline', 'Prof'],
	page: 'discipline.html'
});

router_add({
	route: 'test',
	ressource: ['Categorie', 'Discipline']
});

router_add({
	route: 'home',
	ressource: ['Categorie', 'Discipline', 'Contact', 'Accueil']
})

function router_add(oConfig)
{
	__CODEX_ROUTE_.push(oConfig);
}


async function router_execUrl(sPageQuery = window.location.href)
{
	__CODEX_CURRENT_RESSOURCE_NAME_ = '';
	__CODEX_CURRENT_RESSOURCE_ID_ = 1;

	sPageQuery = sPageQuery.split(__CODEX_ADDR_)[1];

	if (sPageQuery == '' || sPageQuery == 'home') {
		sPageQuery = 'home';
	}

	if (!(sPageQuery = await router_match(sPageQuery))) {
		sPageQuery = '404';
	}

	await codex_parseCodex(sPageQuery, 'content');
}

function router_match(sPageQuery)
{
	return new Promise(async (resolve) => {
		let ret = false;

		for (let i in __CODEX_ROUTE_)
		{
			let r = __CODEX_ROUTE_[i];
			if (r.route.includes('$')) {
				let tbContext = string_searchContain(r.route, '${', '}').substr(2).split('.');

				if (typeof __CODEX_DATA_[tbContext[0]] == 'undefined') {
					await codex_fetchLocalRessource(tbContext[0]);
				}

				for (let j in __CODEX_DATA_[tbContext[0]])
				{
					c = __CODEX_DATA_[tbContext[0]][j];
					if (sPageQuery == c[tbContext[1]])
					{
						ret = tbContext[0];
						__CODEX_CURRENT_RESSOURCE_NAME_ = tbContext[0];
						__CODEX_CURRENT_RESSOURCE_ID_ = c.id;
						await router_includeRessource(r);
					}
				}
			} else {
				if (r.route == sPageQuery)
				{
					await router_includeRessource(r);
					ret = sPageQuery;
				}
			}
		}

		resolve(ret);
	})
}

function router_includeRessource(oRoute) {
	return new Promise(async (resolve) => {
		for(let i = 0; i < oRoute.ressource.length; i++) {
			await codex_fetchLocalRessource(oRoute.ressource[i]);
		}
		resolve();
	});
}

window.onpopstate = function(event) {
	router_execUrl();
};

function router_go(sPageName) {
	router_execUrl(__CODEX_ADDR_+sPageName);
	window.history.pushState(null, '', window.location.href);
	window.history.replaceState(null, '', sPageName);
}