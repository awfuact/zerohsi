const VideoGallery = (function() {
    let animationFrameId = null;

    function syncVideos(videos) {
        const primary = videos[0];
        const secondary = videos[1];
        
        function checkSync() {
            const timeDiff = Math.abs(primary.currentTime - secondary.currentTime);
            
            if (timeDiff > 0.016) {
                secondary.currentTime = primary.currentTime;
            }

            if (!primary.paused && !secondary.paused) {
                animationFrameId = requestAnimationFrame(checkSync);
            }
        }

        return checkSync;
    }

    async function playVideosPair(videos) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        // Prepare videos for autoplay
        videos.forEach(video => {
            video.currentTime = 0;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('autoplay', '');
        });

        try {
            // Force play each video
            for (let video of videos) {
                await video.play();
            }

            // Start sync monitoring
            const checkSync = syncVideos(videos);
            animationFrameId = requestAnimationFrame(checkSync);

            // Set up looping
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
            // Retry playback
            setTimeout(() => playVideosPair(videos), 100);
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
        const pairs = container.querySelectorAll('.video-pair');
        const buttons = container.parentElement.querySelector('.video-gallery-buttons').querySelectorAll('.button');
        
        // Reset all videos
        pairs.forEach(pair => {
            const videos = pair.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
                video.currentTime = 0;
                video.replaceWith(video.cloneNode(true));
            });
            pair.classList.remove('active');
        });

        // Update buttons
        buttons.forEach(button => button.classList.remove('is-primary'));
        buttons[index].classList.add('is-primary');

        // Handle selected pair
        const selectedPair = pairs[index];
        selectedPair.classList.add('active');
        const videosToPlay = selectedPair.querySelectorAll('video');

        // Prepare videos
        videosToPlay.forEach(video => {
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('autoplay', '');
        });

        // Load and play
        loadVideos(videosToPlay)
            .then(() => {
                playVideosPair(videosToPlay);
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

        // Initialize first pair
        const firstPair = container.querySelector('.video-pair.active');
        if (firstPair) {
            const initialVideos = firstPair.querySelectorAll('video');
            
            // Prepare initial videos
            initialVideos.forEach(video => {
                video.muted = true;
                video.playsInline = true;
                video.setAttribute('autoplay', '');
            });

            // Load and play initial videos
            loadVideos(initialVideos)
                .then(() => {
                    playVideosPair(initialVideos);
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
            initGallery('gallery-buttons-real-scene', 'gallery-carousel-real-scene');
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