import { NextResponse } from "next/server";
import { chromium } from "playwright";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const {
      handle,
      maxFollowers = 100,
      username,
      password,
    } = await request.json();

    // Validate required fields
    if (!handle) {
      return NextResponse.json(
        {
          success: false,
          error: "Twitter handle is required",
        },
        { status: 400 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Twitter login credentials are required to view followers",
        },
        { status: 400 }
      );
    }

    const twitterHandle = handle.startsWith("@") ? handle.substring(1) : handle;

    console.log(`Fetching followers for @${twitterHandle} using Playwright`);

    // Launch browser with context - with increased timeout for slow connections
    const browser = await chromium.launch({
      headless: true,
      timeout: 60000,
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      // Slow down operations to avoid detection
      timezoneId: "America/New_York",
    });

    // Create a new page
    const page = await context.newPage();
    console.log("Browser launched successfully");

    // Navigate to Twitter login
    try {
      await page.goto("https://twitter.com/i/flow/login", {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      console.log("Login page loaded");
    } catch (navError) {
      await browser.close();
      return NextResponse.json(
        {
          success: false,
          error: `Failed to load Twitter login page: ${navError.message}`,
        },
        { status: 500 }
      );
    }

    // Take screenshot for debugging (optional)
    await page.screenshot({ path: "login-page.png" });

    // Login process with improved selectors and error handling
    try {
      console.log("Starting login process");

      // Wait for the username field using multiple possible selectors
      const usernameInput = await Promise.race([
        page.waitForSelector('input[autocomplete="username"]', {
          timeout: 20000,
        }),
        page.waitForSelector('input[name="text"]', { timeout: 20000 }),
        page.waitForSelector(
          'input[data-testid="text-input-for-username-or-email"]',
          { timeout: 20000 }
        ),
      ]).catch(() => null);

      if (!usernameInput) {
        await page.screenshot({ path: "username-not-found.png" });
        throw new Error("Could not find username input field");
      }

      console.log("Found username field, entering credentials");
      // Type username and wait a bit between actions
      await usernameInput.fill(username);
      await page.waitForTimeout(1000);

      // REPLACE the Next button selector section with this code:
      console.log(
        "Looking for Next button with explicit waiting and debugging"
      );
      // Take screenshot before looking for button
      await page.screenshot({ path: "before-next-button.png" });

      // First wait to make sure page is fully loaded
      await page.waitForTimeout(2000);

      // Print HTML of the area that should contain the button
      const buttonHTML = await page.evaluate(() => {
        return document.body.innerHTML;
      });
      console.log("Page HTML snippet:", buttonHTML.substring(0, 500) + "...");

      // Try different methods to find and click the Next button
      try {
        // Method 1: Try to find by text content
        await page.waitForTimeout(1000);
        const nextButtonByText = await page.$(
          'div[role="button"]:text("Next")'
        );
        if (nextButtonByText) {
          console.log("Found Next button by text");
          await nextButtonByText.click();
        } else {
          // Method 2: Try explicit XPath
          console.log("Trying XPath");
          const nextButtonByXPath = await page.$(
            'xpath=//div[contains(text(), "Next") and @role="button"]'
          );
          if (nextButtonByXPath) {
            console.log("Found Next button by XPath");
            await nextButtonByXPath.click();
          } else {
            // Method 3: Try data-testid
            console.log("Trying data-testid");
            const nextButtonByTestId = await page.$(
              '[data-testid="auth_next_button"], [data-testid="login_next_button"]'
            );
            if (nextButtonByTestId) {
              console.log("Found Next button by data-testid");
              await nextButtonByTestId.click();
            } else {
              // Method 4: Try any visible button
              console.log("Trying any visible button");
              const anyButton = await page.$(
                'button:visible, div[role="button"]:visible'
              );
              if (anyButton) {
                console.log("Found a visible button");
                await anyButton.click();
              } else {
                throw new Error("Could not find any button to proceed");
              }
            }
          }
        }

        console.log("Clicked a button to proceed");
        await page.waitForTimeout(2000);
      } catch (btnError) {
        console.error("Button click error:", btnError.message);
        await page.screenshot({ path: "button-error.png" });
        throw new Error("Failed to click Next button: " + btnError.message);
      }

      // Take screenshot after clicking Next
      await page.screenshot({ path: "after-next-button.png" });
      console.log("Waiting for password field to appear");

      // Give the page more time to load the password field
      await page.waitForTimeout(3000);

      // Take another screenshot to see what's on screen
      await page.screenshot({ path: "before-password-field.png" });

      // Log current page content for debugging
      const pageContent = await page.content();
      console.log(
        "Current page HTML snippet:",
        pageContent.substring(0, 500) + "..."
      );

      await page.waitForTimeout(2000);

      // Check for verification step (might be needed for some accounts)
      const verificationRequired = await page
        .$$('input[data-testid="ocfEnterTextTextInput"]')
        .then((elements) => elements.length > 0)
        .catch(() => false);

      if (verificationRequired) {
        console.log("Verification required, entering username again");
        await page.fill('input[data-testid="ocfEnterTextTextInput"]', username);

        const verifyNextButton = await Promise.race([
          page.waitForSelector('div[role="button"]:has-text("Next")', {
            timeout: 10000,
          }),
          page.waitForSelector('div[data-testid="auth_next_button"]', {
            timeout: 10000,
          }),
        ]).catch(() => null);

        if (verifyNextButton) {
          await verifyNextButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // Try multiple approaches to find the password field with more robust selectors
      try {
        // Expanded list of possible password field selectors
        const passwordSelectors = [
          'input[name="password"]',
          'input[type="password"]',
          'input[autocomplete="current-password"]',
          'input[data-testid="ocfPasswordInput"]',
          'input[data-testid="password-field"]',
          'input[placeholder*="password" i]',
          'input:below(:text("Password"))',
          'input:below(label:has-text("Password"))',
        ];

        console.log("Trying to find password field with multiple selectors");

        // Try each selector with a timeout
        let passwordInput = null;
        for (const selector of passwordSelectors) {
          console.log(`Trying selector: ${selector}`);
          passwordInput = await page.$(selector).catch(() => null);
          if (passwordInput) {
            console.log(`Found password field with selector: ${selector}`);
            break;
          }
        }

        // If still not found, try a more aggressive approach with evaluation
        if (!passwordInput) {
          console.log("Trying JavaScript evaluation to find password field");
          passwordInput = await page.evaluate(async () => {
            // Try to find any input that might be a password field
            const passwordInput = Array.from(document.querySelectorAll("input"));
            await page.waitForSelector('text=Enter your password', { timeout: 15000 });


            if (passwordInput) {
              // Mark it so we can find it with a unique attribute
              passwordInput.setAttribute("data-found-pw", "true");
              return true;
            }
            return false;
          });

          if (passwordInput) {
            passwordInput = await page.$('[data-found-pw="true"]');
            console.log("Found password field via JS evaluation");
          }
        }

        if (!passwordInput) {
          await page.screenshot({ path: "password-not-found.png" });
          throw new Error(
            "Could not find password input field after multiple attempts"
          );
        }

        console.log("Found password field, entering password");
        await passwordInput.fill(password);
        await page.waitForTimeout(1000);
      } catch (passwordError) {
        console.error("Password field error:", passwordError.message);
        await page.screenshot({ path: "password-error.png" });
        throw new Error(
          "Could not find password input field: " + passwordError.message
        );
      }

      // Look for login button with multiple possible selectors
      const loginButton = await Promise.race([
        page.waitForSelector('div[role="button"]:has-text("Log in")', {
          timeout: 10000,
        }),
        page.waitForSelector('div[data-testid="LoginForm_Login_Button"]', {
          timeout: 10000,
        }),
        page.waitForSelector('button[type="submit"]', { timeout: 10000 }),
      ]).catch(() => null);

      if (!loginButton) {
        await page.screenshot({ path: "login-button-not-found.png" });
        throw new Error("Could not find Login button");
      }

      await loginButton.click();
      console.log("Clicked Login button");

      // Wait for successful login by checking for home elements
      const loginSuccessful = await Promise.race([
        page
          .waitForSelector('[data-testid="AppTabBar_Home_Link"]', {
            timeout: 20000,
          })
          .then(() => true),
        page
          .waitForSelector('[data-testid="primaryColumn"]', { timeout: 20000 })
          .then(() => true),
        page.waitForTimeout(15000).then(() => false),
      ]);

      if (!loginSuccessful) {
        await page.screenshot({ path: "login-failed.png" });
        throw new Error(
          "Login might have failed - could not find home page elements"
        );
      }

      console.log("Login successful");
    } catch (loginError) {
      await page.screenshot({ path: "login-error.png" });
      await browser.close();
      return NextResponse.json(
        {
          success: false,
          error: `Login failed: ${loginError.message}`,
        },
        { status: 401 }
      );
    }

    // Go to the followers page of the target account
    console.log(`Navigating to ${twitterHandle}'s followers page`);
    try {
      await page.goto(`https://twitter.com/${twitterHandle}/followers`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    } catch (navError) {
      await browser.close();
      return NextResponse.json(
        {
          success: false,
          error: `Failed to navigate to followers page: ${navError.message}`,
        },
        { status: 500 }
      );
    }

    // Take screenshot of followers page for debugging
    await page.screenshot({ path: "followers-page.png" });

    // Check if account exists or is private
    const content = await page.content();
    if (
      content.includes("This account doesn't exist") ||
      content.includes("Account suspended") ||
      content.includes("These posts are protected")
    ) {
      await browser.close();
      return NextResponse.json({
        success: false,
        error: "Account not accessible, private, or does not exist",
      });
    }

    // Extract follower count from page - try multiple possible selectors
    let followerCount = 0;
    try {
      const followerCountText = await Promise.race([
        page.$eval('a[href$="/followers"] span', (el) => el.textContent || "0"),
        page.$eval(
          '[data-testid="followers"] span',
          (el) => el.textContent || "0"
        ),
        page.$eval(
          '[data-testid*="follower"] span',
          (el) => el.textContent || "0"
        ),
      ]).catch(() => "0");

      const match = followerCountText.match(/(\d+(\.\d+)?)(K|M|B)?/i);
      if (match) {
        let count = parseFloat(match[1]);
        const unit = match[3]?.toUpperCase();
        if (unit === "K") count *= 1000;
        else if (unit === "M") count *= 1000000;
        else if (unit === "B") count *= 1000000000;
        followerCount = Math.round(count);
      }
      console.log(`Follower count: ${followerCount}`);
    } catch (error) {
      console.log("Couldn't extract follower count:", error.message);
    }

    // Scroll to load followers (Twitter loads them dynamically)
    console.log(`Starting to collect up to ${maxFollowers} followers`);
    let followers = [];
    let previousHeight = 0;
    let attempts = 0;
    const maxAttempts = 15;

    while (followers.length < maxFollowers && attempts < maxAttempts) {
      // Extract visible followers with updated selectors
      const newFollowers = await page.evaluate(() => {
        // Try multiple possible selectors for follower cells
        const selectors = [
          '[data-testid="cellInnerDiv"] [data-testid="UserCell"]',
          '[data-testid="UserCell"]',
          '[data-testid*="follower"] [role="article"]',
        ];

        let followerElements = [];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            followerElements = Array.from(elements);
            break;
          }
        }

        return followerElements
          .map((element) => {
            try {
              // Multiple possible selectors for each piece of information
              const userHandleSelectors = [
                'div[dir="ltr"] span',
                '[data-testid="User-Name"] [data-testid="screenName"]',
                '[data-testid="User-Name"] span:nth-child(2)',
              ];

              const nameSelectors = [
                'div[data-testid="User-Name"] > div:first-child > div:first-child > span',
                '[data-testid="User-Name"] span:first-child',
                '[data-testid="author-name"]',
              ];

              const bioSelectors = [
                'div[data-testid="UserCell"] > div:nth-child(2) > div:nth-child(2)',
                '[data-testid="UserDescription"]',
                "div:nth-child(3):not([role])",
              ];

              // Try each selector in order until we find a match
              let username = "";
              for (const selector of userHandleSelectors) {
                const el = element.querySelector(selector);
                if (el) {
                  username = el.textContent.replace("@", "");
                  break;
                }
              }

              let displayName = "";
              for (const selector of nameSelectors) {
                const el = element.querySelector(selector);
                if (el) {
                  displayName = el.textContent;
                  break;
                }
              }

              let bio = "";
              for (const selector of bioSelectors) {
                const el = element.querySelector(selector);
                if (el) {
                  bio = el.textContent;
                  break;
                }
              }

              // Get avatar
              const avatarElement = element.querySelector(
                'img[src*="profile_images"]'
              );
              const avatar = avatarElement
                ? avatarElement.getAttribute("src")
                : "";

              // Get join date
              const joinedElement = element.querySelector(
                'span[data-testid="UserJoinDate"]'
              );
              const joinDate = joinedElement ? joinedElement.textContent : "";

              return {
                username,
                displayName,
                bio,
                avatar,
                joinDate,
              };
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);
      });

      // Keep only unique followers based on username
      const uniqueFollowers = newFollowers.filter(
        (newFollower) =>
          newFollower.username &&
          !followers.some(
            (existingFollower) =>
              existingFollower.username === newFollower.username
          )
      );

      followers = [...followers, ...uniqueFollowers].slice(0, maxFollowers);
      console.log(`Fetched ${followers.length}/${maxFollowers} followers`);

      if (followers.length >= maxFollowers) break;

      // Scroll down
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForTimeout(2000); // Wait for new content to load

      const currentHeight = await page.evaluate("document.body.scrollHeight");
      if (currentHeight === previousHeight) {
        attempts++;
        console.log(
          `No new content loaded, attempt ${attempts}/${maxAttempts}`
        );
      } else {
        attempts = 0;
      }
    }

    await browser.close();

    return NextResponse.json({
      success: true,
      handle: twitterHandle,
      followerCount,
      followers,
      totalFetched: followers.length,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch followers: " + error.message,
      },
      { status: 500 }
    );
  }
}
