// Use require to ensure this runs BEFORE imports are resolved/hoisted
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

import { AdminService } from "../services/admin-service";

async function init() {
    const password = process.argv[2];

    if (!password) {
        console.error("Usage: npx tsx src/scripts/init-admin.ts <your_secret>");
        process.exit(1);
    }

    console.log("Initializing admin secret in Firestore...");
    try {
        await AdminService.setSecret(password);
        console.log("SUCCESS: Admin secret has been set.");
    } catch (err) {
        console.error("FAILED:", err);
    }
    process.exit(0);
}

init();
