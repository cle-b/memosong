
function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function shuffle2(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

boxstatus = {
	unknown : 0,
	playing : 1,
	previousplaying : 2,
	found : 3
};

function playpreview(player, track) {
	
    player.setAttribute('src', track.preview);	
	player.pause();
	player.play();
}

function stoppreview(player) {
	
	player.pause();
}

selectsquare = function (event) {

	updatememo(checkerboard, this.getAttribute("track-id"));
}

function cleanmemo(memo) {
	var audioplayer = document.getElementById("audioplayer");

	stoppreview(audioplayer,memo);

	if (memo.first_choice != -1) {
		if (memo.second_choice == -1) {
			memo.tracks[memo.first_choice].status = boxstatus.previousplaying;
		} else {
			memo.tracks[memo.first_choice].status = boxstatus.unknown;
			memo.tracks[memo.second_choice].status = boxstatus.unknown;

			memo.first_choice = -1;
			memo.second_choice = -1;
		}
	}

	refreshcheckerboard(memo);
}


function updatememo(memo, new_choice) {
	var audioplayer = document.getElementById("audioplayer");
	var trackduration = -1;
	if (memo.tracks[new_choice].status == boxstatus.unknown) {
		
		clearTimeout(memo.timeout_id);

		if (memo.first_choice == -1) {
			memo.first_choice = new_choice;
			memo.tracks[memo.first_choice].status = boxstatus.playing;
			playpreview(audioplayer, memo.tracks[memo.first_choice],memo);
			trackduration = 8000;
		} else {
			if (memo.second_choice == -1) {
				memo.second_choice = new_choice;

				if (memo.tracks[memo.first_choice].song_id == memo.tracks[memo.second_choice].song_id) {
					memo.tracks[memo.first_choice].status = boxstatus.found;
					memo.tracks[memo.second_choice].status = boxstatus.found;
					playpreview(audioplayer, memo.tracks[memo.second_choice],null);
					trackduration = 10000;
					memo.first_choice = -1;
					memo.second_choice = -1;
					memo.remains -= 1;
					memo.score += 10;
	                print_score(checkerboard);					
				} else {
					memo.tracks[memo.first_choice].status = boxstatus.previousplaying;
					memo.tracks[memo.second_choice].status = boxstatus.playing;
					playpreview(audioplayer, memo.tracks[memo.second_choice],memo);
					trackduration = 8000;
					memo.score = memo.score < 1 ? 0 : memo.score-1;					
	                print_score(checkerboard);						
				}
			} else {
				memo.tracks[memo.first_choice].status = boxstatus.unknown;
				memo.tracks[memo.second_choice].status = boxstatus.unknown;
				memo.first_choice = new_choice;
				memo.second_choice = -1;
				memo.tracks[memo.first_choice].status = boxstatus.playing;
				playpreview(audioplayer, memo.tracks[memo.first_choice],memo);
				trackduration = 8000;
			}
		}

		refreshcheckerboard(memo);

		if (memo.remains == 0) {
			document.getElementById("congrats_center").style.display = 'block';
		}
		
		if (trackduration > 0) {
			memo.timeout_id = setTimeout(cleanmemo, trackduration, memo);
		}
		
		print_score(memo);
	}
}

function createcheckerboard(checkerboard) {

    var modeltile = document.getElementById("model-tile").innerHTML;
	
	var tracks = document.getElementsByClassName("track");	
	
	var emptytile = "<div class='tile track-unknown'>" + modeltile + "</div>";
	
	for (var i=0; i < tracks.length; i++)
	{
	    tracks[i].innerHTML = emptytile;
		tracks[i].style.opacity = "0.3";
	}
	
	tracks = document.getElementsByClassName("track lvl" + level);
	
	for (var i = 0; i < checkerboard.tracks.length; i++) {

		tracks[i].setAttribute("track-id", i);
		
		tracks[i].addEventListener("click", selectsquare.bind(tracks[i]), false);
		
		checkerboard.tracks[i].tag = tracks[i];
		
		var newtile = "<div class='tile track-unknown'>" + modeltile.replace('src=""','src="' + checkerboard.tracks[i].cover + '"' ) + "</div>";
		
		checkerboard.tracks[i].tag.innerHTML = newtile;
		
		checkerboard.tracks[i].tag.style.opacity = "1";
	}
}

function refreshcheckerboard(checkerboard) {
	for (i = 0; i < checkerboard.tracks.length; i++) {
		var track = checkerboard.tracks[i];

		switch (track.status) {
		case boxstatus.unknown:
			track.tag.firstChild.className = "tile track-unknown";
			break;			
		case boxstatus.playing:
			track.tag.firstChild.className = "tile track-playing";
			break;			
		case boxstatus.previousplaying:
			track.tag.firstChild.className = "tile track-previousplaying";
			break;			
		case boxstatus.found:
			track.tag.firstChild.className = "tile track-found";
			break;			
		default:
			break;
		}
	}
}

function onloadplaylist(result) {
	var deezerpl = result;

	hiddendiv = document.getElementById("hidden");
	
    maxtrack = document.getElementsByClassName("track lvl" + level).length / 2;

	// create list of songs
	checkerboard = {
		tracks : [],
		first_choice : -1,
		second_choice : -1,
		timeout_id : null,
		remains : maxtrack,
		score : 0
	};
	
	availabletracks = [];

	for (var i = 0; i < deezerpl.tracks["data"].length; i++) {
	    if (deezerpl.tracks["data"][i].readable)
		{
	        availabletracks.push(deezerpl.tracks["data"][i]);
		}
    };	
	
    shuffle(availabletracks);
		
	for (var i = 0; i < maxtrack; i++) {		
		for (var k = 0; k < 2; k++){
		    checkerboard.tracks[checkerboard.tracks.length] = {
			    id : checkerboard.tracks.length,
		    	song_id : i,
			    preview : availabletracks[i]["preview"],
				cover : availabletracks[i]["album"]["cover"],
				status : boxstatus.unknown,
				tag : null
			};		
		}
		
		
		newmp3 = '<source src="' + availabletracks[i]["preview"] + '" type="audio/mpeg"></source>'+document.getElementById("audioplayer").innerHTML;
	
		document.getElementById("audioplayer").innerHTML = newmp3;		
	}

	// and sort it (x3 ?)

	shuffle(checkerboard.tracks);
	shuffle2(checkerboard.tracks);
	shuffle(checkerboard.tracks);	

	createcheckerboard(checkerboard);
	refreshcheckerboard(checkerboard);

	print_score(checkerboard);
}

function pad (str, max) {
  return str.length < max ? pad("0" + str, max) : str;
}

function print_score(checkerboard) {
	document.getElementById("score").getElementsByTagName("textPath")[0].textContent = pad ( checkerboard.score.toString(), 3);
}

function user_playlists(playlists)
{
    theme = { playlists : [], current : 0};

	for (var i = 0; i < playlists.data.length; i++) {
	    if (! playlists.data[i].is_loved_track)
		{
	        theme.playlists.push({title:playlists.data[i].title,
		                          id:playlists.data[i].id,
            					  picture:playlists.data[i].picture_big });
		}
    };
}

function update_theme(th)
{
	theme.current = (theme.current + th + theme.playlists.length) % theme.playlists.length;

    document.getElementById("theme_playlist").src = theme.playlists[theme.current].picture;		
}


function playmemo(level)
{
    document.location = "memo.htm#id=" + theme.playlists[theme.current].id + "&level=" + level;
}
