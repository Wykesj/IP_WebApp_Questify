document.addEventListener("DOMContentLoaded", async function () {
    // ✅ Initialize Supabase using the CDN method
    const SUPABASE_URL = "https://ficxsnnbjzskugtblrfw.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpY3hzbm5ianpza3VndGJscmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTIzODksImV4cCI6MjA1NDM4ODM4OX0.BcwzBOYhxIj-kbpnpRGp-1Ekf4tjpiFoVfKOujbhFfM";
    
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        const { data, error } = await supabaseClient.from("tasks").select("*").limit(1); // Example test query
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
});