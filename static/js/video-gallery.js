const VideoGallery = (function() {
    let animationFrameId = null;

    function syncVideos(videos) {
        const primary = videos[0];
        const others = Array.from(videos).slice(1);
        
        function checkSync() {
            others.forEach(video => {
                const timeDiff = Math.abs(primary.currentTime - video.currentTime);
                if (timeDiff > 0.016) {
                    video.currentTime = primary.currentTime;
                }
            });

            if (!primary.paused && others.every(v => !v.paused)) {
                animationFrameId = requestAnimationFrame(checkSync);
            }
        }

        return checkSync;
    }

    async function playVideos(videos) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        videos.forEach(video => {
            video.currentTime = 0;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('autoplay', '');
        });

        try {
            for (let video of videos) {
                await video.play();
            }

            const checkSync = syncVideos(videos);
            animationFrameId = requestAnimationFrame(checkSync);

            const handleTimeUpdate = function() {
                if (this.currentTime >= this.duration - 0.1) {
                    videos.forEach(v => {
                        v.currentTime = 0;
                        v.play().catch(e => console.log("Replay failed:", e));
                    });
                }
            };

            videos[0].addEventListener('timeupdate', handleTimeUpdate);
        } catch (error) {
            console.log("Playback failed:", error);
            setTimeout(() => playVideos(videos), 100);
        }
    }

    function loadVideos(videos) {
        return Promise.all(
            Array.from(videos).map(video => {
                return new Promise((resolve, reject) => {
                    // For already loaded videos
                    if (video.readyState >= 4) {
                        resolve(video);
                        return;
                    }

                    // For videos that need loading
                    const loadHandler = () => {
                        video.removeEventListener('loadeddata', loadHandler);
                        resolve(video);
                    };
                    video.addEventListener('loadeddata', loadHandler);
                    video.addEventListener('error', (e) => reject(e));
                    
                    // Ensure video starts loading
                    video.load();
                });
            })
        );
    }

    function handleVideoSwitch(galleryId, index) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        const container = document.getElementById(galleryId);
        const videoSets = container.querySelectorAll('.video-single, .video-pair, .video-triple');
        const buttons = container.parentElement.querySelector('.video-gallery-buttons').querySelectorAll('.button');
        
        videoSets.forEach(set => {
            const videos = set.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
                video.currentTime = 0;
                video.replaceWith(video.cloneNode(true));
            });
            set.classList.remove('active');
        });

        buttons.forEach(button => button.classList.remove('is-primary'));
        buttons[index].classList.add('is-primary');

        const selectedSet = videoSets[index];
        selectedSet.classList.add('active');
        const videosToPlay = selectedSet.querySelectorAll('video');

        videosToPlay.forEach(video => {
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('autoplay', '');
        });

        loadVideos(videosToPlay)
            .then(() => {
                playVideos(videosToPlay);
                // Explicitly start playing each video
                videosToPlay.forEach(video => {
                    video.play().catch(e => console.log("Play failed:", e));
                });
            })
            .catch(error => {
                console.error("Error loading videos:", error);
            });
    }

    function initGallery(galleryButtonsId, galleryCarouselId) {
        const container = document.getElementById(galleryCarouselId);

        // Set up button click handlers
        const buttonContainer = document.getElementById(galleryButtonsId);
        buttonContainer.querySelectorAll('.button').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.videoIndex);
                handleVideoSwitch(galleryCarouselId, index);
            });
        });

        // Initialize first active set (either pair or triple)
        const firstActiveSet = container.querySelector('.video-single.active, .video-pair.active, .video-triple.active');
        if (firstActiveSet) {
            const initialVideos = firstActiveSet.querySelectorAll('video');
            
            // Prepare initial videos
            initialVideos.forEach(video => {
                video.muted = true;
                video.playsInline = true;
                video.setAttribute('autoplay', '');
            });

            // Load and play initial videos
            loadVideos(initialVideos)
                .then(() => {
                    playVideos(initialVideos);
                    // Explicitly start playing each video
                    initialVideos.forEach(video => {
                        video.play().catch(e => console.log("Initial play failed:", e));
                    });
                })
                .catch(error => {
                    console.error("Error loading initial videos:", error);
                });
        }
    }

    function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    return {
        init: function() {
            // Initialize both galleries
            initGallery('gallery-buttons-real-scene', 'gallery-carousel-real-scene');
            initGallery('gallery-buttons-dynamic', 'gallery-carousel-dynamic');
            initGallery('gallery-buttons-static', 'gallery-carousel-static');
            initGallery('gallery-buttons-long-term', 'gallery-carousel-long-term');
        },
        cleanup: cleanup
    };
})();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    VideoGallery.init();
});

window.addEventListener('unload', function() {
    VideoGallery.cleanup();
});

// Backup initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    VideoGallery.init();
}