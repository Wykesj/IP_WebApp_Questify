document.addEventListener("DOMContentLoaded", async function () {
    // ✅ Initialize Supabase
    const SUPABASE_URL = "https://ficxsnnbjzskugtblrfw.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpY3hzbm5ianpza3VndGJscmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTIzODksImV4cCI6MjA1NDM4ODM4OX0.BcwzBOYhxIj-kbpnpRGp-1Ekf4tjpiFoVfKOujbhFfM";
    
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        const { data, error } = await supabaseClient.from("tasks").select("*").limit(1); 
        if (error) throw error;
        console.log("✅ Supabase connected successfully:", data);
    } catch (err) {
        console.error("❌ Supabase connection failed:", err.message);
    }


    // Load Tasks from Supabase
    async function loadTasks() {
        try {
            const { data: tasks, error } = await supabaseClient.from("tasks").select("*");
            if (error) throw error;
    
            console.log("📥 Loaded tasks from Supabase:", tasks);
            tasks.forEach(addTaskToDOM);
        } catch (err) {
            console.error("❌ Failed to load tasks:", err.message);
        }
    }
    
    // Call loadTasks when the page loads
    document.addEventListener("DOMContentLoaded", loadTasks);
    

    // Save Task to Supabase
    async function saveTask(taskData) {
        try {
            console.log("📤 Attempting to insert task into Supabase:", taskData); // Debugging log
    
            const { data, error } = await supabaseClient.from("tasks").insert([taskData]);
    
            if (error) {
                console.error("❌ Supabase Error:", error);
                alert("Failed to add task: " + error.message);
                return false;
            }
    
            console.log("✅ Task successfully added:", data);
            return true;
        } catch (err) {
            console.error("❌ Unexpected error:", err);
            alert("An unexpected error occurred.");
            return false;
        }
    } 

    function addTaskToDOM(task) {
        let taskContainer;
    
        if (task.type === "habit") {
            taskContainer = document.querySelector("#habits .task-list");
        } else if (task.type === "daily") {
            taskContainer = document.querySelector("#dailies .task-list");
        } else {
            taskContainer = document.querySelector("#todos .task-list");
        }
    
        if (!taskContainer) {
            console.error("❌ Task container not found.");
            return;
        }
    
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");
    
        if (task.type === "habit") {
            taskCard.innerHTML = `
                <button class="habit-btn habit-plus"><i class="fa-solid fa-plus"></i></button>
                <p>${task.title}</p>
                <button class="habit-btn habit-minus"><i class="fa-solid fa-minus"></i></button>
            `;
        } else {
            const taskId = `task-${Date.now()}`;
            taskCard.innerHTML = `
                <div class="checkbox-container" data-task-id="${taskId}"></div>
                <p>${task.title}</p>
            `;
            
            // ✅ Initialize Lottie Animation for the new checkbox
            setTimeout(() => {
                let container = taskCard.querySelector(".checkbox-container");
                let animation = lottie.loadAnimation({
                    container: container,
                    renderer: "svg",
                    loop: false,
                    autoplay: false,
                    path: "../assets/lotties/Checkbox.json"
                });
    
                // ✅ Apply the same resizing logic used in initial script
                animation.addEventListener("DOMLoaded", function () {
                    container.style.transform = "scale(2.2)"; // Ensure it scales like others
                    container.parentElement.style.overflow = "hidden";
                });
    
                let isChecked = false;
                container.addEventListener("click", function () {
                    if (!isChecked) {
                        animation.playSegments([0, 47], true);
                        this.parentElement.querySelector("p").classList.add("task-completed");
                    } else {
                        animation.playSegments([100, 145], true);
                        this.parentElement.querySelector("p").classList.remove("task-completed");
                    }
                    isChecked = !isChecked;
                });
            }, 100); // Delay ensures element exists before initializing Lottie
        }
    
        taskContainer.appendChild(taskCard);
    
        console.log("✅ Task added to DOM with Lottie and Resizing:", task);
    }
    
    

    // 5. Initialize
    loadTasks();

    // ✅ Lottie Animation for Checkbox
    document.querySelectorAll(".checkbox-container").forEach((container) => {
        container.style.overflow = "hidden";
        container.parentElement.style.overflow = "hidden";

        let animation = lottie.loadAnimation({
            container: container,
            renderer: "svg",
            loop: false,
            autoplay: false,
            path: "../assets/lotties/Checkbox.json",
            rendererSettings: { scaleMode: 'noScale' }
        });

        animation.addEventListener("DOMLoaded", function () {
            container.style.transform = "scale(2.2)";
        });

        let isChecked = false;
        container.addEventListener("click", function () {
            if (!isChecked) {
                animation.playSegments([0, 47], true);
                this.parentElement.querySelector("p").classList.add("task-completed");
            } else {
                animation.playSegments([100, 145], true);
                this.parentElement.querySelector("p").classList.remove("task-completed");
            }
            isChecked = !isChecked;
        });
    });

    // ✅ Search Functionality
    const searchInput = document.getElementById("search-bar");
    const taskCards = document.querySelectorAll(".task-card");

    searchInput.addEventListener("input", function () {
        let query = searchInput.value.toLowerCase();
        taskCards.forEach(card => {
            card.style.display = card.querySelector("p").textContent.toLowerCase().includes(query) ? "flex" : "none";
        });
    });

    // ✅ Filter Dropdown
    const filterBtn = document.getElementById("filter-btn");
    const filterDropdownContainer = document.getElementById("filter-dropdown-container");

    filterBtn.addEventListener("click", () => filterDropdownContainer.classList.toggle("active"));

    document.addEventListener("click", (event) => {
        if (!filterBtn.contains(event.target) && !filterDropdownContainer.contains(event.target)) {
            filterDropdownContainer.classList.remove("active");
        }
    });

    // ✅ Add Task Dropdown
    const addTaskContainer = document.getElementById("add-task-container");
    const addTaskBtn = document.getElementById("add-btn");

    addTaskBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        addTaskContainer.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
        if (!addTaskContainer.contains(event.target)) {
            addTaskContainer.classList.remove("active");
        }
    });

    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", function () {
            console.log(`Clicked: ${this.getAttribute("data-type")}`);
            addTaskContainer.classList.remove("active");
        });
    });

    // ✅ Modal Management 
    function setupModal(openBtnSelector, modalSelector, closeBtnSelector, cancelBtnSelector, inputSelector, createBtnSelector) {
        const modal = document.getElementById(modalSelector);
        const openBtn = document.querySelector(`[data-type="${openBtnSelector}"]`);
        const closeBtn = document.getElementById(closeBtnSelector);
        const cancelBtn = document.getElementById(cancelBtnSelector);
        const createBtn = document.getElementById(createBtnSelector);
        const titleInput = document.getElementById(inputSelector);

        openBtn.addEventListener("click", () => modal.style.display = "flex");
        [closeBtn, cancelBtn].forEach(btn => btn.addEventListener("click", () => modal.style.display = "none"));

        window.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });

        titleInput.addEventListener("input", () => {
            createBtn.disabled = titleInput.value.trim() === "";
        });
    }

    // ✅ Setup Modals
    setupModal("habit", "habit-modal", "close-habit-modal", "cancel-habit", "habit-title", "create-habit");
    setupModal("daily", "daily-modal", "close-daily-modal", "cancel-daily", "daily-title", "create-daily");
    setupModal("todo", "todo-modal", "close-todo-modal", "cancel-todo", "todo-title", "create-todo");

    // ✅ Add Event Listeners for Task Creation
    document.getElementById("create-habit").addEventListener("click", () => handleTaskSubmission("habit"));
    document.getElementById("create-daily").addEventListener("click", () => handleTaskSubmission("daily"));
    document.getElementById("create-todo").addEventListener("click", () => handleTaskSubmission("todo"));


    // Add closeModal function here
    function closeModal(type) {
        const modal = document.getElementById(`${type}-modal`);
        if (modal) {
            modal.style.display = "none"; // Hide modal instantly
        }
    }


    // ✅ Handle Task Submission
    async function handleTaskSubmission(type) {
        const titleInput = document.getElementById(`${type}-title`).value.trim();
        const notesInput = document.getElementById(`${type}-notes`)?.value.trim() || "";
        const difficultyElement = document.getElementById(`${type}-difficulty`);
        const difficultyInput = difficultyElement ? difficultyElement.value : "easy";
        const strengthElement = document.getElementById(`${type}-strength`);
        const strengthInput = strengthElement ? strengthElement.value : "weak";
        const filtersElement = document.getElementById(`${type}-filters`);
        const filtersInput = filtersElement ? filtersElement.value : "";
    
        if (!titleInput) {
            alert("Please enter a task title.");
            return;
        }
    
        const newTask = {
            title: titleInput,
            notes: notesInput,
            type: type,
            difficulty: difficultyInput,
            strength: strengthInput,
            filters: filtersInput,
            created_at: new Date().toISOString(),
        };
    
        console.log("📤 Sending task to Supabase:", newTask);
        const success = await saveTask(newTask);
    
        if (success) {
            closeModal(type);
            addTaskToDOM(newTask); // ✅ Add task to the UI instantly
            playSuccessAnimation();
        }
    }



    // ✅ Success Animation
    function playSuccessAnimation() {
        const animationContainer = document.getElementById("success-animation-container");
        const overlay = document.getElementById("success-overlay");
    
        // Show the overlay and animation
        overlay.style.display = "block";
        animationContainer.style.display = "block";
    
        // Load the Lottie animation
        let animation = lottie.loadAnimation({
            container: document.getElementById("success-animation"),
            renderer: "svg",
            loop: false,
            autoplay: true,
            path: "../assets/lotties/success.json",
            rendererSettings: {
                preserveAspectRatio: "xMidYMid meet"
            }
        });
    
        // Hide animation and overlay after 2 seconds
        setTimeout(() => {
            animationContainer.style.display = "none";
            overlay.style.display = "none";
            window.location.reload(); // Refresh to see new task
        }, 2000);
    }
    
   
});
