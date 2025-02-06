// Lottie animation for checkbox and Strike-through text
// Lottie animation for checkbox and Strike-through text
// Lottie animation for checkbox and Strike-through text

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


// Search functionality
// Search functionality
// Search functionality

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-bar");
    const taskCards = document.querySelectorAll(".task-card");

    searchInput.addEventListener("input", function () {
        let query = searchInput.value.toLowerCase();

        taskCards.forEach(card => {
            let taskText = card.querySelector("p").textContent.toLowerCase();
            if (taskText.includes(query)) {
                card.style.display = "flex"; // Show matching task
            } else {
                card.style.display = "none"; // Hide non-matching tasks
            }
        });
    });
});

// Filter dropdown Button
// Filter dropdown Button
// Filter dropdown Button

document.addEventListener("DOMContentLoaded", function () {
    const filterBtn = document.getElementById("filter-btn");
    const filterDropdownContainer = document.getElementById("filter-dropdown-container");

    filterBtn.addEventListener("click", function () {
        filterDropdownContainer.classList.toggle("active"); // Show/hide dropdown
    });

    // Optional: Hide dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!filterBtn.contains(event.target) && !filterDropdownContainer.contains(event.target)) {
            filterDropdownContainer.classList.remove("active");
        }
    });
});




// Add Task Dropdown
// Add Task Dropdown    
// Add Task Dropdown

document.addEventListener("DOMContentLoaded", function () {
    const addTaskContainer = document.getElementById("add-task-container");
    const addTaskBtn = document.getElementById("add-btn");
    const addTaskDropdown = document.getElementById("add-task-dropdown");

    // Toggle dropdown on click
    addTaskBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents immediate closing
        addTaskContainer.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!addTaskContainer.contains(event.target)) {
            addTaskContainer.classList.remove("active");
        }
    });

    // Placeholder: Handle Task Type Click (Will Later Open Respective Modal)
    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", function () {
            const taskType = this.getAttribute("data-type");
            console.log(`Clicked: ${taskType}`); // Replace with modal logic later
            addTaskContainer.classList.remove("active"); // Close dropdown
        });
    });
});


// Add Habit Modal
// Add Habit Modal
// Add Habit Modal

document.addEventListener("DOMContentLoaded", function () {
    const habitModal = document.getElementById("habit-modal");
    const openHabitBtn = document.querySelector('[data-type="habit"]'); // Button in dropdown
    const closeHabitBtn = document.getElementById("close-habit-modal");
    const cancelHabitBtn = document.getElementById("cancel-habit");
    const createHabitBtn = document.getElementById("create-habit");
    const habitTitleInput = document.getElementById("habit-title");

    // Show Modal
    openHabitBtn.addEventListener("click", function () {
        habitModal.style.display = "flex";
    });

    // Hide Modal
    function closeHabitModal() {
        habitModal.style.display = "none";
    }

    closeHabitBtn.addEventListener("click", closeHabitModal);
    cancelHabitBtn.addEventListener("click", closeHabitModal);

    // Close on outside click
    window.addEventListener("click", function (e) {
        if (e.target === habitModal) {
            closeHabitModal();
        }
    });

    // Enable Create Button Only if Title is Filled
    habitTitleInput.addEventListener("input", function () {
        createHabitBtn.disabled = habitTitleInput.value.trim() === "";
    });
});
