require("dotenv").config();

var inquirer = require("inquirer");
var axios = require("axios");
var moment = require('moment');
var fs = require("fs");

var formatLoc = (city, region, country) => {
    let str = "";
    if (city.trim() !== "") {
        str = city;
    };
    if (region.trim() !== "") {
        str += `, ${region}`;
    };
    if (country.trim() !== "") {
        str += `, ${country}`;
    };
    return str;
};

var formatSrchStr = (str) => {

    let formattedStr = "";

    formattedStr = str.trim();
    formattedStr = str.replace(/ /g, "+");

    return formattedStr;
}



function printConcertData(artist) {

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
                    console.log(`---------------------------------------`);
                    console.log(`Venue Name:     ${venueInfo.name}`);
                    console.log(`Venue Location: ${formatLoc(venueInfo.city, venueInfo.region, venueInfo.country)}`);
                    console.log(`Date:           ${moment(data[key].datetime).format("MM/DD/YYYY")}`);

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





function printSongData(songName) {
    console.log('spotify-this-song')
    var Spotify = require('node-spotify-api');
    var keys = require("./keys.js");
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret
    });

    spotify
        .search({ type: 'track', query: songName, limit: 1 })

        // .request('https://api.spotify.com/v1/tracks/7yCPwWs66K8Ba5lFuU2bcx')
        .then(function (response) {

            const tracks = response.tracks.items

            for (key in tracks) {
                console.log(`-----------------------------------`)
                console.log(`Artist:     ${tracks[key].artists[0].name}`)
                console.log(`Track Name: ${tracks[key].name}`)
                console.log(`Preview URL:${tracks[key].preview_url}`)
                console.log(`Album:      ${tracks[key].album.name}`)
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}





function printMovieData(movieTitle) {
    console.log(movieTitle)
    const searchableTitle = formatSrchStr(movieTitle)
    console.log(searchableTitle)

    axios.get("http://www.omdbapi.com/?t=" + searchableTitle + "&y=&plot=short&apikey=trilogy").then(
        function (response) {
            const data = response.data
            console.log(`-----------------------------------`)
            console.log(`Title: ${data.Title}`)
            console.log(`Release Year: ${data.Year}`)
            console.log(`IMDB: ${data.Ratings[0].Value}`)
            console.log(`Rotten Tomatoes: ${data.Ratings[1].Value}`)
            console.log(`Country produced: ${data.Country}`)
            console.log(`Language: ${data.Language}`)
            console.log(`Plot: ${data.Plot}`)
            console.log(`Actors: ${data.Actors}`)
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
                        printConcertData(artist)
                    })
                break;


            //User selected spotify-this-song
            case `spotify-this-song`:
                inquirer.prompt({
                    type: 'input',
                    message: 'Input the song name you would like to search.',
                    name: "songName"
                })
                    .then((response) => printSongData(response.songName))
                break;

            case `movie-this`:
                inquirer.prompt({
                    type: 'input',
                    default: 'Mr. Nobody',
                    message: 'What is movie title for which you would like to search?',
                    name: 'movieTitle'
                })
                    .then(function (inqFilmTitle) {
                        printMovieData(inqFilmTitle.movieTitle)
                    });
                break;

            case `do-what-it-says`:
                fs.readFile("random.txt", "utf8", function (err, data) {

                    const input = data.split(",");
                    const mode = input[0];
                    const val = input[1];

                    switch (mode) {
                        case `concert-this`:
                            printConcertData(val)
                            break;
                        case `spotify-this-song`:
                            printSongData(val)
                            break;
                        case `movie-this`:
                            printMovieData(val)
                            break;
                    }

                    if (err) {
                        return console.log(err);
                    }
                })
                break;
        }
    })