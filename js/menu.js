
function menu_activateItem(e) {
	menu_resetItem();
	e.classList.add("menuItemActif");
}

function menu_resetItem() {
	console.log('?');
	Array.from(document.getElementsByClassName("menuItem")).forEach(function(item) {
		item.classList.remove('menuItemActif');
	});
}