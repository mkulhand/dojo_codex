
function gallery_init() {
	Array.from(document.getElementsByClassName("gImage")).forEach(function(item)
	{
		item.addEventListener('click', function(e)
		{
			let eBigImage = document.getElementById('bigImage');
			let eBigImageImg = eBigImage.children[0];
			eBigImageImg.src = e.target.src;
			eBigImage.style.opacity = "1";
			eBigImage.style.zIndex = "1000";
		});
	});

	document.getElementById('bigImage').addEventListener('click', (e) =>
	{
		if (e.target.id == 'bigImage')
		{
			let eBigImage = document.getElementById('bigImage');
			eBigImage.style.opacity = "0";
			eBigImage.style.zIndex = "-1";
		}
	});
}