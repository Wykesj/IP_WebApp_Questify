const SUPABASE_URL = "https://ficxsnnbjzskugtblrfw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpY3hzbm5ianpza3VndGJscmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTIzODksImV4cCI6MjA1NDM4ODM4OX0.BcwzBOYhxIj-kbpnpRGp-1Ekf4tjpiFoVfKOujbhFfM";
    
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fetch Player Stats (Shared for All Pages)
async function fetchPlayerStats() {
    try {
        const { data, error } = await supabaseClient
            .from("player_stats")
            .select("*")
            .eq("id", 1) 
            .single();

        if (error) throw error;

        console.log("✅ Player Stats Fetched:", data);
        updateStatusScreen(data);
    } catch (err) {
        console.error("❌ Error Fetching Player Stats:", err.message);
    }
}

// Update Status Screen UI (Shared for All Pages)
function updateStatusScreen(stats) {
    const maxXP = 1000;
    const maxValues = { strength: 100, vitality: 100, intelligence: 100, agility: 100 };
    const defaultValues = { strength: 47, vitality: 12, intelligence: 35, agility: 22 };

    let updatesNeeded = false;

    // Check for XP Level-Up
    if (stats.xp >= maxXP) {
        stats.level += Math.floor(stats.xp / maxXP); // Increase level correctly
        stats.xp = stats.xp % maxXP; // Carry over excess XP
        updatesNeeded = true;
    }

    // Check for Stat Limits
    for (let stat in maxValues) {
        if (stats[stat] > maxValues[stat]) {
            stats[stat] = defaultValues[stat]; // Reset to default
            updatesNeeded = true;
        }
    }

    // If stats were adjusted, update Supabase
    if (updatesNeeded) {
        updatePlayerStats(stats);
    }

    // Update XP Bar
    document.getElementById("xp-filled").style.width = `${(stats.xp / maxXP) * 100}%`;
    document.getElementById("xp-value").innerText = `${stats.xp}/${maxXP}`;

    // Update Stats Values
    document.getElementById("strength-value").innerText = stats.strength;
    document.getElementById("vitality-value").innerText = stats.vitality;
    document.getElementById("intelligence-value").innerText = stats.intelligence;
    document.getElementById("agility-value").innerText = stats.agility;
    document.getElementById("user-level").innerText = `${stats.level}`;

    // Update Stats Bar Widths
    document.getElementById("strength-fill").style.width = `${stats.strength}%`;
    document.getElementById("vitality-fill").style.width = `${stats.vitality}%`;
    document.getElementById("intelligence-fill").style.width = `${stats.intelligence}%`;
    document.getElementById("agility-fill").style.width = `${stats.agility}%`;
}


