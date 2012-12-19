
(function ($, window) {

	'use strict';
	/*jslint browser: true*/
	/*global jQuery*/

	var sort_by = 'updated',
		translate = 0,
		margin = 20,
		sortDir = -1,
		customUser = window.location.hash.substring(1),
		user = customUser || 'roine';



	// format the date like following dd mm yyyy, 18 January 2000
	function formatDate (date){
		var dDate = new Date(date),
			day = dDate.getDate(),
			month = dDate.getMonth(),
			year = dDate.getFullYear(),
			m_names = ["January", "February", "March", "April", 
						"May", "June", "July", "August", 
						"September", "October", "November", "December"];

		// add at beggining if necessary
		day = (day < 10 && day > 0) ? '0'+day : day;

		return day+' '+m_names[month]+' '+year;  
	}



	// clean the repository name (replace dash and underscores by whitespace)
	function cleanRepoName (str) {
		return  str.replace(/_|-/g, ' ');	
	}

	

	// create the html boxes
	function createRepoBox (repo) {
		var homepage = repo.homepage || repo.html_url,

			leftMenu = $(document.createElement('div'))
			.addClass('details'),

			link = $(document.createElement('a'))
			.addClass('name')
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

	// translate the boxes
	function translateCSS ($repo) {
		var vendor = ['-moz-', '-webkit-', '-ms-', '-o-', ''],
			data = $repo.data('translate'),
			center = Math.floor(($('.listRepos').outerWidth()-$repo.outerWidth())/2);

		$.each(vendor, function (i, vendor) {
			$repo.css(vendor+'transform', 'translate('+center+'px,'+data[1]+'px)');
		});

		return data[1];
	}

	// click on sort button event handler
	function sortHandler(){
		var that = this,
		sortBy = $(that).data('sort'),
			translate = 0;

		if($(that).hasClass('selected')){
			sortDir = (sortDir === 1) ? -1 : 1;
		}

		// remove the bold to all link into sort
		$('.sort a, .details .selected').removeClass('selected');
		// add bold to the current link
		$(that).add('.details .'+sortBy).addClass('selected');

		function sortFn ( alpha, beta ) {
            var a = $.data(alpha, 'sort')[sortBy],
                b = $.data(beta, 'sort')[sortBy];
            if(typeof a === 'string' && typeof b === 'string'){
				a = a.toLowerCase();
				b = b.toLowerCase();
				return (( b > a ) ? 1 : ( b < a ) ? -1 : 0) * sortDir;
            }
            else if(typeof a === 'number' && typeof b === 'number'){
				return (( a > b ) ? 1 : ( a < b ) ? -1 : 0) * sortDir;
            }
            
        }
		
		// sort the repositories
		var sorted = $('.repo').sort( sortFn );

		$.each(sorted, function(index, elem){
			$(elem).data('translate', [0, translate]);
			translate += $(elem).outerHeight()+margin;
			translateCSS($(elem));
		});
		return false;
	}

	function getRepos(){
		$.getJSON('https://api.github.com/users/'+user+'/repos?sort='+sort_by+'&callback=?', function (response) {

			var repos = response.data,
				totalRepos = 0,
				heightWrapper = 0;

			if(repos.message === "Not Found" || !repos.length){
				return;
			}

			$.each(repos, function (index, repo) {
				// only parse the non-forked repositories
				if(!repo.fork) {
					var $repo = createRepoBox(repo);
					heightWrapper = translateCSS($repo);
					totalRepos += 1;
				}
					
			});
			$('.listRepos').css('height', heightWrapper+($('.listRepos .repo:last-child').outerHeight()+margin));
			$('#'+sort_by).add('.details .'+sort_by).addClass('selected');
			$('.totalRepos').find('span').text(totalRepos);
			
		});
	}

	function getUserInfos(){
		$.getJSON('https://api.github.com/users/'+user+'?callback=?', function (response) {
			var $box = $('.card'),
				info = response.data;
			$box.find('.name').text(info.name+' AKA ').end()
				.find('.nickname').text(info.login);

		});
	}

	// constructor
	function init(){
		
		getRepos();
		getUserInfos()
;		// event Listeners
		$('.sort').on('click', 'a', sortHandler);
	}
	// end init


	init();
}(jQuery, window));
