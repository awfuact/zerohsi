document.addEventListener('DOMContentLoaded', function() {
    const subfigures = document.getElementsByClassName('subfigure');
    const enlargedFigures = document.getElementsByClassName('enlarged-figure');
    let currentlySelected = null;

    Array.from(subfigures).forEach((subfigure, index) => {
        // Add hover effect
        subfigure.addEventListener('mouseenter', function() {
            if (this !== currentlySelected) {
                this.style.transform = 'scale(0.98)';
            }
        });

        subfigure.addEventListener('mouseleave', function() {
            if (this !== currentlySelected) {
                this.style.transform = 'scale(1)';
            }
        });

        subfigure.addEventListener('click', function() {
            const enlargedFigure = document.getElementById(`enlarged-figure-${index}`);
            
            // Remove all active classes first
            Array.from(enlargedFigures).forEach(fig => {
                fig.style.display = 'none';
                fig.classList.remove('active');
            });

            // Remove selection from previously selected subfigure
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
                currentlySelected.style.transform = 'scale(1)';
                currentlySelected.style.padding = '3px';
            }

            // If clicking the same subfigure again
            if (currentlySelected === this) {
                currentlySelected = null;
            } else {
                // Show the clicked figure's enlarged version
                enlargedFigure.style.display = 'block';
                enlargedFigure.classList.add('active');
                // Add selection border and keep scale
                this.classList.add('selected');
                this.style.transform = 'scale(0.98)';
                this.style.padding = '0';
                currentlySelected = this;
            }
        });
    });
});