document.addEventListener("DOMContentLoaded", async function () {

    if (document.body.id === "home-page") {
        try {
            const { data, error } = await supabaseClient.from("tasks").select("*").limit(1); 
            if (error) throw error;
            console.log("✅ Supabase connected successfully:", data);
        } catch (err) {
            console.error("❌ Supabase connection failed:", err.message);
        }

        fetchPlayerStats();

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
                console.log("📤 Attempting to insert task into Supabase:", taskData);
                
                const { data, error } = await supabaseClient.from("tasks").insert([taskData]).select(); // Ensure `select()` is called to get the response including `id`.
        
                if (error) {
                    console.error("❌ Supabase Error:", error.message);
                    alert("Failed to add task: " + error.message);
                    return false;
                }
        
                console.log("✅ Task successfully added:", data);
                
                return data[0]; 
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
            taskCard.setAttribute("data-task-id", task.id);
            taskCard.setAttribute("data-category", task.filters || "none");
            taskCard.setAttribute("data-difficulty", task.difficulty || "easy");
            taskCard.setAttribute("data-strength", task.strength || "weak");
        
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
            attachTaskEditListener(taskCard);
        
            console.log("✅ Task added to DOM with ID:", task.id, task);
        }
        
        function attachTaskEditListener(taskCard) {
            taskCard.addEventListener("click", async function(event) {
                console.log("🔍 Clicked element:", event.target);
                
                // Prevent edit modal for checkbox clicks
                if (event.target.closest('.checkbox-container') || event.target.closest('.habit-btn')) {
                    console.log("⚠️ Click ignored - checkbox or habit button");
                    return;
                }
        
                const taskId = this.dataset.taskId;
                const container = this.closest(".task-container");
                console.log("🔍 Container found:", container);
                console.log("🔍 Container ID:", container.id);
        
                // Fix dailies type detection
                let taskType = container.id.replace('dailies', 'daily')
                                        .replace('habits', 'habit')
                                        .replace('todos', 'todo');
        
                console.log("📌 Task type detected:", taskType);
                
                const taskData = await fetchTask(taskId);
                if (taskData) {
                    console.log("📌 Opening modal for:", taskType, taskData);
                    
                    // ✅ Open the modal in edit mode
                    openEditModal(taskType, taskData);
                }
            });
        }    

        async function fetchTask(taskId) {
            try {
                const { data, error } = await supabaseClient
                    .from("tasks")
                    .select("id, title, notes, type, difficulty, strength, filters")
                    .eq("id", taskId)
                    .single();
                    
                if (error) throw error;
                
                console.log("📌 Fetched Task Data:", data);
                return data;
            } catch (err) {
                console.error("❌ Error fetching task:", err.message);
                return null;
            }
        }
        
        // Add update task function
        async function updateTask(taskId, taskData) {
            try {
                console.log("📌 Updating task in Supabase:", taskId, taskData); // Debug log
        
                const { data, error } = await supabaseClient
                    .from("tasks")
                    .update(taskData)
                    .eq("id", taskId)
                    .select(); // Ensure we get the updated task
        
                if (error) throw error;
                
                console.log("✅ Task updated:", data);
                return data[0]; // Return updated task
            } catch (err) {
                console.error("❌ Error updating task:", err.message);
                return null;
            }
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function openEditModal(type, task) {
            const modal = document.getElementById(`${type}-modal`);
            if (!modal) {
                console.error(`❌ Modal not found for type: ${type}`);
                return;
            }
        
            // Set modal mode and task ID
            modal.setAttribute("data-mode", "edit");
            modal.setAttribute("data-task-id", task.id);
        
            modal.querySelector(".modal-header h2").textContent = `Edit ${capitalizeFirstLetter(type)}`;
        
            // Fill form fields with null checks
            const titleInput = document.getElementById(`${type}-title`);
            const notesInput = document.getElementById(`${type}-notes`);
            const difficultySelect = document.getElementById(`${type}-difficulty`);
            const strengthSelect = document.getElementById(`${type}-strength`);
            const filtersInput = document.getElementById(`${type}-filters`);
        
            // Set values
            if (titleInput) titleInput.value = task.title || '';
            if (notesInput) notesInput.value = task.notes || '';
            if (difficultySelect) difficultySelect.value = task.difficulty || 'medium';
            if (strengthSelect) strengthSelect.value = task.strength || 'medium';
            if (filtersInput) filtersInput.value = task.filters || '';
            
            // Remove "Create" button if it exists in the edit modal
            const createBtn = modal.querySelector(".create-btn");
            if (createBtn) createBtn.remove();

            // ✅ Ensure "Save Changes" button is added if missing
            const modalFooter = modal.querySelector(".modal-footer");

            // Check if "Save" button already exists
            let saveBtn = modal.querySelector(".save-btn");
            if (!saveBtn) {
                saveBtn = document.createElement("button");
                saveBtn.classList.add("btn", "save-btn");
                saveBtn.id = `save-${type}`;
                saveBtn.textContent = "Save Changes";
                
                // ✅ Add event listener to handle saving the task
                saveBtn.addEventListener("click", async function() {
                    console.log("🛠 Saving task...");
                
                    const updatedTask = {
                        title: document.getElementById(`${type}-title`).value.trim(),
                        notes: document.getElementById(`${type}-notes`).value.trim(),
                        difficulty: document.getElementById(`${type}-difficulty`)?.value || "easy",
                        strength: document.getElementById(`${type}-strength`)?.value || "weak",
                        filters: document.getElementById(`${type}-filters`)?.value || "",
                        type: type
                    };
                
                    console.log("📤 Sending updated task data:", updatedTask);
                
                    const result = await updateTask(task.id, updatedTask);
                    console.log("✅ Update result:", result);
                
                    if (result) {
                        console.log("✅ Task updated successfully!");
                
                        // ✅ Update task card in the UI
                        const taskCard = document.querySelector(`[data-task-id="${task.id}"]`);
                        if (taskCard) {
                            taskCard.querySelector("p").textContent = result.title; // Update title
                            taskCard.setAttribute("data-difficulty", result.difficulty);
                            taskCard.setAttribute("data-strength", result.strength);
                            taskCard.setAttribute("data-category", result.filters || "none");
                
                            console.log("✅ Task updated in DOM:", taskCard);
                        } else {
                            console.warn("⚠️ Task card not found in DOM!");
                        }
                
                        modal.style.display = "none"; // Close modal after saving
                    } else {
                        console.error("❌ Failed to update task!");
                        alert("Error updating task.");
                    }
                });            

                modalFooter.appendChild(saveBtn);
            }

            modal.style.display = "flex";
        }
        
        // Initialize handlers
        setupTaskModalHandlers();

        // 5. Initialize
        loadTasks();

        function filterTasksByDifficulty() {
            let selectedStrength = document.querySelector("#habit-filters .filter-btn.active")?.getAttribute("data-filter");
            let selectedDailyDifficulty = document.querySelector("#daily-filters .filter-btn.active")?.getAttribute("data-filter");
            let selectedTodoDifficulty = document.querySelector("#todo-filters .filter-btn.active")?.getAttribute("data-filter");
        
            document.querySelectorAll(".task-card").forEach(taskCard => {
                let taskType = taskCard.closest(".task-container").id; // Get Parent Section ID
                let taskDifficulty = taskCard.getAttribute("data-difficulty");
                let taskStrength = taskCard.getAttribute("data-strength");
        
                let showTask = true;
        
                // ✅ Separate Filtering Logic for Each Section
                if (taskType === "habits") {
                    showTask = selectedStrength === "all" || taskStrength === selectedStrength;
                } else if (taskType === "dailies") {
                    showTask = selectedDailyDifficulty === "all" || taskDifficulty === selectedDailyDifficulty;
                } else if (taskType === "todos") {
                    showTask = selectedTodoDifficulty === "all" || taskDifficulty === selectedTodoDifficulty;
                }
        
                taskCard.style.display = showTask ? "flex" : "none";
            });
        }
        

        const difficultyFilters = document.querySelectorAll("#habit-filters .filter-btn, #daily-filters .filter-btn, #todo-filters .filter-btn");

        difficultyFilters.forEach(btn => {
            btn.addEventListener("click", function () {
                let parentNav = this.parentElement;
                parentNav.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                filterTasksByDifficulty();
            });
        });


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

        function searchTasks() {
            let query = searchInput.value.toLowerCase();
            document.querySelectorAll(".task-card").forEach(taskCard => {
                let taskTitle = taskCard.querySelector("p").textContent.toLowerCase();
                taskCard.style.display = taskTitle.includes(query) ? "flex" : "none";
            });
        }

        searchInput.addEventListener("input", searchTasks);

        // filter functionality 
        const filterCheckboxes = document.querySelectorAll("#filter-dropdown input[type='checkbox']");
        const resetFilterBtn = document.getElementById("reset-filters");

        function applyFilters() {
            let selectedCategories = Array.from(filterCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            console.log("📌 Active Filters:", selectedCategories);

            document.querySelectorAll(".task-card").forEach(taskCard => {
                let taskCategory = taskCard.getAttribute("data-category");

                if (selectedCategories.length === 0 || selectedCategories.includes(taskCategory)) {
                    taskCard.style.display = "flex";
                } else {
                    taskCard.style.display = "none";
                }
            });
        }

        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", applyFilters);
        });

        resetFilterBtn.addEventListener("click", function () {
            filterCheckboxes.forEach(checkbox => checkbox.checked = false);
            applyFilters();
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
        
                const type = this.getAttribute("data-type"); // Get the type (habit, daily, todo)
        
                // ✅ Ensure correct modal is used
                const modal = document.getElementById(
                    type === "habit" ? "habit-modal" :
                    type === "daily" ? "daily-modal" :
                    type === "todo" ? "todo-modal" :
                    null
                );
        
                if (modal) {
                    modal.style.display = "flex";
                    modal.setAttribute("data-mode", "create");
                    modal.removeAttribute("data-task-id"); // ✅ Ensure it's in create mode
        
                    // ✅ Clear form fields
                    document.getElementById(`${type}-title`).value = "";
                    document.getElementById(`${type}-notes`).value = "";
                    document.getElementById(`${type}-difficulty`).value = "easy";
                    document.getElementById(`${type}-strength`).value = "weak";
                    document.getElementById(`${type}-filters`).value = "";
                } else {
                    console.error(`❌ Modal not found for type: ${type}`);
                }
            });
        });
        
        function resetModal(modal) {
        modal.style.display = "none";
        modal.setAttribute("data-mode", "create"); // ✅ Reset back to "create" mode
        modal.removeAttribute("data-task-id"); // ✅ Remove the stored task ID
    }


        // ✅ Modal Management 
        function setupModal(openBtnSelector, modalSelector, closeBtnSelector, cancelBtnSelector, inputSelector, createBtnSelector) {
            const modal = document.getElementById(modalSelector);
            const openBtn = document.querySelector(`[data-type="${openBtnSelector}"]`);
            const closeBtn = document.getElementById(closeBtnSelector);
            const cancelBtn = document.getElementById(cancelBtnSelector);
            const createBtn = document.getElementById(createBtnSelector);
            const titleInput = document.getElementById(inputSelector);
        
            // ✅ When opening the modal via "Create", reset it to create mode
            openBtn.addEventListener("click", () => {
                modal.style.display = "flex";
                modal.setAttribute("data-mode", "create");
                modal.removeAttribute("data-task-id"); // ✅ Ensure no old task ID remains
        
                // ✅ Clear form fields
                titleInput.value = "";
                document.getElementById(`${openBtnSelector}-notes`).value = "";
                document.getElementById(`${openBtnSelector}-difficulty`).value = "easy";
                document.getElementById(`${openBtnSelector}-strength`).value = "weak";
                document.getElementById(`${openBtnSelector}-filters`).value = "";
            });
        
            [closeBtn, cancelBtn].forEach(btn => btn.addEventListener("click", () => resetModal(modal)));
        
            window.addEventListener("click", (e) => {
                if (e.target === modal) resetModal(modal);
            });
        
            titleInput.addEventListener("input", () => {
                createBtn.disabled = titleInput.value.trim() === "";
            });
        }

        // ✅ Setup Modals
        setupModal("habit", "habit-modal", "close-habit-modal", "cancel-habit", "habit-title", "create-habit");
        setupModal("daily", "daily-modal", "close-daily-modal", "cancel-daily", "daily-title", "create-daily");
        setupModal("todo", "todo-modal", "close-todo-modal", "cancel-todo", "todo-title", "create-todo");

        function setupTaskModalHandlers() {
            ['habit', 'daily', 'todo'].forEach(type => {
                let createBtn = document.getElementById(`create-${type}`);
        
                // ✅ Clone button to remove all previous event listeners
                let newCreateBtn = createBtn.cloneNode(true);
                createBtn.replaceWith(newCreateBtn);
        
                newCreateBtn.addEventListener("click", async function() {
                    const modal = document.getElementById(`${type}-modal`);
                    
                    // ✅ Keep edit mode if it was set, otherwise default to "create"
                    let mode = modal.getAttribute("data-mode") || "create";
                    let taskId = modal.getAttribute("data-task-id") || null;
        
                    console.log("Modal Mode:", mode, "Task ID:", taskId);
        
                    const taskData = {
                        title: document.getElementById(`${type}-title`).value.trim(),
                        notes: document.getElementById(`${type}-notes`).value.trim(),
                        difficulty: document.getElementById(`${type}-difficulty`)?.value || "easy",
                        strength: document.getElementById(`${type}-strength`)?.value || "weak",
                        filters: document.getElementById(`${type}-filters`)?.value || "",
                        type: type
                    };
        
                    if (!taskData.title) {
                        alert("Please enter a title");
                        return;
                    }
        
                    let result;
                    if (mode === "edit" && taskId) {
                        console.log("Updating existing task:", taskId);
                        result = await updateTask(taskId, taskData);
                    } else {
                        console.log("Creating new task");
                        result = await saveTask(taskData);
                    }
        
                    if (result) {
                        modal.style.display = "none";
                        if (mode === "edit") {
                            const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
                            if (taskCard) {
                                taskCard.querySelector("p").textContent = result.title;
                                taskCard.setAttribute("data-difficulty", result.difficulty);
                                taskCard.setAttribute("data-strength", result.strength);
                            }
                            console.log("Task updated in DOM");
                        } else {
                            addTaskToDOM(result);
                        }
                    }
                });
            });
        }
        
        

        // closeModal function here
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

        function setupTaskSubmissionListeners() {
            document.querySelectorAll(".create-btn").forEach(createBtn => {
                // ✅ Clone button to remove existing event listeners
                let newCreateBtn = createBtn.cloneNode(true);
                createBtn.replaceWith(newCreateBtn);
        
                // ✅ Attach a fresh event listener to prevent duplicate calls
                newCreateBtn.addEventListener("click", function () {
                    const type = this.id.replace("create-", "");
        
                    console.log(`🛠 Handling task submission for: ${type}`);
        
                    // ✅ Call the function to create a new task
                    handleTaskSubmission(type);
                });
            });
        }
        
        // ✅ Call this function once on page load to attach listeners
        setupTaskSubmissionListeners();
        

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
    }
});