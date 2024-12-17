const VideoGallery = (function() {
    function handleVideoSwitch(galleryId, index) {
        const container = document.getElementById(galleryId);
        const items = container.querySelectorAll('.video-gallery-item');
        const buttons = container.parentElement.querySelector('.video-gallery-buttons').querySelectorAll('.button');
        const videos = container.querySelectorAll('.video-gallery-item video');
        const descriptions = container.querySelectorAll('.video-description');
        
        // Update items
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
                const video = item.querySelector('video');
                video.currentTime = 0;
                video.muted = true;
                video.play().catch(error => {
                    console.log("Autoplay was prevented:", error);
                });
            } else {
                item.classList.remove('active');
                const video = item.querySelector('video');
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Update buttons
        buttons.forEach(button => button.classList.remove('is-primary'));
        buttons[index].classList.add('is-primary');

        // Update descriptions
        descriptions.forEach((desc, i) => {
            if (i === index) {
                desc.classList.add('active');
            } else {
                desc.classList.remove('active');
            }
        });
    }

    function initGallery(galleryButtonsId, galleryCarouselId) {
        // Ensure all videos are loaded and ready
        const container = document.getElementById(galleryCarouselId);
        const videos = container.querySelectorAll('.video-gallery-item video');
        videos.forEach(video => {
            video.load();
            video.muted = true;
        });

        // Set up button click handlers
        const buttonContainer = document.getElementById(galleryButtonsId);
        buttonContainer.querySelectorAll('.button').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.videoIndex);
                handleVideoSwitch(galleryCarouselId, index);
            });
        });

        // Play the first video
        const firstVideo = container.querySelector('.video-gallery-item.active video');
        if (firstVideo) {
            firstVideo.muted = true;
            firstVideo.play().catch(error => {
                console.log("Initial autoplay was prevented:", error);
            });
        }
    }

    return {
        init: function() {
            // Initialize real scene gallery
            initGallery('gallery-buttons-real-scene', 'gallery-carousel-real-scene');
            
            // Initialize dynamic scenario gallery
            initGallery('gallery-buttons-dynamic', 'gallery-carousel-dynamic');

            // Initialize static scenario gallery
            initGallery('gallery-buttons-static', 'gallery-carousel-static');
        }
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    VideoGallery.init();
});