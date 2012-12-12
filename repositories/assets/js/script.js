
(function ($, window) {

	'use strict';
	/*jslint browser: true*/
	/*global jQuery*/

	var sort_by = 'updated',
		user = 'roine';


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
		.appendTo('.listRepos');

	}


	$.getJSON('https://api.github.com/users/'+user+'/repos?sort='+sort_by+'&callback=?', function (response) {

		var repos = response.data,
			totalRepos = 0;

		$.each(repos, function (index, repo) {

			if(!repo.fork) {

				createRepoBox(repo);

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
