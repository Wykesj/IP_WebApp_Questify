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

    // ✅ Handle Task Submission
    async function handleTaskSubmission(type) {
        const titleInput = document.getElementById(`${type}-title`).value.trim();
        
        // ✅ Fix: Ensure dropdown values are retrieved
        const notesInput = document.getElementById(`${type}-notes`)?.value.trim() || null;
        
        const difficultyElement = document.getElementById(`${type}-difficulty`);
        const difficultyInput = difficultyElement ? difficultyElement.value : "easy"; 

        const strengthElement = document.getElementById(`${type}-strength`);
        const strengthInput = strengthElement ? strengthElement.value : "weak"; 

        // ✅ Fix: Ensure filters get a single value from dropdown (not checkboxes)
        const filtersElement = document.getElementById(`${type}-filters`);
        const filtersInput = filtersElement ? filtersElement.value : null;

        if (!titleInput) {
            alert("Please enter a task title.");
            return;
        }

        // ✅ Ensure all fields are included in the task object
        const newTask = {
            title: titleInput,
            notes: notesInput,
            type: type,
            difficulty: difficultyInput,
            strength: strengthInput,
            filters: filtersInput, // Ensure it's a string (since it's a dropdown, not a multi-select)
            created_at: new Date().toISOString()
        };

        console.log("📤 Sending task to Supabase:", newTask); // Debugging output
        const success = await saveTask(newTask);
        
        if (success) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} task added successfully!`);
            window.location.reload(); // Refresh to see new data
        }
    }


    // ✅ Save Task to Supabase
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
});
