document.addEventListener("DOMContentLoaded", function () {
    async function pingSupabase() {
        try {
            console.log("Pinging Supabase to keep it active...");
            const { data, error } = await supabaseClient
                .from("boss_status")
                .select("id")
                .limit(1)
                .single();

            if (error) {
                console.error("Supabase Ping Error:", error);
            } else {
                console.log("Supabase is active.");
            }
        } catch (err) {
            console.error("Error in pingSupabase:", err.message);
        }
    }

    function shouldRunSupabasePing() {
        const lastPing = localStorage.getItem("lastSupabasePing");
        const now = new Date().getTime();
        return !lastPing || now - lastPing > 86400000; // 24 hours
    }

    if (shouldRunSupabasePing()) {
        pingSupabase();
        localStorage.setItem("lastSupabasePing", new Date().getTime());
    }
});
