
function menu_activateItem(e) {
	menu_resetItem();
	e.classList.add("menuItemActif");
}

function menu_resetItem() {
	Array.from(document.getElementsByClassName("menuItem")).forEach(function(item) {
		item.classList.remove('menuItemActif');
	});
}