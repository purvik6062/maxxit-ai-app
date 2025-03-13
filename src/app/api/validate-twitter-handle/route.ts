// app/api/validate-twitter-handle/route.ts
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let browser = null;
  
  try {
    const { handle } = await request.json();
    
    if (!handle) {
      return NextResponse.json({ message: 'Twitter handle is required' }, { status: 400 });
    }
    
    const username = handle.startsWith('@') ? handle.substring(1) : handle;
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Optimize performance
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      // Block images, fonts, stylesheets to speed up loading
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'stylesheet') {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
    
    // Navigate with a more lenient loading strategy
    let pageExists = true;
    
    try {
      await page.goto(`https://twitter.com/${username}`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
    } catch (error) {
      // Check if this is a 404 error
      const url = page.url();
      if (url.includes('twitter.com/404') || url.includes('twitter.com/account/suspended')) {
        pageExists = false;
      } else {
        // For other errors, we might still be able to check the page content
        console.warn('Navigation issue but continuing analysis:');
      }
    }
    
    // If we already know the page doesn't exist, return early
    if (!pageExists) {
      await browser.close();
      return NextResponse.json({ exists: false });
    }
    
    // Wait for either error message or profile content to appear
    try {
      await Promise.race([
        page.waitForSelector('[data-testid="UserName"]', { timeout: 5000 }),
        page.waitForSelector('[data-testid="error-detail"]', { timeout: 5000 }),
        page.waitForSelector('[data-testid="emptyState"]', { timeout: 5000 })
      ]);
    } catch (error) {
      // If timeout occurs, we'll just use what's available on the page
      console.warn('Selector wait timeout, continuing with analysis');
    }
    
    // Check for error indicators
    const errorElement = await page.$('[data-testid="error-detail"]');
    const emptyState = await page.$('[data-testid="emptyState"]');
    const userNameElement = await page.$('[data-testid="UserName"]');
    
    const exists = !errorElement && !emptyState && userNameElement;
    
    await browser.close();
    browser = null;
    
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Error validating Twitter handle:', error);
    return NextResponse.json(
      { message: 'Error validating Twitter handle', error: String(error) }, 
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}