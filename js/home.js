
function showBanner(sDiscName) {
	let tbBanners = document.getElementsByClassName('bannerImg');

	for (let b of tbBanners) {
		b.style.display = 'none';
	}

	let eBanner = document.getElementsByClassName(sDiscName+'-banner');
	eBanner[0].style.display = 'block';
}