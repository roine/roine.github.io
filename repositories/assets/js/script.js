
(function ($, window) {

	'use strict';
	/*jslint browser: true*/
	/*global jQuery*/


	/* prototypes */


	/* *********************************************************************************
	 * sort_by to automatically sort at first loading
	 * translate init to 0 for boxes position
	 * margin is the space between the boxes
	 * sortDir is the direction of sorting -1 is for DESC
	 * customUser is the custom user passed in the url hash
	 * user is default user login 'roine'
	 * lastRepoOverviewMax define the max number of repositories to display in overview
	 **********************************************************************************/
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
			'ruby':'#701516',
			'scala':'#7DD3B0',
			'java':'#B07219',
			'c':'#555',
			'shell':'#5861CE',
			'python':'#3581BA',
			'objective-c':'#438EFF'
		};


	/***********
	 *
	 * Helpers
	 *
	 **********/

	// simple pluralize, add s if necessary
	function pluralize(num, str, suggestion){
		if(!suggestion) { suggestion = str+'s'; }
		return (num > 1) ? num+' '+suggestion : num+' '+str;
	}


	// check whether css transform is available
	function transformSupport(){
		var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
		el = document.createElement('div'),
		support=0;

		while( support !== true ){
			support = document.createElement('div').style[prefixes[support++]] !== undefined || support;
		}
		return support;
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
		return  str.replace(/_|-/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');	
	}






	/********************************************************
	 *
	 * The functions below are dependant to the fetched datas
	 *
	 ********************************************************/


	// display an overview of the last updated repositories
	function lastRepoOverview(repo){
		var item = $(document.createElement('li'))
		.text(cleanRepoName(repo.name)+' ('+timespace(repo.updated_at)+')');

		$('.lastRepos').append(item);
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
			data = $repo.data('translate') || [],
			center = Math.floor(($('.listRepos').outerWidth()-$repo.outerWidth())/2);

		if(transformSupport()){
			$.each(vendor, function (i, vendor) {
				$repo.css(vendor+'transform', 'translate('+center+'px,'+data[1]+'px)');
			});
		}
		// fallback jQuery, untested
		else{
			$repo.css('position', 'absolute').animate({'top': data[1]+'px', 'left': center+'px'});
		}
		return data[1];
	}


	// create a github's style bar
	function createBar(obj, total, container){
		var key, arr, width, sorted, lang, reposCount, $bar, sortable = [];
		// sort by most use desc
		for (lang in obj){
			if(obj.hasOwnProperty(lang)){
				sortable.push([lang, obj[lang]]);
			}	
		}
		    
		sorted = sortable.sort(function(a, b){return (a[1]-b[1]) * -1; });

		for(key in sorted){
			if(sorted.hasOwnProperty(key)){ 
				// modify the following data before displaying it
				lang = sorted[key][0];
				reposCount = sorted[key][1];
				width = (reposCount * 100) / total;

				// create the span tag and append meter
				$bar = $(document.createElement('span'))
				.addClass(lang)
				.text(reposCount)
				.animate({'width': width+'%'}, 'slow')
				.css('background-color', languagesColor[lang.toLowerCase()])
				.attr({'data-perc': Math.floor(width), 'data-repos':reposCount})
				.appendTo(container);
			}
		}
		
	}




	/******************
	 *
	 * Event Handlers
	 *
	 *****************/


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

		$(that).add('.listRepos .details .'+sortBy).addClass('selected');

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






	/************
	 *
	 * Ajax calls
	 *
	 ************/


	// Fetch the repositories of a user using getJSON
	function getRepos(){
		$.getJSON('https://api.github.com/users/'+user+'/repos?sort='+sort_by+'&callback=?', function (response) {

			var repos = response.data,
				totalRepos = 0,
				heightWrapper = 0,
				languages = [],
				$repo;

			if(repos.message){
				alert(repos.message);
			}
			else{
				$.each(repos, function (index, repo) {

				// only parse the non-forked repositories
					if(!repo.fork) {

						// take the x last updated repo and display it in an overview
						if(index < lastRepoOverviewMax){
							lastRepoOverview(repo);
						}

						// count each language, populate it like {'javascript':13, 'php': 1}
						if(typeof languages[repo.language] === 'undefined') { languages[repo.language] = 0; } 
							languages[repo.language] += 1;

						// create the boxes for each repostories
						$repo = createRepoBox(repo);

						// translate and return the height
						heightWrapper = translateCSS($repo);
						totalRepos += 1;

						// add some effect to each repo while hovering
						$repo.hover(function(){
							$(this).css('border-bottom', '10px solid '+languagesColor[repo.language.toLowerCase()]);
						}, function(){
							$(this).css('border-bottom', '');
						});

					}	
				});

				createBar(languages, totalRepos, $('.meter'));
				$('.listRepos').css('height', heightWrapper+($('.listRepos .repo:last-child').outerHeight()+margin));
				$('#'+sort_by).add('.details .'+sort_by).addClass('selected');
				if($('.reposCount').length) { 
					$('.reposCount').text(pluralize(totalRepos, 'repository', 'repositories'));
				}
			}
		});
	}

	// Fetch the data about the current user using getJSON
	function getUserInfos(){
		$.getJSON('https://api.github.com/users/'+user+'?callback=?', function (response) {

			if(response.message){
				alert(response.message);
				
			}

			var $box = $('.card'),
				info = response.data,
				custom_bio,
				gravatar_link = 'http://www.gravatar.com/avatar/'+info.gravatar_id+'?s=120',
				picture = $(document.createElement('img')).attr('src', gravatar_link),
				name = info.name || info.login,
				bio =  '<span class="about">About: </span>';

			custom_bio = name;
			custom_bio += (info.location) ? ' is a developer based in '+info.location : '';
			custom_bio += (info.company) ? ' working for '+info.company+'.' : '.';
			custom_bio += '<p>On Github <a href="'+info.html_url+'" target=_blank>'+name+'</a> has <span class="reposCount">'+pluralize(info.public_repos,'repository', 'repositories')+'</span>';
			custom_bio += ' and is followed by '+pluralize(info.followers, 'user')+'.';
			custom_bio += (info.blog) ? ' You could find furthermore informations on his/her blog, <a href="'+info.blog+'" target=_blank>'+info.blog+'</a>' : '';
			custom_bio += (info.blog && info.email) ? ' or by emailing him/her directly <a href="mailto:'+info.email+'">'+info.email+'</a>.</p>' : '';
			custom_bio += (!info.blog && info.email) ? ' You could send him an email for further informations, <a href="mailto:'+info.email+'">'+info.email+'</a>.</p>' : '</p>';
			custom_bio += (info.hireable) ? '<p>And the good news is that he is up to be hired.</p>' : '';

			bio += info.bio || custom_bio;
			$box.find('.name').text(info.name).end()
				.find('.nickname').text(info.login).end()
				.find('.bio').html(bio).end()
				.find('.picture').append(picture)
				;
			$('.preload').removeClass('preload');
		});
	}


	// constructor
	function init(){

		// to remove after dev @remove
		var colorz = ['blue', 'red', 'orange'],
			i = 0;
		$('.help .button').click(function(){
			if(++i === colorz.length){
				i = 0;
			}
			// cache the selected button
			var $selected = $('.selected');
			$('.btn').removeClass().addClass('btn '+colorz[i]);
			$selected.addClass('selected');
			return false;
		});


		// fetch the informations about the user
		getUserInfos();

		// fetch the repositories of the user
		getRepos();
		
		// event Listeners
		$('.sort').on('click', 'a', sortHandler);
		
	}

	init();
}(jQuery, window));
