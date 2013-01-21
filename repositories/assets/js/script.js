/*
 * @@helpers 
 * @pluralize //add s at end of word if it count more than 1
 * @canCssTransform // check whether css transform is supported by the current browser
 * @timespace // the space between two dates
 * @formatDate // format the date for human
 * @cleanRepoName //clean the name of the repositories by removing - _
 *
 * @@contentExploit
 * @lastRepo // Display the last updated repositories
 * @createRepoBox // create the html boxes for each repositories
 * @translateBox // translate the boxes using css transform with jQuery animate fallback
 * @createLangBar // create the html bar with all the languages horizontaly stacked
 *
 * @@EventCallback
 * @sort
 *
 * @@Ajax
 * @getRepos
 * @getUser
 *
 */
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
	 * type can be: all, owner, member. 
	 * lastRepoOverviewMax define the max number of repositories to display in overview
	 **********************************************************************************/
	var sort_by = 'updated',
		translate = 0,
		margin = 20,
		sortDir = -1,
		customUser = window.location.hash.substring(1),
		user = customUser || 'roine',
		type = 'owner', 
		lastRepoOverviewMax = 3,
		// https://raw.github.com/doda/github-language-colors/master/colors.json
		languagesColor = {"Arduino": "#bd79d1", "Java": "#b07219", "VHDL": "#543978", "Scala": "#7dd3b0", "Emacs Lisp": "#c065db", "Delphi": "#b0ce4e", "Ada": "#02f88c", "VimL": "#199c4b", "Perl": "#0298c3", "Lua": "#fa1fa1", "Rebol": "#358a5b", "Verilog": "#848bf3", "Factor": "#636746", "Ioke": "#078193", "R": "#198ce7", "Erlang": "#949e0e", "Nu": "#c9df40", "AutoHotkey": "#6594b9", "Clojure": "#db5855", "Shell": "#5861ce", "Assembly": "#a67219", "Parrot": "#f3ca0a", "C#": "#555", "Turing": "#45f715", "AppleScript": "#3581ba", "Eiffel": "#946d57", "Common Lisp": "#3fb68b", "Dart": "#cccccc", "SuperCollider": "#46390b", "CoffeeScript": "#244776", "XQuery": "#2700e2", "Haskell": "#29b544", "Racket": "#ae17ff", "Elixir": "#6e4a7e", "HaXe": "#346d51", "Ruby": "#701516", "Self": "#0579aa", "Fantom": "#dbded5", "Groovy": "#e69f56", "C": "#555", "JavaScript": "#f15501", "D": "#fcd46d", "ooc": "#b0b77e", "C++": "#f34b7d", "Dylan": "#3ebc27", "Nimrod": "#37775b", "Standard ML": "#dc566d", "Objective-C": "#f15501", "Nemerle": "#0d3c6e", "Mirah": "#c7a938", "Boo": "#d4bec1", "Objective-J": "#ff0c5a", "Rust": "#dea584", "Prolog": "#74283c", "Ecl": "#8a1267", "Gosu": "#82937f", "FORTRAN": "#4d41b1", "ColdFusion": "#ed2cd6", "OCaml": "#3be133", "Fancy": "#7b9db4", "Pure Data": "#f15501", "Python": "#3581ba", "Tcl": "#e4cc98", "Arc": "#ca2afe", "Puppet": "#cc5555", "Io": "#a9188d", "Max": "#ce279c", "Go": "#8d04eb", "ASP": "#6a40fd", "Visual Basic": "#945db7", "PHP": "#6e03c1", "Scheme": "#1e4aec", "Vala": "#3581ba", "Smalltalk": "#596706", "Matlab": "#bb92ac"};

	/***********
	 *
	 * Helpers - @@helpers
	 *
	 **********/

	 // proto
	 Object.size = function(obj) {
	    var key,
			size = 0;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) {
				size += size;
	        }
	    }
	    return size;
	};

	// simple pluralize, add s if necessary - @pluralize
	function pluralize(num, str, suggestion){
		if(!suggestion) { suggestion = str+'s'; }
		return (num > 1) ? num+' '+suggestion : num+' '+str;
	}




	// check whether css transform is available - @canCssTransform
	function transformSupport(){
		var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
		el = document.createElement('div'),
		support=0;

		while( support !== true ){
			support = document.createElement('div').style[prefixes[support++]] !== undefined || support;
		}
		return support;
	}


	// prettify the space between two date - @timespace
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


	// format the date like following dd mm yyyy, i.e: 18 January 2000 - @formatDate
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


	// clean the repository name (replace dash and underscores by whitespace) - @cleanRepoName
	function cleanRepoName (str) {
		return  str.replace(/_|-/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');	
	}






	/********************************************************
	 *
	 * The functions below are dependant to the fetched datas - @@contentExploit
	 *
	 ********************************************************/


	// display an overview of the last updated repositories - @lastRepo
	function lastRepoOverview(repo){
		var item = $(document.createElement('li'))
		.html('<a href="'+repo.html_url+'">'+cleanRepoName(repo.name)+'</a> (<a href="'+repo.html_url+'/commits">'+timespace(repo.updated_at)+'</a>)');

		$('.lastRepos').append(item);
	}


	// create the html boxes - @createRepoBox
	function createRepoBox (repo) {
		var homepage = repo.homepage || repo.html_url,

			// main language of the repository
			language = $(document.createElement('div'))
			.addClass('language')
			.text(repo.language)
			.css('background-color', languagesColor[repo.language]),

			// button the summon the details
			more = $(document.createElement('a'))
			.text('More about '+repo.name)
			.css({'margin': '0 auto', 'top': '30px'})
			.data('repo', repo.name)
			.addClass('label label-info more'),

			// left part
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
			.addClass('repo effect1')
			.append(leftMenu)
			.append(more)
			.append(language)
			.appendTo('.listRepos');

		
		repoBox.data('translate', [0, translate]);
		translate += repoBox.outerHeight()+margin;
		return repoBox;
	}


	// translate the boxes using css3 transform @translateBox
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


	// create a github's style bar - @createLangBar
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
				.css('background-color', languagesColor[lang])
				.attr({'data-perc': Math.floor(width), 'data-repos':reposCount})
				.appendTo(container);
			}
		}
		
	}




	/******************
	 *
	 * Event Handlers - @@eventCallback
	 *
	 *****************/


	// click on sort button event handler - @sort
	function sortHandler(){
		var that = this,
			sortBy = $(that).data('sort'),
			translate = 0,
			sorted;

		if($(that).hasClass('selected')){
			sortDir = (sortDir === 1) ? -1 : 1;
		}

		// remove the bold to all link into sort
		$('.sort a, .repo .selected').removeClass('selected');
		// add bold to the current link

		$(that).add('.listRepos .repo .'+sortBy).addClass('selected');

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


	function displayMore(e){
		var repo = $(this).data('repo');
		console.log(getCommits(repo));
	}



	/************
	 *
	 * Ajax calls - @@Ajax
	 *
	 ************/

	function getCommits(repo){

		$.getJSON('https://api.github.com/repos/'+user+'/'+repo+'/commits?per_page=100&callback=?', function (response){
			var commits = response.data,
			meta = response.meta,
			total = Object.size(commits);


			window.c = commits;
			window.m = meta;
			if(commits.message){
				alert(commits.message);
				return;
			}
			else{
				
			}
			
			
		});
	}


	// Fetch the repositories of a user using getJSON - @getRepos
	function getRepos(){
		$.getJSON('https://api.github.com/users/'+user+'/repos?sort='+sort_by+'&type='+type+'&callback=?', function (response) {

			var repos = response.data,
				totalRepos = 0,
				heightWrapper = 0,
				languages = [],
				$repo,
				arRepos = [];

			if(repos.message){
				alert(repos.message);
				return;
			}
			else{
				$.each(repos, function (index, repo) {

				// only parse the non-forked repositories
					if(!repo.fork) {

						arRepos.push(repo.name);

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
							$(this).css('border-bottom', '10px solid '+languagesColor[repo.language]);
						}, function(){
							$(this).css('border-bottom', '');
						});

					}	
				});
				// $('.lastRepos').prepend('Last updated repostories:');
				$('.lastRepos').prepend('<span class="title">Recently Updated</span>');
				createBar(languages, totalRepos, $('.meter'));
				$('.listRepos').css('height', heightWrapper+($('.listRepos .repo:last-child').outerHeight()+margin));
				$('#'+sort_by).add('.details .'+sort_by).addClass('selected');
				if($('.reposCount').length) { 
					$('.reposCount').text(pluralize(totalRepos, 'repository', 'repositories'));
				}
			}
		});
	}

	// Fetch the data about the current user using getJSON - @getUser
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
				bio =  '<span class="about title">About </span>';

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
		$(document).on('click', '.more', displayMore);
	}

	init();
}(jQuery, window));
