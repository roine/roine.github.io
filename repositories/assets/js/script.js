
// clean the repository name
var cleanRepoName = function (str) {
	str = str.replace('_', ' ');
	str = str.replace('-', ' ');
	return str;
};

// create the html boxes
var createRepoBox = function (repo) {
	homepage = repo.homepage || repo.html_url;

	var link = $(document.createElement('a'))
		.attr({
			'href':homepage,
			'ref': repo.name
		})
		.text(cleanRepoName(repo.name));

	$(document.createElement('div'))
	.attr({
		'data-name':repo.name,
		'data-created_at':Date.parse(repo.created_at),
		'data-updated_at':Date.parse(repo.updated_at)
	})
	.addClass('repo')
	.append(link)
	.appendTo('.listRepos');
}

$.getJSON('https://api.github.com/users/roine/repos?sort=updated&callback=?', function (response) {
	var repos = response.data;

	var totalRepos = 0,
		i = 0,
		listRepos = [],
		homepage = '';

	$.each(repos, function (index, repo) {


		if(!repo.fork) {

			createRepoBox(repo)

			totalRepos = ++i;

		}
	});
	$('.totalRepos').find('span').text(totalRepos);
});
