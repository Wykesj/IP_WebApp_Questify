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
    const sortSelect = document.getElementById("sort-items");

    function sortInventoryItems(criteria) {
        inventoryCategories.forEach(category => {
            const itemsContainer = category.querySelector(".inventory-items");
            const itemsArray = Array.from(itemsContainer.children);

            itemsArray.sort((a, b) => {
                const nameA = a.querySelector("img").alt.toLowerCase();
                const nameB = b.querySelector("img").alt.toLowerCase();

                if (criteria === "alphabetical") {
                    return nameA.localeCompare(nameB);
                } else if (criteria === "rarity") {
                    return getItemRarity(nameB) - getItemRarity(nameA); // Rarest first
                }
            });

            itemsContainer.innerHTML = ""; // Clear container before re-adding sorted items
            itemsArray.forEach(item => itemsContainer.appendChild(item));
        });
    }

    function getItemRarity(itemName) {
        const rarityOrder = {
            "arcane gem": 5,
            "ancient tome": 4,
            "strength scroll": 2,
            "xp scroll": 3,
            "vitality potion": 3,
            "intelligence potion": 2,
            "agility potion": 2
        };
        return rarityOrder[itemName.toLowerCase()] || 1; // Default to 1 if not listed
    }

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

        // Hide equipment filters when in Items tab
        equipmentFilters.forEach(filter => {
            filter.parentElement.style.display = isEquipmentTab ? "flex" : "none";
        });

        // Clear selected filters when switching tabs
        filterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        filterInventory(); // Re-filter inventory after reset
    }

    // Sorting Event Listener
    sortSelect.addEventListener("change", function () {
        sortInventoryItems(this.value);
    });

    // Tab Switching Event Listeners
    itemsTab.addEventListener("click", () => toggleFilters("items"));
    equipmentTab.addEventListener("click", () => toggleFilters("equipment"));

    // Filter Change Event Listeners
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", filterInventory);
    });

    // Initial States
    filterInventory();
    toggleFilters("items"); // Default to Items tab
});
