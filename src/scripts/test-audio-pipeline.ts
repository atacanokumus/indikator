/**
 * Test script: Ses tabanlı analiz pipeline'ını tek bir video üzerinde test eder.
 * Kullanım: npx tsx src/scripts/test-audio-pipeline.ts
 */
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import { downloadAudioFromVideo } from '../services/audio-downloader';
import { analyzeAudio } from '../lib/gemini';
import { uploadAudioToStorage, deleteAudioFromStorage } from '../lib/firestore';

// Bilinen bir Türkçe finans videosu (kısa) test için
const TEST_VIDEO_ID = process.argv[2] || 'dQw4w9WgXcQ';

async function testPipeline() {
    console.log(`\n🧪 Audio Pipeline Test — Video: ${TEST_VIDEO_ID}\n`);

    try {
        // Step 1: Ses indir
        console.log('📥 Step 1: Downloading audio...');
        const startDl = Date.now();
        const { audioBuffer, mimeType } = await downloadAudioFromVideo(TEST_VIDEO_ID);
        console.log(`✅ Audio downloaded: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB (${mimeType}) in ${((Date.now() - startDl) / 1000).toFixed(1)}s\n`);

        // Step 2: Firebase Storage'a yükle
        console.log('☁️  Step 2: Uploading to Firebase Storage...');
        const url = await uploadAudioToStorage(TEST_VIDEO_ID, audioBuffer, mimeType);
        console.log(`✅ Uploaded. URL: ${url.substring(0, 80)}...\n`);

        // Step 3: Gemini ile analiz et
        console.log('🤖 Step 3: Analyzing with Gemini AI...');
        const startAi = Date.now();
        const results = await analyzeAudio(audioBuffer, mimeType);
        console.log(`✅ Analysis complete in ${((Date.now() - startAi) / 1000).toFixed(1)}s`);
        console.log(`📊 Found ${results.length} financial signals:\n`);
        results.forEach((r: any, i: number) => {
            console.log(`  ${i + 1}. ${r.asset} — ${r.recommendation} (Score: ${r.score}, Timeframe: ${r.timeframe})`);
            console.log(`     Reasoning: ${r.reasoning}`);
            if (r.targetPrice) console.log(`     Target: ${r.targetPrice}`);
            console.log();
        });

        // Step 4: Temizlik
        console.log('🗑️  Step 4: Cleaning up Firebase Storage...');
        await deleteAudioFromStorage(TEST_VIDEO_ID);
        console.log('✅ Cleaned up.\n');

        console.log('🎉 Pipeline test PASSED!\n');
    } catch (error: any) {
        console.error(`\n❌ Pipeline test FAILED: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

testPipeline();
