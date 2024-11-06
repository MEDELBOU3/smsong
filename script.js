       function scrollToTop() {
          window.scrollTo({
            top: 0,
            behavior: 'smooth' // لتنعيم التمرير
          });
        }

            function getQueryParams() {
                const params = {};
                let e, r = /([^&;=]+)=?([^&;]*)/g,
                    q = window.location.search.substring(1);
                while (e = r.exec(q)) {
                    params[e[1]] = decodeURIComponent(e[2]);
                }
                return params;
            }
    
            const params = getQueryParams();
    
            if (params.access_token) {
                fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${params.access_token}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    document.getElementById('user-info').innerText = `Logged in as ${data.display_name}`;
                    // يمكنك الآن استخدام التوكن للوصول إلى Spotify API
                });
            } else {
                document.getElementById('user-info').innerText = 'Error: No access token found';
            }
    

        const burger = document.querySelector('.burger');
        const navLinks = document.querySelector('.nav-links');

        burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('toggle');
       });
        
      
        //building tools
        const clientId = '31f25c15fa8a4c4a845595ffbcb2d076';
        const clientSecret = 'b6d93473aaeb4079aadbd1973854ec9f';
        let accessToken = '';
        let currentTrackIndex = 0;
        let playlistData = [];
        let popularSongsData = [];
        let genresData = [];
        let currentGenre = '';
        let searchResultsData = [];
        let playlistOffset = 0;
        let currentAudio; // Initialize the Howler object
        const playlistLimit = 15;
        
        async function getAccessToken() {
            const result = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });
            const data = await result.json();
            accessToken = data.access_token;
        }
        
        async function fetchData(endpoint) {
            const result = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + accessToken }
            });
            return result.json();
        }
        
        async function loadPlaylist() {
            const data = await fetchData(`playlists/37i9dQZF1DXcBWIGoYBM5M/tracks?offset=${playlistOffset}&limit=${playlistLimit}`);
            playlistData = playlistData.concat(data.items);
            const playlist = document.getElementById('playlist');
            playlist.innerHTML += data.items.map((item, index) => `
                <li onclick="playTrack(${playlistOffset + index}, 'playlist')">
                    <img src="${item.track.album.images[0].url}" alt="${item.track.name}" style=" outline: 2px solid rgba(0, 0, 0, 0.1);">
                    ${item.track.name} - ${item.track.artists[0].name}
                    <button style=" background-color: transparent; paddig-left:10px; outline: ; border: none; "><i style="font-size: 25px; color: #fff;"class="fas fa-play"></i></button>
                </li>
            `).join('');
            playlistOffset += playlistLimit;
            //7ydha
            if (data.items.length < playlistLimit) {
                document.getElementById('load-more-playlist').style.display = 'none';
            }
        }
        
        async function fetchLyrics(track) {
            const searchUrl = `https://api.lyrics.ovh/v1/${track.artists[0].name}/${track.name}`;
            
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (data.lyrics) {
                const lyrics = data.lyrics.split('\n');
                displayLyrics(lyrics);
            } else {
                document.getElementById('lyrics-content').innerText = 'Lyrics not found.';
            }
        }
        
        function displayLyrics(lyrics) {
            const lyricsContainer = document.getElementById('lyrics-content');
            lyricsContainer.innerHTML = '';
            lyrics.forEach(line => {
                const p = document.createElement('p');
                p.innerText = line;
                lyricsContainer.appendChild(p);
            });
        }
        
        
        
        
        //*mbdla*
        function playTrack(index, type) {
            let track;
            if (type === 'playlist') {
                track = playlistData[index].track;
            } else if (type === 'popular') {
                track = popularSongsData[index].track;
            } else if (type === 'genre') {
                track = genresData[index].track;
            } else if (type === 'search') {
                track = searchResultsData[index];
            } else if (type === 'album') {
                track = albumsData[index].track;
            } else if (type === 'recommended') {
                track = recommendedTracks[index].track;
            } 
        
            currentTrackId = track.id;
            document.getElementById('current-track-title').innerText = track.name;
            document.getElementById('current-track-artist').innerText = track.artists[0].name;
        
            const audioPlayer = document.getElementById('audio-player');
            const audioSource = document.getElementById('audio-source');
            const header = document.getElementById('header');
            
            audioSource.src = track.preview_url || '';
            header.style.backgroundImage = `url(${track.album.images[0].url})`;
        
            if (audioSource.src) {
                audioPlayer.load();
                audioPlayer.play();
            }
        
            // تحديد الأغنية الحالية في القائمة
            const playlistItems = document.querySelectorAll('#playlist li');
            playlistItems.forEach(item => item.classList.remove('playing'));
            playlistItems[index].classList.add('playing');
        
            initializeTrackData(track.id);
            fetchLyrics(track);
        
            
        }
        
        
        
        // مشاركة الأغاني
        function shareTrack(url) {
            const shareText = `Check out this song: ${url}`;
            if (navigator.share) {
                navigator.share({
                    title: 'Spotify Song',
                    text: shareText,
                    url: url,
                });
            } else {
                prompt('Copy this link to share:', url);
            }
        }
        
        function shareTrack() {
            const trackUrl = `https://open.spotify.com/track/${currentTrackId}`;
            const songLinkInput = document.getElementById('song-link');
            songLinkInput.value = trackUrl;
        
            const twitterLink = document.getElementById('twitter');
            twitterLink.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(trackUrl)}&text=Check out this song!`;
        
            const facebookLink = document.getElementById('facebook');
            facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackUrl)}`;
        
            const whatsappLink = document.getElementById('whatsapp');
            whatsappLink.href = `https://api.whatsapp.com/send?text=Check out this song! ${encodeURIComponent(trackUrl)}`;
        
            const instagramLink = document.getElementById('instagram');
            instagramLink.href = `https://www.instagram.com/?url=${encodeURIComponent(trackUrl)}`;
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const shareBtn = document.querySelector('.share-btn');
            const shareCard = document.querySelector('.share-card');
            const closeBtn = document.querySelector('.close-btn');
            const copyLinkBtn = document.getElementById('copy-link-btn');
        
            shareBtn.addEventListener('click', () => {
                shareTrack();
                shareCard.classList.toggle('active');
            });
        
            closeBtn.addEventListener('click', () => {
                shareCard.classList.remove('active');
            });
        
            copyLinkBtn.addEventListener('click', () => {
                const songLinkInput = document.getElementById('song-link');
                songLinkInput.select();
                document.execCommand('copy');
                alert('Link copied to clipboard!');
            });
        });
        
        
        
        //Recommended Tracks
        let recommendedTracks = [];
        
        async function loadRecommendedMusic() {
            const seedTracks = [...likedTracks].slice(0, 5).join(','); // استخدام الأغاني المحبوبة كعينة
            const data = await fetchData(`recommendations?seed_tracks=${seedTracks}`);
            recommendedTracks = data.tracks;
        
            const recommendedContainer = document.getElementById('recommended-music');
            recommendedContainer.innerHTML = recommendedTracks.map((track, index) => `
                <div class="song-item">
                    <img src="${track.album.images[0].url}" alt="${track.name}">
                    <p>${track.name}</p>
                    <button onclick="playTrack(${index}, 'recommended');" style="background-color: transparent; outline: none; border: none;">
                        <i style="font-size: 25px; color: #fff;" class="fas fa-play"></i>
                    </button>
                    <button class="like-btn-recommended-${index}" onclick="likeTrack(${index}, 'recommended'); event.stopPropagation();" style="background-color: transparent; outline: none; border: none;">
                        <i style="font-size: 25px; color: ${likedTracks.has(track.id) ? 'green' : 'white'};" class="fas fa-heart"></i>
                    </button>
                </div>
            `).join('');
        }
        
        
        
        
        
        // Event listeners for next and previous buttons
        document.getElementById('next-btn').addEventListener('click', playNextTrack);
        document.getElementById('prev-btn').addEventListener('click', playPrevTrack);
        document.getElementById('load-more-playlist').addEventListener('click', loadPlaylist);
        
        document.getElementById('search-btn').addEventListener('click', () => {
            const query = document.getElementById('search-input').value;
            searchTracks(query);
        });
        
        document.getElementById('play-btn').addEventListener('click', () => {
            if (currentAudio) {
                currentAudio.play();
            }
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            if (currentAudio) {
                currentAudio.pause();
            }
        });
        
        
        
        
        
        function playNextTrack() {
            do {
                currentTrackIndex = (currentTrackIndex + 1) % playlistData.length;
            } while (!playlistData[currentTrackIndex].track.preview_url);
            playTrack(currentTrackIndex, 'playlist');
        }
        
        function playPrevTrack() {
            do {
                currentTrackIndex = (currentTrackIndex - 1 + playlistData.length) % playlistData.length;
            } while (!playlistData[currentTrackIndex].track.preview_url);
            playTrack(currentTrackIndex, 'playlist');
        }
        
        
        
        async function loadPopularSongs() {
            const data = await fetchData('playlists/37i9dQZF1DXcBWIGoYBM5M/tracks');
            popularSongsData = data.items;
            const popularSongs = document.getElementById('popular-songs');
            popularSongs.innerHTML = popularSongsData.map((item, index) => `
                <div class="song-item">
                    <img src="${item.track.album.images[0].url}" alt="${item.track.name}">
                    <p>${item.track.name}</p>
                    <button onclick="playTrack(${index}, 'popular');" style="background-color: transparent; outline: none; border: none; display: flex;">
                        <i style="font-size: 25px; color: #fff;" class="fas fa-play"></i>
                    </button>
                    <button onclick="likeTrack(${index}, 'popular'); event.stopPropagation();" style="background-color: transparent; outline: none; border: none; align-items: flex-end;  justify-items: end;">
                        <i style="font-size: 25px; color: #fff;" class="fas fa-heart"></i>
                    </button>
                </div>
            `).join('');
        }
        
        
        
        
        
        
        
        
        async function loadPopularArtists() {
            const data = await fetchData('artists?ids=1vCWHaC5f2uS3yhpwWbIA6,7H55rcKCfwqkyDFH9wpKM6,3TVXtAsR1Inumwj472S9r4,66CXWjxzNUsdJxJ2JdwvnR');
            const popularArtists = document.getElementById('popular-artists');
            popularArtists.innerHTML = data.artists.map(artist => `
                <div class="artist-item">
                    <img src="${artist.images[0].url}" alt="${artist.name}">
                    <p>${artist.name}</p>
                </div>
            `).join('');
        }
        
        async function loadGenres() {
            const data = await fetchData('browse/categories');
            genresData = data.categories.items;
            const genres = document.getElementById('genres');
            genres.innerHTML = genresData.map((item, index) => `
                <div class="genre-item" onclick="loadGenreSongs('${item.id}')">
                    <img src="${item.icons[0].url}" alt="${item.name}" style=" display= flex;">
                    <p>${item.name}</p>
                </div>
            `).join('');
        }
        
        
        
        async function loadGenreSongs(genreId) {
            currentGenre = genreId;
            const data = await fetchData(`browse/categories/${genreId}/playlists`);
            const playlists = data.playlists.items;
            if (playlists.length > 0) {
                const genrePlaylistId = playlists[0].id;
                const genrePlaylistData = await fetchData(`playlists/${genrePlaylistId}/tracks`);
                genresData = genrePlaylistData.items;
                const popularSongs = document.getElementById('popular-songs');
                popularSongs.innerHTML = genresData.map((item, index) => `
                    <div class="song-item">
                        <img src="${item.track.album.images[0].url}" alt="${item.track.name}">
                        <p>${item.track.name}</p>
                        <button onclick="playTrack(${index}, 'genre');" style="background-color: transparent; outline: none; border: none;">
                            <i style="font-size: 25px; color: #fff;" class="fas fa-play"></i>
                        </button>
                        <button class="like-btn-genre-${index}" onclick="likeTrack(${index}, 'genre'); event.stopPropagation();" style="background-color: transparent; outline: none; border: none;">
                            <i style="font-size: 25px; color: ${likedTracks.has(item.track.id) ? 'green' : 'white'};" class="fas fa-heart"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
        
        
        
        
        function updateLikeButton(index, type, trackId) {
            const likeButton = document.querySelector(`.like-btn-${type}-${index}`);
            if (likeButton) {
                if (likedTracks.has(trackId)) {
                    likeButton.querySelector('i').style.color = 'green';
                } else {
                    likeButton.querySelector('i').style.color = 'white';
                }
            }
        }
        
        
        
        
        
        async function searchTracks(query) {
            const data = await fetchData(`search?q=${query}&type=track`);
            searchResultsData = data.tracks.items;
            const searchResultsContainer = document.getElementById('popular-songs');
            searchResultsContainer.innerHTML = searchResultsData.map((item, index) => `
                <div class="song-item">
                    <img src="${item.album.images[0].url}" alt="${item.name}">
                    <p>${item.name}</p>
                    <button onclick="playTrack(${index}, 'search');" style="background-color: transparent; outline: none; border: none;">
                        <i style="font-size: 25px; color: #fff;" class="fas fa-play"></i>
                    </button>
                    <button class="like-btn-search-${index}" onclick="likeTrack(${index}, 'search'); event.stopPropagation();" style="background-color: transparent; outline: none; border: none;">
                        <i style="font-size: 25px; color: ${likedTracks.has(item.id) ? 'green' : 'white'};" class="fas fa-heart"></i>
                    </button>
                </div>
            `).join('');
        
              
        }
        
        
        
        
        document.getElementById('next-btn').addEventListener('click', playNextTrack);
        document.getElementById('prev-btn').addEventListener('click', playPrevTrack);
        document.getElementById('load-more-playlist').addEventListener('click', loadPlaylist);
        
        document.getElementById('search-btn').addEventListener('click', () => {
            const query = document.getElementById('search-input').value;
            searchTracks(query);
        });
        
        document.getElementById('play-btn').addEventListener('click', () => {
            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.play();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.pause();
        });
        
        
        
        
        //laode albums
        async function loadAlbums() {
            const data = await fetchData('browse/new-releases');
            const albumsData = data.albums.items;
            const albums = document.getElementById('albums');
            albums.innerHTML = albumsData.map((item, index) => `
                <div class="album-item" onclick="loadAlbumTracks('${item.id}')">
                    <img src="${item.images[0].url}" alt="${item.name}">
                    <p>${item.name} - ${item.artists[0].name}</p>
                    <button onclick="likeTrack(${index}, 'album'); event.stopPropagation();" style="background-color: transparent; outline: none; border: none;">
                        <i style="font-size: 25px; color: #fff;" class="fas fa-heart"></i>
                    </button>
                </div>
            `).join('');
        }
        
        
        
        
        async function loadAlbumTracks(albumId) {
            const data = await fetchData(`albums/${albumId}/tracks`);
            const albumTracksData = data.items;
            const popularSongs = document.getElementById('popular-songs');
            popularSongs.innerHTML = albumTracksData.map((item, index) => `
                <div class="song-item" onclick="playTrack(${index}, 'album', '${albumId}')">
                    <img src="${item.album.images[0].url}" alt="${item.name}">
                    <p>${item.name}</p>
                </div>
            `).join('');
        }
        
        
        
        
        
        
        
        window.onload = async () => {
            await getAccessToken();
            await loadPlaylist();
            await loadPopularSongs();
            await loadPopularArtists();
            await loadGenres();
            await loadAlbums();
        }
        
        //reaction
        
        async function loadPlaylist() {
            const data = await fetchData(`playlists/37i9dQZF1DXcBWIGoYBM5M/tracks?offset=${playlistOffset}&limit=${playlistLimit}`);
            playlistData = playlistData.concat(data.items);
            const playlist = document.getElementById('playlist');
            playlist.innerHTML += data.items.map((item, index) => `
                <li onclick="playTrack(${playlistOffset + index}, 'playlist')">
                    <img src="${item.track.album.images[0].url}" alt="${item.track.name}" style="outline: 2px solid rgba(0, 0, 0, 0.1);">
                    ${item.track.name} - ${item.track.artists[0].name}
                    <button style="background-color: transparent; padding-left:10px; outline: none; border: none;">
                        <i style="font-size: 25px; color: #fff; righ: 5px;" class="fas fa-play"></i>
                    </button>
                    <button class="like-btn-playlist-${playlistOffset + index}" onclick="likeTrack(${playlistOffset + index}, 'playlist'); event.stopPropagation();" style="background-color: transparent; padding-left:10px; outline: none; border: none;">
                        <i style=" right: 5px;  font-size: 25px; color: ${likedTracks.has(item.track.id) ? 'green' : 'white'};" class="fas fa-heart"></i>
                    </button>
                </li>
            `).join('');
            playlistOffset += playlistLimit;
            if (data.items.length < playlistLimit) {
                document.getElementById('load-more-playlist').style.display = 'none';
            }
        }
        
        
        
        
        let currentTrackId = '';
        let likedTracks = new Set(JSON.parse(localStorage.getItem('likedTracks')) || {});
        let ratings = JSON.parse(localStorage.getItem('ratings')) || {};
        let comments = JSON.parse(localStorage.getItem('comments')) || {};
        
        // Load and display comments for the current track
        function loadComments() {
            const commentsList = document.getElementById('comments-list');
            const trackComments = comments[currentTrackId] || [];
            commentsList.innerHTML = trackComments.map(comment => `
                <div class="comment" style="background-color: #3838389a; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                    <p style=" margin-bottom: 10px; ">${comment.text}</p>
                    <small style=" font-size: 14px;" >${comment.date}</small>
                </div>
            `).join('');
        }
        
        // Event listener for submitting a comment
        document.getElementById('submit-comment').addEventListener('click', () => {
            const commentInput = document.getElementById('comment-input');
            const commentText = commentInput.value.trim();
            if (commentText) {
                const comment = {
                    text: commentText,
                    date: new Date().toLocaleString()
                };
                commentInput.value = '';
                saveComment(comment);
            }
        });
        
        // Save a new comment for the current track
        function saveComment(comment) {
            if (!comments[currentTrackId]) {
                comments[currentTrackId] = [];
            }
            comments[currentTrackId].push(comment);
            localStorage.setItem('comments', JSON.stringify(comments));
            loadComments();
        }
        
        // Initialize comments and ratings sections for the current track
        function initializeTrackData(trackId) {
            currentTrackId = trackId;
            loadComments();
            loadRating();
        }
        
        // Load and display average rating for the current track
        function loadRating() {
            const trackRatings = ratings[currentTrackId] || [];
            const total = trackRatings.reduce((acc, rating) => acc + rating, 0);
            const average = trackRatings.length ? (total / trackRatings.length).toFixed(1) : 0;
            document.getElementById('average-rating').innerText = `Average Rating: ${average}`;
        }
        
        // Save a new rating for the current track
        function saveRating(rating) {
            if (!ratings[currentTrackId]) {
                ratings[currentTrackId] = [];
            }
            ratings[currentTrackId].push(rating);
            localStorage.setItem('ratings', JSON.stringify(ratings));
            loadRating();
        }
        
        // Event listeners for rating stars
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (event) => {
                const rating = parseInt(event.target.getAttribute('data-value'));
                saveRating(rating);
            });
        });
        
        // Update the like button color based on track id
        function updateLikeButton(index, type, trackId) {
            const likeButton = document.querySelector(`.like-btn-${type}-${index}`);
            if (likeButton) {
                if (likedTracks.has(trackId)) {
                    likeButton.querySelector('i').style.color = 'green';
                } else {
                    likeButton.querySelector('i').style.color = 'white';
                }
            }
        }
        
        // Handle like button color change and save
        function likeTrack(index, type) {
            let track;
            if (type === 'playlist') {
                track = playlistData[index].track;
            } else if (type === 'popular') {
                track = popularSongsData[index].track;
            } else if (type === 'genre') {
                track = genresData[index].track;
            } else if (type === 'search') {
                track = searchResultsData[index];
            } else if (type === 'recommended') {
                track = recommendedTracks[index];
            }
        
            if (likedTracks.has(track.id)) {
                likedTracks.delete(track.id);
                alert(`Unliked: ${track.name} by ${track.artists[0].name}`);
            } else {
                likedTracks.add(track.id);
                alert(`Liked: ${track.name} by ${track.artists[0].name}`);
            }
        
            localStorage.setItem('likedTracks', JSON.stringify([...likedTracks]));
            updateLikeButton(index, type, track.id);
        }
        
        //-------New-Extensions---------
        
        //1)-storable
        let sortable = new Sortable(document.getElementById('playlist'), {
            animation: 150,
            onEnd: function (evt) {
              const oldIndex = evt.oldIndex;
              const newIndex = evt.newIndex;
          
              // إعادة ترتيب playlistData بناءً على الترتيب الجديد
              const movedItem = playlistData.splice(oldIndex, 1)[0];
              playlistData.splice(newIndex, 0, movedItem);
            }
          });
        
        
        //2)-Virtual Rooms
        
        document.getElementById('create-room').addEventListener('click', createRoom);
        document.getElementById('send-message').addEventListener('click', sendMessage);
        document.getElementById('start-call').addEventListener('click', startCall);
        document.getElementById('share-screen').addEventListener('click', shareScreen);
        document.getElementById('end-call').addEventListener('click', endCall);
        document.getElementById('start-voice-chat').addEventListener('click', startVoiceChat);
        document.getElementById('avatar-select').addEventListener('change', function() {
            const selectedAvatar = this.value;
            localStorage.setItem('userAvatar', selectedAvatar);
        });
        
        
        
        // Updating background on click
        const backgroundOptions = document.querySelectorAll('.background-option');
        backgroundOptions.forEach(option => {
            option.addEventListener('click', function() {
                const selectedBackground = this.getAttribute('data-background');
                const chatSection = document.querySelector('.chat-section');
                chatSection.style.backgroundImage = `url(${selectedBackground})`;
                chatSection.style.backgroundSize = 'cover';
                chatSection.style.backgroundRepeat = 'no-repeat';
                chatSection.style.backgroundPosition = 'center';
                localStorage.setItem('chatBackground', selectedBackground);
            });
        });
        
        let rooms = {};
        let currentRoom = '';
        let localStream;
        let peerConnection;
        
        const configuration = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        };
        
        function createRoom() {
            const roomName = document.getElementById('room-name').value;
            if (roomName && !rooms[roomName]) {
                rooms[roomName] = [];
                document.getElementById('rooms').innerHTML += `<li onclick="joinRoom('${roomName}')">${roomName}</li>`;
                document.getElementById('room-name').value = '';
            }
        }
        
        function joinRoom(roomName) {
            currentRoom = roomName;
            document.getElementById('chat-room-name').innerText = roomName;
            document.getElementById('chat-room').classList.remove('hidden');
            loadMessages();
        }
        
        
        
        
        
        
        
        document.addEventListener('DOMContentLoaded', function() {
            const selectedAvatar = localStorage.getItem('userAvatar');
            if (selectedAvatar) {
                document.getElementById('avatar-select').value = selectedAvatar;
            }
        });
        
        
        //send Media
        document.getElementById('send-media').addEventListener('click', sendMedia);
        
        function sendMedia() {
            const mediaInput = document.getElementById('media-input');
            const file = mediaInput.files[0];
            const avatarUrl = localStorage.getItem('userAvatar') || "avatar.png";
            const time = new Date().toLocaleTimeString();
        
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    let messageType = 'image';
                    if (file.type.startsWith('video/')) {
                        messageType = 'video';
                    }
        
                    rooms[currentRoom].push({
                        type: messageType,
                        content: e.target.result,
                        avatar: avatarUrl,
                        time: time
                    });
                    mediaInput.value = '';
                    loadMessages();
                };
                reader.readAsDataURL(file);
            }
        }
        
        
        //Send Messages
        document.getElementById('send-message').addEventListener('click', sendMessage);
        
        function sendMessage() {
            const messageInput = document.getElementById('message-input');
            const avatarUrl = localStorage.getItem('userAvatar') || "avatar.png";
            const time = new Date().toLocaleTimeString();
        
            const message = messageInput.value.trim();
            if (message) {
                rooms[currentRoom].push({
                    type: 'text',
                    content: message,
                    avatar: avatarUrl,
                    time: time
                });
                messageInput.value = '';
                loadMessages();
            }
        }
        
        
        
        //LoadMessages
        function loadMessages() {
            const messages = rooms[currentRoom];
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '';
            messages.forEach(message => {
                let messageContent = '';
                if (message.type === 'image') {
                    messageContent = `<img src="${message.content}" alt="image" class="message-image" onclick="openImage('${message.content}')">`;
                } else if (message.type === 'video') {
                    messageContent = `<video src="${message.content}" controls class="message-video"></video>`;
                } else {
                    messageContent = `<p>${message.content}</p>`;
                }
                messagesContainer.innerHTML += `
                    <div class="message">
                        <img src="${message.avatar}" alt="avatar" class="avatar">
                        <div class="message-content">
                            ${messageContent}
                            <small>${message.time}</small>
                        </div>
                    </div>
                `;
            });
        }
        
        function openImage(src) {
            const imageWindow = window.open("", "_blank");
            imageWindow.document.write(`<img src="${src}" style="width: 100%">`);
        }
        
        
        
        
        function startCall() {
            document.getElementById('video-section').classList.remove('hidden');
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    localStream = stream;
                    document.getElementById('local-video').srcObject = stream;
                    setupPeerConnection();
                })
                .catch(error => console.error('Error accessing media devices.', error));
        }
        
        function setupPeerConnection(audioOnly = false) {
            peerConnection = new RTCPeerConnection(configuration);
            peerConnection.onicecandidate = handleIceCandidate;
            peerConnection.ontrack = handleRemoteStream;
        
            if (audioOnly) {
                localStream.getAudioTracks().forEach(track => peerConnection.addTrack(track, localStream));
            } else {
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            }
        
            createOffer();
        }
        
        function handleIceCandidate(event) {
            if (event.candidate) {
                sendMessageToServer({
                    type: 'candidate',
                    candidate: event.candidate
                });
            }
        }
        
        function createOffer() {
            peerConnection.createOffer()
                .then(offer => peerConnection.setLocalDescription(offer))
                .then(() => sendMessageToServer({
                    type: 'offer',
                    offer: peerConnection.localDescription
                }))
                .catch(error => console.error('Error creating offer.', error));
        }
        
        function createAnswer() {
            peerConnection.createAnswer()
                .then(answer => peerConnection.setLocalDescription(answer))
                .then(() => sendMessageToServer({
                    type: 'answer',
                    answer: peerConnection.localDescription
                }))
                .catch(error => console.error('Error creating answer.', error));
        }
        
        function handleOffer(offer) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => createAnswer())
                .catch(error => console.error('Error handling offer.', error));
        }
        
        function handleAnswer(answer) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                .catch(error => console.error('Error handling answer.', error));
        }
        
        function handleCandidate(candidate) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(error => console.error('Error handling candidate.', error));
        }
        
        function shareScreen() {
            navigator.mediaDevices.getDisplayMedia({ video: true })
                .then(screenStream => {
                    const screenTrack = screenStream.getVideoTracks()[0];
                    localStream.getVideoTracks()[0].stop();
                    localStream.removeTrack(localStream.getVideoTracks()[0]);
                    localStream.addTrack(screenTrack);
                    peerConnection.addTrack(screenTrack, localStream);
        
                    screenTrack.onended = () => {
                        localStream.getTracks().forEach(track => track.stop());
                        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                            .then(newStream => {
                                localStream = newStream;
                                document.getElementById('local-video').srcObject = newStream;
                                newStream.getTracks().forEach(track => peerConnection.addTrack(track, newStream));
                            })
                            .catch(error => console.error('Error re-accessing media devices.', error));
                    };
                })
                .catch(error => console.error('Error sharing screen.', error));
        }
        
        function endCall() {
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            document.getElementById('video-section').classList.add('hidden');
        }
        
        function sendMessageToServer(message) {
            // Placeholder function to be implemented
        }
        
        // Load the saved background when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            const savedBackground = localStorage.getItem('chatBackground');
            if (savedBackground) {
                document.querySelector('.chat-section').style.backgroundImage = `url(${savedBackground})`;
            }
        });
        
        // Updating avatar on selection
        document.getElementById('avatar-select').addEventListener('change', function() {
            const selectedAvatar = this.value;
            document.getElementById('selected-avatar').src = selectedAvatar;
        });
        
        // Sending message with avatar
        document.getElementById('send-message').addEventListener('click', function() {
            const messageInput = document.getElementById('message-input');
            const messageText = messageInput.value.trim();
            if (messageText !== '') {
                const selectedAvatar = document.getElementById('avatar-select').value;
                const messagesContainer = document.getElementById('messages');
                const messageElement = document.createElement('p');
                const avatarImage = document.createElement('img');
                avatarImage.src = selectedAvatar;
                messageElement.appendChild(avatarImage);
                messageElement.appendChild(document.createTextNode(messageText));
                messagesContainer.appendChild(messageElement);
                messageInput.value = '';
            }
        });
        
        function startVoiceChat() {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    localStream = stream;
                    setupPeerConnection(true);
                })
                .catch(error => console.error('Error accessing media devices.', error));
        }
        
        function handleRemoteStream(event) {
            const remoteStream = new MediaStream();
            event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
            if (remoteStream.getVideoTracks().length) {
                document.getElementById('remote-video').srcObject = remoteStream;
            } else {
                const audioElement = document.createElement('audio');
                audioElement.srcObject = remoteStream;
                audioElement.autoplay = true;
                document.getElementById('chat-room').appendChild(audioElement);
            }
        }
        
        // Event listener to initialize track data on page load
        document.addEventListener('DOMContentLoaded', async () => {
            await getAccessToken();
            loadPlaylist();
            loadPopularSongs();
            loadPopularArtists();
            loadRecommendedMusic(); // Load recommended music
        });
