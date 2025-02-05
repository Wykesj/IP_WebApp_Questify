document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".checkbox-container").forEach((container) => {
        // Ensure the container and its parent hide overflow
        container.style.overflow = "hidden";
        container.parentElement.style.overflow = "hidden"; // Ensure the parent container hides overflow

        let animation = lottie.loadAnimation({
            container: container, // Target div
            renderer: "svg",
            loop: false,
            autoplay: false,
            path: "../assets/lotties/Checkbox.json", // Path to Lottie file
            rendererSettings: {
                scaleMode: 'noScale', // Prevents distortion
            }
        });

        // Apply transform to scale the animation
        animation.addEventListener("DOMLoaded", function () {
            container.style.transform = "scale(2.2)"; // Adjust the scale here
        });

        let isChecked = false; // Track state

        container.addEventListener("click", function () {
            if (!isChecked) {
                animation.playSegments([0, 47], true); // Play check animation
                this.parentElement.querySelector("p").classList.add("task-completed"); // Add strike-through to text
            } else {
                animation.playSegments([100, 145], true); // Play uncheck animation
                this.parentElement.querySelector("p").classList.remove("task-completed"); // Remove strike-through from text
            }
            isChecked = !isChecked; // Toggle state
        });
    });
});
