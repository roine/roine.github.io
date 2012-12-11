$.getJSON('https://api.github.com/users/roine/repos?sort=updated&callback=?', function (response) {
	var repos = response.data;

	var totalRepos = 0,
		i = 0,
		listRepos = [];

	$.each(repos, function(index, value){
		
		if(!repos[index].fork){
			listRepos[i] = [{
				'name': repos[index].name,
				'updated_at':repos[index].updated_at,
				'created_at':repos[index].created_at
			}];

			


			totalRepos = ++i;

		}
	});
	$('.totalRepos').find('span').text(totalRepos);
	
});
console.log(listRepos);
console.log(jQuery.ajaxSetup('cache'))