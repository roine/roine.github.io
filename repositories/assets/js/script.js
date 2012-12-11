$.getJSON('https://api.github.com/users/roine/repos?sort=updated&callback=?', function (response) {
	var repos = response.data;

	var totalRepos = 0,
		i = 0,
		listRepos = [];

	$.each(repos, function(index, repo){
		
		if(!repo.fork){
			$(document.createElement('div'))
			.attr({
				'data-name':repo.name,
				'data-created_at':Date.parse(repo.created_at),
				'data-updated_at':Date.parse(repo.updated_at)
			})
			.addClass('repo')
			.html(repo.name)
			.appendTo('.listRepos')


			totalRepos = ++i;

		}
	});
	$('.totalRepos').find('span').text(totalRepos);
});

console.log(jQuery.ajaxSetup('cache'))