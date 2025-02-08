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

    // Item Confirmation Modal
    const itemModal = document.getElementById("item-modal");
    const modalItemName = document.getElementById("modal-item-name");
    const modalItemDescription = document.getElementById("modal-item-description");
    const useItemBtn = document.getElementById("use-item-btn");
    const cancelItemBtn = document.getElementById("cancel-item-btn");


    let selectedItem = null;

    inventoryItems.forEach(item => {
        item.addEventListener("click", function () {
            selectedItem = item; // Store the clicked item
            const itemName = item.getAttribute("data-name");
            const itemEffect = item.getAttribute("data-effect");

            modalItemName.innerText = `Use ${itemName}?`;
            modalItemDescription.innerText = itemEffect;
            itemModal.classList.remove("hidden");
        });
    });

    cancelItemBtn.addEventListener("click", function () {
        itemModal.classList.add("hidden"); // Hide modal on cancel
    });

    useItemBtn.addEventListener("click", function () {
        if (selectedItem) {
            const statToIncrease = selectedItem.getAttribute("data-stat");
            const increaseAmount = parseInt(selectedItem.getAttribute("data-amount"));

            useItem(statToIncrease, increaseAmount);
            itemModal.classList.add("hidden");
        }
    });

    //Fetch Player Stats
    //Fetch Player Stats
    //Fetch Player Stats
    async function fetchPlayerStats() {
        try {
            const { data, error } = await supabaseClient
                .from("player_stats")
                .select("*")
                .limit(1); // Remove `.single()` to avoid 406 error
            
            if (error) throw error;
            if (!data || data.length === 0) {
                console.error("❌ No player stats found in the database.");
                return;
            }
    
            console.log("✅ Player Stats Fetched:", data[0]); // Log to confirm data
            updateStatusScreen(data[0]); // Use data[0] since .single() is removed
        } catch (err) {
            console.error("❌ Error Fetching Player Stats:", err.message);
        }
    }
    
    async function useItem(statList, amount) {
        const userId = 1; // Replace with dynamic user ID
    
        try {
            const statsToUpdate = statList.split(",");

            // Default values for reset
            const defaultValues = { strength: 47, vitality: 12, intelligence: 35, agility: 22 };
    
            // Fetch current stats
            let { data, error } = await supabaseClient
                .from("player_stats")
                .select(statsToUpdate.join(",") + ", level")
                .eq("id", userId)
                .single();
    
            if (error) throw error;
    
            let updates = {};
    
            statsToUpdate.forEach(stat => {
                let newStatValue = data[stat] + amount;
    
                // Special handling for XP 
                if (stat === "xp") {
                    if (newStatValue >= 1000) {
                        let levelsGained = Math.floor(newStatValue / 1000); // How many levels to add
                        newStatValue = newStatValue % 1000; // Carry over extra XP
    
                        updates["level"] = data.level + levelsGained; // Correctly increase level
                        console.log(`Level Up! New Level: ${updates["level"]}`);
                    }
                } 
                //  Other stats should reset if exceeding 100
                else if (newStatValue > 100) {
                    newStatValue = defaultValues[stat];
                }
    
                updates[stat] = newStatValue;
            });
    
            // Update Supabase
            const { error: updateError } = await supabaseClient
                .from("player_stats")
                .update(updates)
                .eq("id", userId);
    
            if (updateError) throw updateError;
    
            console.log(`✅ Updated Stats:`, updates);
    
            //  Refresh status screen after update
            fetchPlayerStats();
        } catch (err) {
            console.error("❌ Error using item:", err.message);
        }
    }
    
    

    function updateStatusScreen(stats) {
        const maxXP = 1000;
        const maxValues = { strength: 100, vitality: 100, intelligence: 100, agility: 100 };
        const defaultValues = { strength: 47, vitality: 12, intelligence: 35, agility: 22 };

        let updatesNeeded = false;


        // Check for XP Level-Up
        if (stats.xp >= maxXP) {
            stats.level += 1; // Increase level
            stats.xp = stats.xp - maxXP; // Carry over excess XP
            console.log(`Level Up! New Level: ${stats.level}`);
            updatesNeeded = true;
        }


        // Check for Stat Limits
        for (let stat in maxValues) {
            if (stats[stat] > maxValues[stat]) {
                console.log(`⚠️ ${stat} exceeded max limit! Resetting to default.`);
                stats[stat] = defaultValues[stat]; // Reset to default value
                updatesNeeded = true;
            }
        }
    
        // If any stat was reset, update API with new values
        if (updatesNeeded) {
            updatePlayerStats(stats);
        }

        console.log("XP Value from Supabase:", stats.xp);

        document.getElementById("xp-filled").style.width = `${(stats.xp / 1000) * 100}%`;
        document.getElementById("xp-value").innerText = `${stats.xp}/1000`;
    
        document.getElementById("strength-value").innerText = stats.strength;
        document.getElementById("vitality-value").innerText = stats.vitality;
        document.getElementById("intelligence-value").innerText = stats.intelligence;
        document.getElementById("agility-value").innerText = stats.agility;
        document.getElementById("user-level").innerText = `${stats.level}`;

        document.getElementById("strength-fill").style.width = `${stats.strength}%`;
        document.getElementById("vitality-fill").style.width = `${stats.vitality}%`;
        document.getElementById("intelligence-fill").style.width = `${stats.intelligence}%`;
        document.getElementById("agility-fill").style.width = `${stats.agility}%`;
    }    


    //Update Player Stats

    async function updatePlayerStats(updatedStats) {
        const userId = 1; // Replace with dynamic user ID
    
        const { data, error } = await supabaseClient
            .from("player_stats")
            .update(updatedStats)
            .eq("id", userId);
    
        if (error) {
            console.error("❌ Error Updating Player Stats:", error.message);
        } else {
            console.log("✅ Player Stats Updated:", data);
        }
    }
    

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
