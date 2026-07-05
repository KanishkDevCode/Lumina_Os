import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const IMAGES_DIRS = [
    path.join(PUBLIC_DIR, 'images'),
    path.join(PUBLIC_DIR, 'Dashboard_Assests')
];
const MODELS_DIR = path.join(PUBLIC_DIR, 'models');

console.log('🚀 Starting Asset Optimization for Lumina OS...');

// 1. Convert Images to WebP
async function optimizeImages() {
    console.log('\n📸 Optimizing Images to WebP...');
    for (const dir of IMAGES_DIRS) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file.match(/\.(png|jpg|jpeg)$/i)) {
                const inputPath = path.join(dir, file);
                const outputPath = path.join(dir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
                
                // Skip if webp already exists and is newer
                if (fs.existsSync(outputPath) && fs.statSync(outputPath).mtimeMs > fs.statSync(inputPath).mtimeMs) {
                    continue;
                }

                try {
                    await sharp(inputPath)
                        .webp({ quality: 85, effort: 6 }) // Best quality/size ratio
                        .toFile(outputPath);
                    
                    const oldSize = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2);
                    const newSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
                    console.log(`✅ Converted ${file}: ${oldSize}MB -> ${newSize}MB`);
                } catch (err) {
                    console.error(`❌ Failed to convert ${file}:`, err.message);
                }
            }
        }
    }
}

// 2. Compress Models with Draco
function optimizeModels() {
    console.log('\n🧊 Optimizing 3D Models with Draco Compression...');
    if (!fs.existsSync(MODELS_DIR)) return;
    
    const files = fs.readdirSync(MODELS_DIR);
    for (const file of files) {
        if (file.endsWith('.glb') && !file.includes('_draco')) {
            const inputPath = path.join(MODELS_DIR, file);
            const outputPath = path.join(MODELS_DIR, file.replace('.glb', '_draco.glb'));
            
            if (fs.existsSync(outputPath)) continue;

            console.log(`⏳ Compressing ${file}... This might take a moment.`);
            try {
                // Using gltf-transform for Draco compression and WebP textures
                execSync(`npx @gltf-transform/cli optimize "${inputPath}" "${outputPath}" --texture-compress webp --compress draco`, { stdio: 'inherit' });
                console.log(`✅ Successfully compressed ${file}`);
            } catch (err) {
                console.error(`❌ Failed to compress ${file}. Make sure to run this via terminal if it fails.`);
            }
        }
    }
}

async function run() {
    await optimizeImages();
    optimizeModels();
    console.log('\n🎉 Optimization Complete! All assets are now next-gen ready.');
}

run();
