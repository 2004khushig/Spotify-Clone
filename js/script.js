// console.log("This is js");
let songs;
let currFolder;
let currentSong = new Audio();
let currentSongIndex = 0;
function convertToMMSS(input) {
    // Parse the input to get total seconds
    const totalSeconds = Math.floor(Number(input));

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
// async function playSongs(folder) {
//     currFolder = folder;
//     let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
//     let text = await response.text();
//     let div = document.createElement("div");
//     div.innerHTML = text;
//     let as = div.getElementsByTagName("a");
//     songs = [];
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split(`/${folder}/`)[1]);
//         }
//     }
//     let songUL = document.querySelector(".songList ul");
//     songUL.innerHTML=""
//     for (const song of songs) {
//         songUL.innerHTML += ` <li>
//                             <img class="invert"src ="music.svg" alt="">
//                             <div class="info">
//                                 <div>${decodeURIComponent(song.split('/').pop())}</div>
//                                 <div>Arijit Singh</div>
//                             </div>
//                             <div class="playNow">
//                                 <img class ="invert" src="play.svg" alt="">
//                             </div>
//                         </li> `;
//     }
//     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
//         e.addEventListener("click", element => {
//             console.log(e.querySelector(".info").firstElementChild.innerHTML)
//             playMusic(e.querySelector(".info").firstElementChild.innerHTML)

//         })
//     })

// }
async function playSongs(folder) {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    songs.forEach((song, index) => {
        // Decode the URI to remove URL encoding (like %20) and remove the `.mp3` extension
        const songName = decodeURIComponent(song).replace(/\.mp3$/, '');

        songUL.innerHTML += ` 
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${songName}</div> <!-- Display the clean song name -->
                    
                </div>
                <div class="playNow">
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li> 
        `;
    });


    // Add click event listener to each song item to play it
    Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]); // Use `songs[index]` to play the correct track
        });
    });
}

const playMusic = (track) => {
    // Set currentSongIndex based on the track passed to the function
    currentSongIndex = songs.indexOf(track);

    if (currentSongIndex === -1) {
        return;
    }

    // Format the song name: remove `.mp3` and decode any URI encoding (e.g., %20 to space)
    const songName = decodeURIComponent(track.replace(/\.mp3$/, ''));

    // Play the selected track
    currentSong.src = `/${currFolder}/` + track;
    currentSong.play();
    play.src = "pause.svg";

    // Display cleaned-up song name on the play bar
    document.querySelector(".songInfo").innerHTML = songName;
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
    let response = await fetch(`http://127.0.0.1:5500/songs/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let e of anchors) {
        if (e.href.includes("/songs")) {
            const pathParts = e.href.split("/");
            const folderName = pathParts[pathParts.length - 1];

            if (folderName !== "songs") {
                let folderResponse = await fetch(`http://127.0.0.1:5500/songs/${folderName}/info.json`);
                let folderData = await folderResponse.json();

                // Add album card to container
                cardContainer.innerHTML += `
                    <div data-folder="${folderName}" class="card">
                        <img src="songs/${folderName}/cover.jpg" alt="${folderData.title}">
                        <div class="play">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" fill="#000000" />
                            </svg>
                        </div>
                        <h3>${folderData.title}</h3>
                        <p>${folderData.Description}</p>
                    </div>`;
            }
        }
    }

    // Attach click event listeners to all album cards once they are loaded
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (event) => {
            let folder = event.currentTarget.getAttribute("data-folder");
            await playSongs(`songs/${folder}`);
        });
    });
}



async function main() {

    await playSongs("songs/cs");
    // console.log("Songs:", songs);


    //display all albums
    displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })


    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${convertToMMSS(currentSong.currentTime)}/${convertToMMSS(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 95 + "%";
    })
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 95;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 95
    })
    let audio = new Audio(songs[4]);
    // audio.play();    

    audio.addEventListener("loadeddata", () => {
        // console.log(audio.duration, audio.currentSrc, audio.currentTime);
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    previous.addEventListener("click", () => {
        // Adjust the currentSongIndex for the previous song
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playMusic(songs[currentSongIndex]);
    });
    next.addEventListener("click", () => {
        // Adjust the currentSongIndex for the next song
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playMusic(songs[currentSongIndex]);
    });
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })

    
    document.querySelector(".volume>img").addEventListener("click", e => {
        // console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
        }
    });
    
}

main();




