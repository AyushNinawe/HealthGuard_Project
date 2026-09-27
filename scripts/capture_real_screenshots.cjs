const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const SCREENSHOTS_DIR = path.join(__dirname, "../screenshots");
const PUBLIC_SCREENSHOTS_DIR = path.join(__dirname, "../frontend/public/screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_SCREENSHOTS_DIR)) fs.mkdirSync(PUBLIC_SCREENSHOTS_DIR, { recursive: true });

async function run() {
    console.log("Launching Chromium...");
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium",
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--window-size=1440,900"
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        // 1. Login Page
        console.log("Navigating to login page...");
        await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "login_page.png") });
        console.log("Captured login_page.png");

        // Click Fill Admin
        console.log("Logging in as Admin via Fill Admin demo button...");
        const buttons = await page.$$("button");
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes("Fill Admin")) {
                await btn.click();
                break;
            }
        }
        await new Promise(r => setTimeout(r, 600));

        // Click Sign In
        const submitBtn = await page.$("button[type='submit']");
        if (submitBtn) {
            await submitBtn.click();
        }
        await new Promise(r => setTimeout(r, 2000));
        console.log("Current URL after login:", page.url());

        // List of pages to capture
        const targets = [
            {
                route: "/dashboard",
                filename: "dashboard_preview.png",
                waitMs: 2000,
                desc: "Dashboard"
            },
            {
                route: "/submit-claim",
                filename: "submit_claim.png",
                waitMs: 1500,
                desc: "Submit Claim"
            },
            {
                route: "/claims/1/prediction",
                filename: "prediction_result.png",
                waitMs: 2500,
                desc: "Prediction Result & Explainable AI"
            },
            {
                route: "/ai/analytics",
                filename: "ai_analytics.png",
                waitMs: 2500,
                desc: "AI Analytics"
            },
            {
                route: "/claims",
                filename: "blockchain_audit.png",
                waitMs: 2000,
                desc: "Claims History & Blockchain Audit"
            },
            {
                route: "/search",
                filename: "advanced_search.png",
                waitMs: 1500,
                desc: "Advanced Search"
            },
            {
                route: "/reports",
                filename: "reports.png",
                waitMs: 1500,
                desc: "Reports"
            },
            {
                route: "/admin",
                filename: "admin_dashboard.png",
                waitMs: 2000,
                desc: "Admin Dashboard"
            },
            {
                route: "/admin/ai-tools",
                filename: "admin_tools.png",
                waitMs: 2000,
                desc: "Admin AI Tools"
            }
        ];

        for (const t of targets) {
            console.log(`Navigating to ${t.route} (${t.desc})...`);
            await page.goto("http://localhost:3000" + t.route, { waitUntil: "networkidle2" });
            await new Promise(r => setTimeout(r, t.waitMs));
            
            // Check if page displays 404 or Page Not Found
            const pageText = await page.evaluate(() => document.body.innerText);
            if (pageText.includes("404") || pageText.includes("Page Not Found")) {
                console.error(`WARNING: 404 detected on ${t.route}!`);
            } else {
                console.log(`Verified valid page on ${t.route}`);
            }

            const targetPath = path.join(SCREENSHOTS_DIR, t.filename);
            await page.screenshot({ path: targetPath });
            console.log(`Saved ${t.filename} (${fs.statSync(targetPath).size} bytes)`);
        }

        // Copy all screenshots to public directory for frontend serving
        const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith(".png"));
        for (const file of files) {
            fs.copyFileSync(path.join(SCREENSHOTS_DIR, file), path.join(PUBLIC_SCREENSHOTS_DIR, file));
        }
        console.log(`Successfully copied ${files.length} screenshots to public folder.`);

    } catch (err) {
        console.error("Error during screenshot capture:", err);
    } finally {
        await browser.close();
        console.log("Screenshot capture complete!");
    }
}

run();
