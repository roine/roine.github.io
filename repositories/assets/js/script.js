
(function ($, window) {

	'use strict';
	/*jslint browser: true*/
	/*global jQuery*/

	var sort_by = 'updated',
		user = 'roine',
		translate = 0,
		margin = 20;


	// clean the repository name
	function cleanRepoName (str) {
		str = str.replace('_', ' ');
		str = str.replace('-', ' ');
		return str;
	}

	
	// create the html boxes
	function createRepoBox (repo) {
		var homepage = repo.homepage || repo.html_url,

			link = $(document.createElement('a'))
			.attr({
				'href':homepage,
				'ref': repo.name
			})
			.text(cleanRepoName(repo.name)),

			description = $(document.createElement('div'))
			.addClass('description')
			.text(repo.description),

			repoBox = $(document.createElement('div'))
			.data('sort', {
				'name': repo.name,
				'created_at': Date.parse(repo.created_at),
				'updated_at': Date.parse(repo.updated_at),
				'watchers': repo.watchers,
				'open_issues_count': repo.open_issues_count,
				'language': repo.language
			})
			.addClass('repo')
			.append(link)
			.append(description)
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
	}


	$.getJSON('https://api.github.com/users/'+user+'/repos?sort='+sort_by+'&callback=?', function (response) {

		var repos = response.data,
			totalRepos = 0;

		$.each(repos, function (index, repo) {

			if(!repo.fork) {

				var $repo = createRepoBox(repo);
			
				translateCSS($repo);

				totalRepos += 1;

			}
		});

		$('#'+sort_by).addClass('selected');
		$('.totalRepos').find('span').text(totalRepos);
		
	});
	// end getJSON

	$('.sort').on('click', 'a', function(){

		// remove the bold to all link into sort
		$('.sort a').removeClass('selected');

		// add bold to the current link
		$(this).addClass('selected');

		$('.repo').each(function(i, rep){
			var created_at = $(rep).data('created_at'),
				updated_at = $(rep).data('updated_at');

		});

		return false;
	});
	
}(jQuery, window));
