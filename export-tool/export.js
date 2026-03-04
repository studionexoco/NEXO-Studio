const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting export process... Please ensure http://localhost:3000 is running.');
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set a high-res presentation viewport (1920x1080) for 16:9 portfolio compositions
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

        console.log('Navigating to http://127.0.0.1:3000 ...');
        await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded', timeout: 0 });

        console.log('Page loaded, isolating frames and disabling animations...');
        await page.evaluate(() => {
            // Destroy scroll engine and reset smooth scroll locks
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';

            // Force all reveal elements
            document.querySelectorAll('.reveal-up').forEach(el => {
                el.classList.add('active');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.transition = 'none';
            });

            // Hide cursor
            const c = document.querySelector('.cursor');
            if (c) c.style.display = 'none';

            // Kill global transitions 
            const style = document.createElement('style');
            style.innerHTML = `
                * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
                ::-webkit-scrollbar { display: none; }
            `;
            document.head.appendChild(style);

            // Disable parallax transforms by explicitly resetting them
            setTimeout(() => {
                document.querySelectorAll('.project-image').forEach(img => {
                    img.style.transform = 'translateY(0) scale(1)';
                });
            }, 500);
        });

        // Wait for JS to settle
        await new Promise(resolve => setTimeout(resolve, 800));

        // Capture standard 1920x1080 window frame 
        async function captureFrame(name, scrollY) {
            await page.evaluate((y) => window.scrollTo(0, y), scrollY);
            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 300));
            await page.screenshot({ path: `../Nexo_Portfolio_Export_${name}.png` });
            console.log(`Saved Nexo_Portfolio_Export_${name}.png to the Nexo root folder.`);
        }

        // 1. Hero
        await captureFrame('01_Hero', 0);

        // Determine positions programmatically
        const positions = await page.evaluate(() => {
            function getCenterY(el) {
                const rect = el.getBoundingClientRect();
                // Scroll to place the element exactly in the center of 1080px viewing area
                const absoluteY = rect.top + window.scrollY;
                return absoluteY - (1080 / 2) + (rect.height / 2);
            }

            const projs = document.querySelectorAll('.project');
            return {
                workOverview: getCenterY(document.querySelector('#work .section-title')),
                bloomCo: getCenterY(projs[0]),
                greenOccasion: getCenterY(projs[1]),
                bloomApp: getCenterY(projs[2]),
                aotInterface: getCenterY(projs[3]),
                aboutNexo: getCenterY(document.getElementById('about'))
            };
        });

        await captureFrame('02_Selected_Work_Overview', positions.workOverview);
        await captureFrame('03_Bloom_Co_Project', positions.bloomCo);
        await captureFrame('04_Green_Occasion_Project', positions.greenOccasion);
        await captureFrame('05_Bloom_App_Project', positions.bloomApp);
        await captureFrame('06_AOT_Interface_Project', positions.aotInterface);
        await captureFrame('07_About_Nexo', positions.aboutNexo);

    } catch (err) {
        console.error("CAPTURE ERROR: ", err.message, err.stack);
    } finally {
        if (browser) await browser.close();
        console.log('Export process finished.');
    }
})();
