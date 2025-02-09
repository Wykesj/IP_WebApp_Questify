document.addEventListener("DOMContentLoaded", async function () {
    
    // Ensure Supabase is available
    if (typeof supabaseClient === "undefined") {
        console.error("Supabase is not initialized.");
        return;
    }

    let bossDefeated = false;
    window.defeatLottie = null; // Now accessible globally in the console

    // Define window-scoped Lottie elements
    window.lottieDefeatOverlay = document.getElementById("lottie-boss-defeat-overlay");
    window.lottieDefeatModal = document.getElementById("lottie-boss-defeat-modal");
    window.lottieDefeatContainer = document.getElementById("lottie-boss-defeat-animation");

    // HTML Elements
    const bossHpText = document.getElementById("boss-hp-value");
    const bossHpMaxText = document.getElementById("boss-hp-max");
    const bossHpBar = document.getElementById("boss-hp-filled");
    const questButtons = document.querySelectorAll(".complete-btn");
    const logContainer = document.getElementById("log-container");

    // Lottie Modal Elements (Completion & Boss Defeat)
    const lottieCompleteOverlay = document.getElementById("lottie-complete-overlay");
    const lottieCompleteModal = document.getElementById("lottie-complete-modal");
    const lottieCompleteContainer = document.getElementById("lottie-complete-animation");

    // Initialize Lottie Animations
    let completeLottie = lottie.loadAnimation({
        container: lottieCompleteContainer,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "../assets/lotties/complete.json"
    });

    window.defeatLottie = lottie.loadAnimation({
        container: lottieDefeatContainer,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "../assets/lotties/victory.json"
    });

    console.log("Defeat Lottie Initialized:", window.defeatLottie);

    // Fetch Boss HP on Load
    async function fetchBossHP() {
        try {
            console.log("Fetching Boss HP from Supabase...");
            const { data, error } = await supabaseClient
                .from("boss_status")
                .select("id, hp, max_hp")
                .limit(1)
                .single();

            if (error) throw error;

            console.log("Boss HP Data:", data);
            updateBossUI(data.hp, data.max_hp);
            listenForBossHPChanges();
        } catch (err) {
            console.error("Error in fetchBossHP:", err.message);
        }
    }

    // Listen for Real-Time HP Updates from Supabase
    function listenForBossHPChanges() {
        supabaseClient
            .channel("realtime:boss_status")
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "boss_status" }, (payload) => {
                console.log("Realtime Update:", payload);
                if (payload.new) {
                    updateBossUI(payload.new.hp, payload.new.max_hp);
                }
            })
            .subscribe();
    }

    // Update UI for Boss HP
    function updateBossUI(hp, maxHp) {
        if (hp < 0) hp = 0;
        bossHpText.textContent = hp;
        bossHpMaxText.textContent = maxHp;
        bossHpBar.style.width = `${(hp / maxHp) * 100}%`;

        console.log(`Updated Boss HP: ${hp}/${maxHp}`);

        if (hp === 0 && !bossDefeated) {
            bossDefeated = true;
            logAction("🔥 You defeated the Twilight Dragon!");
            playBossDefeatAnimation();
        } else if (hp > 0) {
            bossDefeated = false;
        }
    }

    // Play Lottie Quest Completion Animation
    function playLottieComplete() {
        return new Promise((resolve) => {
            lottieCompleteOverlay.style.display = "block";
            lottieCompleteModal.style.display = "flex";

            completeLottie.goToAndPlay(0, true);

            completeLottie.addEventListener("complete", () => {
                lottieCompleteOverlay.style.display = "none";
                lottieCompleteModal.style.display = "none";
                resolve();
            });
        });
    }

    // Play Lottie Boss Defeat Animation
    async function playBossDefeatAnimation() {
        return new Promise((resolve) => {
            console.log("Boss Defeated! Preparing Victory Animation...");
    
            // delay before showing the victory modal
            setTimeout(() => {
                console.log("Showing Victory Modal...");
                lottieDefeatOverlay.style.display = "block";
                lottieDefeatModal.style.display = "flex";
                lottieDefeatContainer.style.display = "block";
    
                // Reset animation before playing
                defeatLottie.goToAndStop(0);
    
                setTimeout(() => {
                    console.log("Playing Victory Animation...");
                    defeatLottie.goToAndPlay(0, true);
                }, 100);
            }, 500); // delay before the modal appears
    
            defeatLottie.addEventListener("complete", async () => {
                console.log("Victory Animation Completed. Closing Modal...");
    
                // delay AFTER animation completes before closing the modal
                setTimeout(() => {
                    lottieDefeatOverlay.style.display = "none";
                    lottieDefeatModal.style.display = "none";
    
                    console.log("Modal Closed. Now Updating XP...");
    
                    // Now update XP AFTER modal closes
                    handleBossDefeatRewards().then(async () => {
                        console.log("XP Updated!");
    
                        // 1-second delay AFTER XP updates before resetting Boss HP & Quests
                        setTimeout(async () => {
                            console.log("⏳ Resetting Boss HP & Quests...");
    
                            // Reset Boss HP
                            await resetBossHP();
    
                            // Reset Quest Buttons
                            resetQuests();
    
                            console.log("Boss HP & Quests Reset.");
                            resolve();
                        }, 1000); // delay after XP update
                    });
                }, 300); // delay AFTER animation completes before closing the modal
            });
        });
    }
    
    
    

    // Reset Boss HP in Supabase
    async function resetBossHP() {
        try {
            const { data, error } = await supabaseClient
                .from("boss_status")
                .select("id")
                .limit(1)
                .single();
    
            if (error) throw error;
    
            const bossId = data.id;
    
            const { error: updateError } = await supabaseClient
                .from("boss_status")
                .update({ hp: 100 })
                .eq("id", bossId);
    
            if (updateError) throw updateError;
    
            console.log("Boss HP reset to 100.");
            bossDefeated = false; // Reset boss defeated state here
            fetchBossHP();
        } catch (err) {
            console.error("❌ Error resetting boss HP:", err.message);
        }
    }

    
    

    // Handle Quest Completion
    questButtons.forEach((button) => {
        button.addEventListener("click", async function () {
            const damage = parseInt(button.getAttribute("data-damage"));
            const questText = this.parentElement.querySelector("p"); // Selects the quest text
    
            // Strike-through quest text and grey out button
            questText.style.textDecoration = "line-through";
            this.style.backgroundColor = "#A9A9A9"; // Grey out the button
            this.style.pointerEvents = "none"; // Prevent further clicks until reset
    
            await playLottieComplete();
    
            // Fetch Current HP
            const { data, error } = await supabaseClient
                .from("boss_status")
                .select("id, hp, max_hp")
                .limit(1)
                .single();
    
            if (error) {
                console.error("Error fetching HP:", error);
                return;
            }
    
            let newHp = Math.max(0, data.hp - damage);
    
            // Update Supabase
            const { error: updateError } = await supabaseClient
                .from("boss_status")
                .update({ hp: newHp })
                .eq("id", data.id);
    
            if (updateError) {
                console.error("Error updating HP:", updateError);
                return;
            }
    
            updateBossUI(newHp, data.max_hp);
            logAction(`You dealt ${damage} damage to Twilight Dragon.`);
    
            await fetchBossHP();
        });
    });
    
    // Reset all quest buttons after boss is defeated
    function resetQuests() {
        questButtons.forEach((button) => {
            const questText = button.parentElement.querySelector("p");

            // Reset text style
            questText.style.textDecoration = "none";

            // Reset button color & allow clicking again
            button.style.backgroundColor = "#4CAF50"; // Green color
            button.style.pointerEvents = "auto";
        });
    }

    async function handleBossDefeatRewards() {
        try {
            console.log("Granting rewards for defeating the boss...");
    
            // Use inventory.js function to add XP & update UI
            await useItem("xp", 800); // Grants 1000 XP using inventory.js logic
    
            console.log("XP granted and UI updated via inventory.js");
    
            // Ensure UI updates correctly after XP is added
            await fetchPlayerStats();
    
        } catch (err) {
            console.error("Error handling boss defeat rewards:", err.message);
        }
    }
    

    // Log Actions in Battle Log
    function logAction(message) {
        const logEntry = document.createElement("p");
        logEntry.classList.add("battle-entry");
        logEntry.textContent = message;
        logContainer.appendChild(logEntry);
    }

    fetchBossHP();
    fetchPlayerStats();
});
