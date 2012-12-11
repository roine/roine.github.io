$.getJSON('https://api.github.com/users/roine/repos?callback=?', function (response) {
	var repos = response.data;

	var totalRepos = 0,
		i = 0,
		listRepos = [];

	$.each(repos, function(index, value){
		if(!repos[index].fork){
			listRepos[i] = [{
				'name': repos[index].name
			}]

			i++;
		}
	});
	$('.totalRepos').find('span').text(totalRepos);
	console.log(listRepos)
});
console.log(jQuery.ajaxSetup('cache'))