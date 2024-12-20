document.addEventListener('DOMContentLoaded', function() {
    const subfigures = document.getElementsByClassName('subfigure');
    const enlargedFigures = document.getElementsByClassName('enlarged-figure');
    let currentlySelected = null;

    Array.from(subfigures).forEach((subfigure, index) => {
        subfigure.addEventListener('click', function() {
            const enlargedFigure = document.getElementById(`enlarged-figure-${index}`);
            
            // If clicking the same subfigure again
            if (currentlySelected === this) {
                // Hide the enlarged figure
                enlargedFigure.classList.remove('active');
                // Remove the selection border
                this.classList.remove('selected');
                currentlySelected = null;
            } else {
                // Hide all enlarged figures first
                Array.from(enlargedFigures).forEach(fig => {
                    fig.classList.remove('active');
                });
                
                // Remove selection from previously selected subfigure
                if (currentlySelected) {
                    currentlySelected.classList.remove('selected');
                }
                
                // Show the clicked figure's enlarged version
                enlargedFigure.classList.add('active');
                // Add selection border to current subfigure
                this.classList.add('selected');
                currentlySelected = this;
            }
        });
    });
});