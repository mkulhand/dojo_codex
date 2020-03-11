
var __CODEX_ROUTE_ = [];

/*=============================
=            ROUTE            =
=============================*/


/*----------  HOME  ----------*/
router_add({
	route: 'home',
	ressource: ['Categorie', 'Discipline', 'Contact', 'Accueil'],
	callback: () => {
		Array.from(document.getElementsByClassName("disc-item")).forEach(function(item) {
			item.addEventListener('mouseenter', (e) => {
				showBanner(e.target.id);
			});
			item.addEventListener('mouseleave', (e) => {
				showBanner('default');
			});
		});
	}
});

/*----------  STYLE  ----------*/
router_add({
	route: 'style',
	ressource: ['font']
});

/*----------  MENU  ----------*/
router_add({
	route: 'menu',
	ressource: ['Accueil']
})

/*----------  PLAN  ----------*/
router_add({
	route: 'plan',
});

/*----------  HORAIRE  ----------*/
router_add({
	route: 'horaire',
	ressource: ['Horaire']
});

/*----------  CONTACT  ----------*/
router_add({
	route: 'contact',
	ressource: ['Contact']
});

/*----------  DISCIPLINE  ----------*/
router_add({
	route: '${Discipline.nom}',
	ressource: ['Discipline', 'Prof'],
	page: 'discipline',
	callback: (e) => {
		let r = e.specificRessource;
		for (let i in __CODEX_DATA_['Categorie'])
		{
			let c = __CODEX_DATA_['Categorie'][i];
			let tbDisc = JSON.parse(c.discipline);
			for (let j in tbDisc)
			{
				let d = JSON.parse(tbDisc[j]);
				if (d.id == r.id) {
					let eCateg = document.getElementById('categ-'+c['id']);
					eCateg.children[1].classList.add('disc-wrapper-hovered');
					document.getElementById(r.nom).classList.add('disc-item-hovered');
				}
			}
		}
	}
});


/*----------  ASSOCIATION  ----------*/
router_add({
	route: 'association',
	ressource: ['Association'],
	callback: () => {
		gallery_init();
	}
});

/*----------  LOCATION  ----------*/
router_add({
	route: 'location',
	ressource: ['Salle']
});

router_add({
	route: 'categWidget',
	ressource: ['Categorie', 'Discipline'],
	callback: () => {
		Array.from(document.getElementsByClassName("categ-item")).forEach(function(item) {
			let posLeft = item.children[0].getBoundingClientRect().left;
			item.children[1].children[0].style.marginLeft = posLeft+'px';
		});

	}
})


/*=====  End of ROUTE  ======*/


/*=================================
=            FUNCTIONS            =
=================================*/


function router_add(oConfig)
{
	__CODEX_ROUTE_.push(oConfig);
}

function router_match(sPageQuery)
{
	__CODEX_CURRENT_RESSOURCE_NAME_ = '';
	__CODEX_CURRENT_RESSOURCE_ID_ = 1;

	sPageQuery = replaceAll(sPageQuery, '%20', ' ');

	sPageQuery = sPageQuery.split(__CODEX_ADDR_);

	sPageQuery = (sPageQuery[1] != undefined) ? sPageQuery[1] : sPageQuery[0];

	if (sPageQuery == '' || sPageQuery == 'home') {
		sPageQuery = 'home';
	}

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
						ret = r;
						r.specificRessource = c;
						__CODEX_CURRENT_RESSOURCE_NAME_ = tbContext[0];
						__CODEX_CURRENT_RESSOURCE_ID_ = c.id;
						await router_includeRessource(r);
					}
				}
			} else {
				if (r.route == sPageQuery)
				{
					await router_includeRessource(r);
					ret = r;
				}
			}
		}

		if (ret == false) {
			ret = {route: '404'}
		}

		resolve(ret);
	})
}

function router_includeRessource(oRoute) {
	return new Promise(async (resolve) => {
		if (oRoute.ressource != undefined) {
			for(let i = 0; i < oRoute.ressource.length; i++) {
				await codex_fetchLocalRessource(oRoute.ressource[i]);
			}
		}
		resolve();
	});
}

window.onpopstate = function(event) {
	codex_parseCodex(window.location.href, 'content');
};

function router_go(sPageName) {
	codex_parseCodex(__CODEX_ADDR_+sPageName, 'content');
	window.history.pushState(null, '', window.location.href);
	window.history.replaceState(null, '', sPageName);
}

/*=====  End of FUNCTIONS  ======*/