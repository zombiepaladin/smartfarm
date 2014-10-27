(function() {
	
	setTimeout(function(){
		var tagHighlightList = $('.tagClass');
		//console.log(tagHighlightList.length);
		tagHighlightList.each(function( key ) {
			//console.log(tagHighlightList[key].innerHTML);
			if (typeof tagHighlightList[key] != "undefined" && typeof tagHighlightList[key].innerHTML != "undefined")
			{
				tagHighlightList[key].addEventListener("mouseover", function(){ highlightTags(tagHighlightList[key], 1) });
				tagHighlightList[key].addEventListener("mouseout", function(){ highlightTags(tagHighlightList[key], 0) });
			}
		});
	}, 1000);
	
	
	function highlightTags(thisTag, addRemove)
	{
		var tagList = $('.tagClass');
		var lookingForTag = thisTag.innerHTML;
		tagList.each(function( key ) {
			if (tagList[key].innerHTML == lookingForTag)
			{
				if (typeof thisTag != "undefined" && typeof thisTag.innerHTML != "undefined")
				{
					//console.log(tagList[key].innerHTML);
					
					if (addRemove == 1)
					{
						tagList[key].className = tagList[key].className + ' tagHighlightedClass';
					}
					else
					{
						//tagList[key].className ='tagClass';
						tagList[key].className = tagList[key].className.replace(' tagHighlightedClass', '');
					}
				}
			}
		});
	}
})();