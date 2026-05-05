async function run() {
    try {
        console.log("Testing CodeTabs Proxy...");
        const targetUrl = encodeURIComponent("https://www.youtube.com/watch?v=9EyvvsFRovw");
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`;

        const res = await fetch(proxyUrl);
        const html = await res.text();

        const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);
        if (playerMatch) {
            const player = JSON.parse(playerMatch[1]);
            const captions = player.captions?.playerCaptionsTracklistRenderer;
            console.log("Playability:", player.playabilityStatus?.status);
            console.log("Captions Found:", !!captions, captions?.captionTracks?.length);
            if (captions) {
                const xmlUrl = encodeURIComponent(captions.captionTracks[0].baseUrl);
                const xmlRes = await fetch(`https://api.codetabs.com/v1/proxy?quest=${xmlUrl}`);
                const xml = await xmlRes.text();
                console.log("XML Fetched from proxy! Length:", xml.length);
                if (xml.length > 100) {
                    console.log("Success! Proxy works perfectly!");
                }
            }
        } else {
            console.log("No player response found in proxy HTML. Length:", html.length);
            console.log("Preview:", html.slice(0, 100));
        }
    } catch (e: any) {
        console.error("CodeTabs Error:", e.message);
    }
}
run();
