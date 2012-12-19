
(function ($, window) {

	'use strict';
	/*jslint browser: true*/
	/*global jQuery*/


	/* prototypes */


	/* 
	 * sort_by to automatically sort at first loading
	 * translate init to 0 for boxes position
	 * margin is the space between the boxes
	 * sortDir is the direction of sorting -1 is for DESC
	 * customUser is the custom user passed in the url hash
	 * user is default user login 'roine'
	 * lastRepoOverviewMax define the max number of repositories to display in overview
	*/
	var sort_by = 'updated',
		translate = 0,
		margin = 20,
		sortDir = -1,
		customUser = window.location.hash.substring(1),
		user = customUser || 'roine',
		lastRepoOverviewMax = 2,
		languagesColor = {
			'javascript':'#F15501',
			'php':'#6E03C1',
			'ruby':'#701516'
		};


	// create a github's style bar
	function createBar(obj, total){
		var key, arr, width;

		// $.each doesn't works, don't know why
		for(key in obj){
			width = (obj[key] * 100) / total;
			$(document.createElement('span'))
			.addClass(key)
			.text(obj[key])
			.appendTo('.meter')
			.animate({'width': width+'%'}, 'slow')
			.css('background-color', languagesColor[key.toLowerCase()]);
		}
	}


	// prettify the space between two date
	function timespace(rawDate){
		var date, seconds, formats, i = 0, f;
        date = new Date(rawDate);
        seconds = (new Date() - date) / 1000;
        formats = [
            [60, 'seconds', 1],
            [120, '1 minute ago'],
            [3600, 'minutes', 60],
            [7200, '1 hour ago'],
            [86400, 'hours', 3600],
            [172800, 'Yesterday'],
            [604800, 'days', 86400],
            [1209600, '1 week ago'],
            [2678400, 'weeks', 604800]
        ];

        while (f = formats[i ++]) {
            if (seconds < f[0]) {
                return f[2] ? Math.floor(seconds / f[2]) + ' ' + f[1] + ' ago' :  f[1];
            }
        }
        return 'A while ago';
	}


	// display an overview of the last updated repositories
	function lastRepoOverview(repo){
		var item = $(document.createElement('li'))
		.text(cleanRepoName(repo.name)+' ('+timespace(repo.updated_at)+')');

		$('.lastRepos').append(item);
	}


	// format the date like following dd mm yyyy, i.e: 18 January 2000
	function formatDate(date){
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


	// translate the boxes using css3 transform
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
			translate = 0,
			sorted;

		if($(that).hasClass('selected')){
			sortDir = (sortDir === 1) ? -1 : 1;
		}

		// remove the bold to all link into sort
		$('.sort a, .details .selected').removeClass('selected');
		// add bold to the current link
		$(that).add('.repos .details .'+sortBy).addClass('selected');

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
		sorted = $('.repo').sort( sortFn );

		$.each(sorted, function(index, elem){
			$(elem).data('translate', [0, translate]);
			translate += $(elem).outerHeight()+margin;
			translateCSS($(elem));
		});
		return false;
	}


	// Fetch the repositories of a user using getJSON
	function getRepos(){
		$.getJSON('https://api.github.com/users/'+user+'/repos?sort='+sort_by+'&callback=?', function (response) {

			var repos = response.data,
				totalRepos = 0,
				heightWrapper = 0,
				languages = [],
				$repo;

			if(repos.message === "Not Found" || !repos.length){
				return;
			}

			$.each(repos, function (index, repo) {
				// only parse the non-forked repositories
				if(!repo.fork) {
					if(index < lastRepoOverviewMax){
						lastRepoOverview(repo);
					}
					if(typeof languages[repo.language] === 'undefined') { languages[repo.language] = 0; } 
						languages[repo.language] += 1;

					$repo = createRepoBox(repo);
					heightWrapper = translateCSS($repo);
					totalRepos += 1;

				}	
			});
			createBar(languages, totalRepos);
			$('.listRepos').css('height', heightWrapper+($('.listRepos .repo:last-child').outerHeight()+margin));
			$('#'+sort_by).add('.details .'+sort_by).addClass('selected');
			$('.card').find('.totalRepos').text(totalRepos);
			
		});
	}


	// Fetch the data about the current user using getJSON
	function getUserInfos(){
		$.getJSON('https://api.github.com/users/'+user+'?callback=?', function (response) {
			var $box = $('.card'),
				info = response.data,
				bio =  info.bio || 'No description yet.',
				created_at = formatDate(info.created_at),
				company = info.company || '';

			$box.find('.name').text(info.name+' AKA ').end()
				.find('.nickname').text(info.login).end()
				.find('.bio').text(bio).end()
				.find('.created').text(created_at).end()
				.find('.company').text(company)
				;

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
