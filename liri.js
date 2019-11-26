require("dotenv").config();

var inquirer = require("inquirer");
var axios = require("axios");
var moment = require('moment');
var fs = require("fs");

var formatLoc = (...input) => {

    let str = input[0];
    for (let i = 1; i < input.length; i++) {
        if (input[i] !== "") { str += ", " + input[i] }
    }
    return str;
};

var formatSrchStr = (str) => {

    let formattedStr = "";

    formattedStr = str.trim();
    formattedStr = str.replace(/ /g, "+");

    return formattedStr;
}


var toTitleCase = (str) => {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}



function printData(data) {

    console.log(data)
    fs.appendFile("log.txt", data + "\n", function (err) {

        if (err) {
            return console.log(err);
        }
    });
}



function getConcertData(artist) {

    //format user artist string for searching
    const formattedArtist = formatSrchStr(artist)


    axios.get("https://rest.bandsintown.com/artists/" + formattedArtist + "/events?app_id=codingbootcamp").then(
        function (response) {


            const data = response.data

            //if returned object is empty, no shows are coming up
            if (Object.keys(data).length === 0) {
                console.log(`
                *************************************************
                No upcoming shows for ${artist} could be found. 
                *************************************************
                `)
            }
            else {

                let count = 1;

                //Loop through each concert instance and print the information
                for (key in data) {
                    let venueInfo = data[key].venue;

                    let output = `---------------------------------------\n`;
                    output += `Artist:         ${toTitleCase(artist)}\n`;
                    output += `Venue Name:     ${venueInfo.name}\n`;
                    output += `Venue Location: ${formatLoc(venueInfo.city, venueInfo.region, venueInfo.country)}\n`;
                    output += `Date:           ${moment(data[key].datetime).format("MM/DD/YYYY")}`;

                    printData(output)

                    if (count >= 10) {
                        break;
                    }
                    count++
                }
            };
        })
        .catch(function () {
            // handle error
            console.log(`
            *************************************************
            Artist by the name of ${artist} could not be found. 
            Please check your input and try again.
            *************************************************
            `)
        })
}





function getSongData(songName) {
    console.log('spotify-this-song')
    var Spotify = require('node-spotify-api');
    var keys = require("./keys.js");
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret
    });

    spotify
        .search({
            type: 'track',
            query: songName,
            limit: 1
        })
        .then(function (response) {

            const tracks = response.tracks.items;

            for (key in tracks) {
                let myTrk = tracks[key]
                let output = `---------------------------------------\n`;
                output += `Artist:         ${myTrk.artists[0].name}\n`;
                output += `Track Name:     ${myTrk.name}\n`;
                if(myTrk.preview_url !== null){
                    output += `Preview URL:    ${myTrk.preview_url}\n`;
                }
                output += `Album:          ${myTrk.album.name}`;

                printData(output)
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}





function getMovieData(movieTitle) {

    const searchableTitle = formatSrchStr(movieTitle)

    axios.get("http://www.omdbapi.com/?t=" + searchableTitle + "&y=&plot=short&apikey=trilogy").then(
        function (response) {
            const data = response.data

            let output = `---------------------------------------\n`;
            output += `Title: ${data.Title}\n`;
            output += `Release Year: ${data.Year}\n`;
            output += `IMDB: ${data.Ratings[0].Value}\n`;
            output += `Rotten Tomatoes: ${data.Ratings[1].Value}\n`;
            output += `Country produced: ${data.Country}\n`;
            output += `Language: ${data.Language}\n`;
            output += `Plot: ${data.Plot}\n`;
            output += `Actors: ${data.Actors}`;

            printData(output)
        })
        .catch(function (err) {
            console.log(err)
        })
}




inquirer.prompt({
    type: 'list',
    message: 'Select a function',
    choices: [`concert-this`, `spotify-this-song`, `movie-this`, `do-what-it-says`],
    name: "mode"
})
    .then(function (response) {
        switch (response.mode) {


            // User selected concert-this
            case `concert-this`:
                inquirer.prompt({
                    type: 'input',
                    message: 'Input the artist you would like to search.',
                    name: "artist",
                    default: "Celine Dion"
                })
                    .then((response) => {
                        let artist = response.artist
                        if (artist === "") {
                            artist = "Celine Dion"
                        }
                        getConcertData(artist)
                    })
                break;


            //User selected spotify-this-song
            case `spotify-this-song`:
                inquirer.prompt({
                    type: 'input',
                    message: 'Input the song name you would like to search.',
                    name: "songName",
                    default: "All the small things"
                })
                    .then((response) => getSongData(response.songName))
                break;

            case `movie-this`:
                inquirer.prompt({
                    type: 'input',
                    default: 'Mr. Nobody',
                    message: 'What is movie title for which you would like to search?',
                    name: 'movieTitle'
                })
                    .then(function (inqFilmTitle) {
                        getMovieData(inqFilmTitle.movieTitle)
                    });
                break;

            case `do-what-it-says`:
                fs.readFile("random.txt", "utf8", function (err, data) {

                    const input = data.split(",");
                    const mode = input[0];
                    const val = input[1];

                    switch (mode) {
                        case `concert-this`:
                            getConcertData(val)
                            break;
                        case `spotify-this-song`:
                            getSongData(val)
                            break;
                        case `movie-this`:
                            getMovieData(val)
                            break;
                    }

                    if (err) {
                        return console.log(err);
                    }
                })
                break;
        }
    })