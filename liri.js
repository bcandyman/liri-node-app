require("dotenv").config();
var inquirer = require("inquirer");

inquirer.prompt({
    type: 'list',
    message: 'Select a function',
    choices: [`concert-this`, `spotify-this-song`, `movie-this`, `do-what-it-says`],
    name: "mode"
})
    .then(function (inquirerResponse) {
        var axios = require("axios")

        switch (inquirerResponse.mode) {
            case `concert-this`:
                console.log('concert-this')
                axios.get("https://rest.bandsintown.com/artists/celine+dion/events?app_id=codingbootcamp").then(
                    function (response) {
                        const data = response.data
                        const buildLocStr = (city, region, country) => {
                            let str = "";
                            if (city.trim() !== "") {
                                str = city
                            }
                            if (region.trim() !== "") {
                                str += `, ${region}`
                            }
                            if (country.trim() !== "") {
                                str += `, ${country}`
                            }
                            return str
                        }


                        for (key in data) {
                            let showInfo = data[key]
                            console.log(`---------------------------------------`)
                            console.log(`Venue Name:     ${showInfo.venue.name}`)
                            console.log(`Venue Location: ${buildLocStr(showInfo.venue.city, showInfo.venue.region, showInfo.venue.country)}`)
                            console.log(`Date:           ${data[key].datetime}`)
                        }
                    })
                break;

            case `spotify-this-song`:
                console.log('spotify-this-song')
                var Spotify = require('node-spotify-api');
                var keys = require("./keys.js");
                var spotify = new Spotify({
                    id: keys.spotify.id,
                    secret: keys.spotify.secret
                });

                spotify
                    .search({ type: 'track', query: 'Welcome to the jungle' })
                    .then(function (response) {
                        // console.log((JSON.stringify(response)))
                        // console.log((response.tracks.items[1]))
                        console.log(`-----------------------------------`)
                        console.log(`Artist:     ${response.tracks.items[0].artists[0].name}`)
                        console.log(`Track Name: ${response.tracks.items[0].name}`)
                        console.log(`URL:        ${response.tracks.items[0].external_urls.spotify}`)
                        console.log(`Album:      ${response.tracks.items[0].album.name}`)
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                break;

            case `movie-this`:
                inquirer.prompt({
                    type: 'input',
                    default: 'Mr. Nobody',
                    message: 'What is movie title for which you would like to search?',
                    name: 'movieTitle'
                })
                    .then(function (inqFilmTitle) {

                        const srchStr = (title) => {
                            title = title.trim()
                            title = title.replace(" ", "+")
                            return title
                        }
                        const usrFilmTitle = inqFilmTitle.movieTitle
                        const searchableTitle = srchStr(usrFilmTitle)

                        axios.get("http://www.omdbapi.com/?t=" + searchableTitle + "&y=&plot=short&apikey=trilogy").then(
                            function (response) {
                                const data = response.data
                                console.log(`Title: ${data.Title}`)
                                console.log(`Release Year: ${data.Year}`)
                                console.log(`IMDB: ${data.Ratings[0].Value}`)
                                console.log(`Rotten Tomatoes: ${data.Ratings[1].Value}`)
                                console.log(`Country produced: ${data.Country}`)
                                console.log(`Language: ${data.Language}`)
                                console.log(`Plot: ${data.Plot}`)
                                console.log(`Actors: ${data.Actors}`)
                            })
                    });
                break;

            case `do-what-it-says`:
                console.log('do-what-it-says')
                break;
        }





    })