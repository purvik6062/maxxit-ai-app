// app/api/validate-twitter-handle/route.ts
import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import puppeteer from "puppeteer";

const SUBSCRIPTION_COST = 30;

export const runtime = "nodejs";

export async function POST(request: Request) {
  let browser = null;

  try {
    const { handle, twitterId } = await request.json();

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    // const db2 = client.db("test_analysis");
    // const influencer_Test_Collection = db2.collection("influencers_testing");
    const usersCollection = db.collection("users");
    const collection = db.collection("influencers");

    if (!twitterId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Please connect your Twitter account first" },
        },
        { status: 400 }
      );
    }

    if (!handle) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter handle is required" } },
        { status: 400 }
      );
    }

    // Check if influencer already exists in influencers_account collection
    const existingInfluencerAccount = await collection.findOne({
      handle: { $regex: `^${handle}$`, $options: "i" },
    });

    if (existingInfluencerAccount) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Influencer with this handle already exists" },
        },
        { status: 400 }
      );
    }

    const user = await usersCollection.findOne({ twitterId });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Register yourself first!",
          },
        },
        { status: 400 }
      );
    }

    if (user.credits < SUBSCRIPTION_COST) {
      return NextResponse.json(
        { success: false, error: { message: "Insufficient credits" } },
        { status: 400 }
      );
    }

    const username = handle.startsWith("@") ? handle.substring(1) : handle;

    // Improved Twitter handle validation (fixed)
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "font", "stylesheet"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Set a more modern user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );

    // Visit the Twitter profile page
    const twitterUrl = `https://twitter.com/${username}`;
    const response = await page.goto(twitterUrl, {
      waitUntil: "networkidle2", // Wait until network is idle
      timeout: 30000, // Longer timeout
    });

    // Check HTTP status code first (404 means profile doesn't exist)
    if (response?.status() === 404) {
      await browser.close();
      return NextResponse.json({ success: true, exists: false });
    }

    // Look for definitive signs of account existence or non-existence
    try {
      // Use setTimeout instead of waitForTimeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check for error indicators (account suspended, not found, etc.)
      const errorSelectors = [
        '[data-testid="error-detail"]',
        '[data-testid="emptyState"]',
        'div[aria-label="Account suspended"]',
      ];

      let hasError = false;
      for (const selector of errorSelectors) {
        const element = await page.$(selector);
        if (element) {
          hasError = true;
          break;
        }
      }

      const errorTexts = ["This account doesn't exist", "User not found"];
      for (const errorText of errorTexts) {
        const hasErrorText = await page.evaluate((text) => {
          return document.body.innerText.includes(text);
        }, errorText);

        if (hasErrorText) {
          hasError = true;
          break;
        }
      }

      if (hasError) {
        await browser.close();
        return NextResponse.json({ success: true, exists: false });
      }

      // Check for positive indicators of account existence
      const accountIndicators = [
        '[data-testid="UserName"]',
        '[data-testid="UserCell"]',
        '[data-testid="tweetText"]',
        'a[href*="/following"]',
      ];

      let accountExists = false;
      let userProfileUrl: string = "";

      for (const selector of accountIndicators) {
        const element = await page.$(selector);
        if (element) {
          accountExists = true;
          break;
        }
      }

      // If we found positive indicators, the account exists
      if (accountExists) {
        // Scrape the profile image URL
        try {
          // Try multiple selectors for the profile image
          const profileImageSelectors = [
            'img[data-testid="UserAvatar-Container-img"]',
            'img[alt*="profile photo"]',
            '.css-9pa8cd[src*="profile_images"]',
            'a[href*="photo"] img',
          ];

          for (const imgSelector of profileImageSelectors) {
            await page
              .waitForSelector(imgSelector, { timeout: 2000 })
              .catch(() => {});

            const imgUrl = await page.evaluate((selector) => {
              const img = document.querySelector(selector);
              return img ? img.getAttribute("src") || "" : "";
            }, imgSelector);

            if (imgUrl) {
              userProfileUrl = imgUrl;
              break;
            }
          }

          // Store the handle and profile URL in the database
          // if (userProfileUrl) {
          //   await influencer_Test_Collection.insertOne({
          //     handle: username,
          //     userData: {
          //       userProfileUrl,
          //     },
          //   });
          // }
        } catch (profileError) {
          console.error("Error scraping profile image:", profileError);
        }

        await browser.close();
        return NextResponse.json({ success: true, exists: true });
      }

      // Fallback to URL check
      const currentUrl = page.url();
      const exists =
        !currentUrl.includes("/404") &&
        !currentUrl.includes("/account/suspended") &&
        !currentUrl.includes("account-suspended");

      await browser.close();
      return NextResponse.json({ success: true, exists });
    } catch (error) {
      console.error("Error during Twitter validation:", error);

      // Last resort fallback - check the URL
      try {
        const currentUrl = page.url();
        const exists =
          !currentUrl.includes("/404") &&
          !currentUrl.includes("/account/suspended") &&
          !currentUrl.includes("account-suspended");

        await browser.close();
        return NextResponse.json({ success: true, exists });
      } catch (err) {
        await browser.close();
        return NextResponse.json(
          {
            success: false,
            error: { message: "Could not validate Twitter handle" },
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
