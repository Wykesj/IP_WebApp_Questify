document.addEventListener("DOMContentLoaded", async function () {

    // Ensure Supabase is available
    if (typeof supabaseClient === "undefined") {
        console.error("Supabase is not initialized.");
        return;
    }

    // HTML Elements
    const bossHpText = document.getElementById("boss-hp-value");
    const bossHpMaxText = document.getElementById("boss-hp-max");
    const bossHpBar = document.getElementById("boss-hp-filled");
    const questButtons = document.querySelectorAll(".complete-btn");
    const logContainer = document.getElementById("log-container");

    // Lottie Modal Elements
    const lottieOverlay = document.getElementById("lottie-complete-overlay");
    const lottieModal = document.getElementById("lottie-complete-modal");
    const lottieContainer = document.getElementById("lottie-complete-animation");

    // Initialize Lottie Animation
    let completeLottie = lottie.loadAnimation({
        container: lottieContainer,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "../assets/lotties/complete.json"
    });

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
            listenForBossHPChanges(); // Enable real-time updates
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
                updateBossUI(payload.new.hp, payload.new.max_hp);
            })
            .subscribe();
    }

    // Update UI for Boss HP
    function updateBossUI(hp, maxHp) {
        if (hp < 0) hp = 0; // Ensure it doesn’t go below zero
        bossHpText.textContent = hp;
        bossHpMaxText.textContent = maxHp;
        bossHpBar.style.width = `${(hp / maxHp) * 100}%`;
    }

    // Play Lottie Animation (with modal)
    function playLottieComplete() {
        return new Promise((resolve) => {
            lottieOverlay.style.display = "block";
            lottieModal.style.display = "flex";

            completeLottie.goToAndPlay(0, true);

            completeLottie.addEventListener("complete", () => {
                lottieOverlay.style.display = "none";
                lottieModal.style.display = "none";
                resolve();
            });
        });
    }

    // Handle Quest Completion (Fixing .from Error)
    questButtons.forEach((button) => {
        button.addEventListener("click", async function () {
            const damage = parseInt(button.getAttribute("data-damage"));

            // Play animation first
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

            // Update Supabase (Fix .from Error)
            const { error: updateError } = await supabaseClient
                .from("boss_status")
                .update({ hp: newHp })
                .eq("id", data.id);

            if (updateError) {
                console.error("Error updating HP:", updateError);
                return;
            }

            // Manually fetch HP again (ensures real-time update works)
            await fetchBossHP();

            // Log Action
            logAction(`You dealt ${damage} damage to Twilight Dragon.`);

            if (newHp === 0) {
                logAction("Boss defeated. Prepare for the next challenge.");
            }
        });
    });

    // Log Actions in Battle Log
    function logAction(message) {
        const logEntry = document.createElement("p");
        logEntry.classList.add("battle-entry");
        logEntry.textContent = message;
        logContainer.appendChild(logEntry);
    }

    // Fetch Initial Boss HP
    fetchBossHP();
    fetchPlayerStats();
});
