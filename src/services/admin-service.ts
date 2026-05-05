import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export class AdminService {
    private static SETTINGS_PATH = "settings/admin";

    /**
     * Verifies if the provided secret matches the one stored in Firestore.
     */
    static async verifySecret(providedSecret: string): Promise<boolean> {
        if (!providedSecret) return false;

        try {
            const adminRef = doc(db!, this.SETTINGS_PATH);
            const snapshot = await getDoc(adminRef);

            if (!snapshot.exists()) {
                console.error("[ADMIN] Admin settings not found in Firestore.");
                return false;
            }

            const data = snapshot.data();
            return data.secret === providedSecret;
        } catch (error) {
            console.error("[ADMIN] Verification error:", error);
            return false;
        }
    }

    /**
     * Updates or initializes the admin secret.
     */
    static async setSecret(newSecret: string): Promise<void> {
        const adminRef = doc(db!, this.SETTINGS_PATH);
        await setDoc(adminRef, {
            secret: newSecret,
            updatedAt: new Date().toISOString()
        });
        console.log("[ADMIN] Secret updated successfully.");
    }
}
