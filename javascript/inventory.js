document.addEventListener("DOMContentLoaded", function () {
    const SUPABASE_URL = "https://ficxsnnbjzskugtblrfw.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpY3hzbm5ianpza3VndGJscmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTIzODksImV4cCI6MjA1NDM4ODM4OX0.BcwzBOYhxIj-kbpnpRGp-1Ekf4tjpiFoVfKOujbhFfM";
    
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const filterCheckboxes = document.querySelectorAll("#inventory-filters input[type='checkbox']");
    const inventoryItems = document.querySelectorAll(".inventory-item");
    const inventoryCategories = document.querySelectorAll(".inventory-category");
    const equipmentFilters = document.querySelectorAll("#inventory-filters input[id^='equipment-']");
    const itemsTab = document.querySelector(".tab[data-tab='items']");
    const equipmentTab = document.querySelector(".tab[data-tab='equipment']");

    function filterInventory() {
        let activeFilters = Array.from(filterCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.id.replace("inventory-", "").replace("equipment-", "")); 

        let isAnyFilterActive = activeFilters.length > 0;

        inventoryItems.forEach(item => {
            let itemCategory = item.getAttribute("data-category");
            item.style.display = isAnyFilterActive ? 
                (activeFilters.includes(itemCategory) ? "flex" : "none") : 
                "flex"; 
        });

        inventoryCategories.forEach(category => {
            const visibleItems = category.querySelectorAll(".inventory-item:not([style*='display: none'])");
            category.style.display = visibleItems.length > 0 ? "block" : "none";
        });
    }

    function toggleFilters(tab) {
        const isEquipmentTab = tab === "equipment";
        equipmentFilters.forEach(filter => {
            filter.parentElement.style.display = isEquipmentTab ? "flex" : "none";
        });
    }

    itemsTab.addEventListener("click", () => toggleFilters("items"));
    equipmentTab.addEventListener("click", () => toggleFilters("equipment"));

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", filterInventory);
    });

    filterInventory();
    toggleFilters("items"); // Default to items tab
});
