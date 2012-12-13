
(function ($, window) {

	'use strict';
	/*jslint browser: true*/
	/*global jQuery*/

	var sort_by = 'updated',
		user = 'roine',
		translate = 0,
		margin = 20,
		sortDir = -1,
		customUser = window.location.hash.substring(1);

	if(customUser) user = customUser;

	function formatDate (date){
		var dDate = new Date(date),
			day = dDate.getDate(),
			month = dDate.getMonth(),
			year = dDate.getFullYear(),
			m_names = ["January", "February", "March", 
"April", "May", "June", "July", "August", "September", 
"October", "November", "December"];

		day = (day < 10 && day > 0) ? '0'+day : day;
		//month = (month < 10 && month > 0) ? '0'+month : month;
		return day+' '+m_names[month]+' '+year;  
	}
	// clean the repository name
	function cleanRepoName (str) {
		str = str.replace('_', ' ');
		str = str.replace('-', ' ');
		return str;
	}

	
	// create the html boxes
	function createRepoBox (repo) {
		var homepage = repo.homepage || repo.html_url,
			leftMenu = $(document.createElement('a'))
			.addClass('details'),

			link = $(document.createElement('a'))
			.attr({
				'href':homepage,
				'ref': repo.name
			})
			.text(cleanRepoName(repo.name))
			.appendTo(leftMenu),

			description = $(document.createElement('div'))
			.addClass('description')
			.text(repo.description)
			.appendTo(leftMenu),

			dates = $(document.createElement('div'))
			.addClass('dates')
			.html('<ul><li class="created"><label>Created at:</label> '+formatDate(repo.created_at)+'</li><li class="updated"><label>Updated at:</label> '+formatDate(repo.updated_at)+'</li></ul>')
			.appendTo(leftMenu),

			repoBox = $(document.createElement('div'))
			.data('sort', {
				'name': repo.name,
				'created': Date.parse(repo.created_at),
				'updated': Date.parse(repo.updated_at),
				'watchers': repo.watchers,
				'open_issues_count': repo.open_issues_count,
				'language': repo.language
			})
			.addClass('repo drop-shadow')
			.append(leftMenu)
			.appendTo('.listRepos');

		
		repoBox.data('translate', [0, translate]);
		translate += repoBox.outerHeight()+margin;
		return repoBox;
	}

	function translateCSS ($repo) {
		var vendor = ['-moz-', '-webkit-', '-ms-', '-o-', ''],
			data = $repo.data('translate'),
			center = Math.floor(($('.listRepos').outerWidth()-$repo.outerWidth())/2);

		$.each(vendor, function (i, vendor) {
			$repo.css(vendor+'transform', 'translate('+center+'px,'+data[1]+'px)');
		});
		return data[1];
	}


	$.getJSON('https://api.github.com/users/'+user+'/repos?sort='+sort_by+'&callback=?', function (response) {

		var repos = response.data,
			totalRepos = 0,
			heightWrapper = 0;

		$.each(repos, function (index, repo) {

			if(!repo.fork) {

				var $repo = createRepoBox(repo);
			
				heightWrapper = translateCSS($repo);

				totalRepos += 1;

			}
				
		});
		$('.listRepos').css('height', heightWrapper+($('.listRepos .repo:last-child').outerHeight()+margin));
		$('#'+sort_by).addClass('selected');
		$('.details .dates .'+sort_by).addClass('selected');
		$('.totalRepos').find('span').text(totalRepos);
		
	});
	// end getJSON

	$('.sort').on('click', 'a', function(){

		var sortBy = $(this).data('sort'),
			translate = 0;


		if($(this).hasClass('selected')){
			sortDir = (sortDir === 1) ? -1 : 1;
		}

		// remove the bold to all link into sort
		$('.sort a, .details .dates li').removeClass('selected');
		// add bold to the current link
		$(this).add('.details .dates .'+sortBy).addClass('selected');

		function sortFn ( alpha, beta ) {
            var a = $.data(alpha, 'sort')[sortBy],
                b = $.data(beta, 'sort')[sortBy];
            return (( a > b ) ? 1 : ( a < b ) ? -1 : 0) * sortDir;
        }
		

		// sort the repositories
		var sorted = $('.repo').sort( sortFn );

		$.each(sorted, function(index, elem){
			$(elem).data('translate', [0, translate]);
			translate += $(elem).outerHeight()+margin;
			translateCSS($(elem));
		});
		return false;
	});
	
}(jQuery, window));
