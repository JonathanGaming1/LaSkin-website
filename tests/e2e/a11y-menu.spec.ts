import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const overflow = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('built-in accessibility menu', () => {
  test('opens from the keyboard, toggles adjustments, remembers them and resets', async ({ page }) => {
    await page.goto('/he/');
    const btn = page.getByRole('button', { name: 'תפריט נגישות' });
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.focus();
    await page.keyboard.press('Enter');
    const panel = page.locator('#a11y-panel');
    await expect(panel).toBeVisible();

    const contrast = page.getByRole('button', { name: 'ניגודיות גבוהה' });
    await contrast.click();
    await expect(contrast).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveClass(/a11y-contrast/);

    await page.getByRole('button', { name: 'הגדלת טקסט' }).click();
    await expect(page.locator('html')).toHaveClass(/a11y-fs-1/);
    await expect(page.locator('[data-a11y-level]')).toHaveText('110%');

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(page.locator('.a11y__btn')).toBeFocused();

    // The choice carries over to the next page.
    await page.goto('/he/clinical-studies/');
    await expect(page.locator('html')).toHaveClass(/a11y-contrast/);
    await expect(page.locator('html')).toHaveClass(/a11y-fs-1/);

    await page.locator('.a11y__btn').click();
    await page.getByRole('button', { name: 'איפוס ההתאמות' }).click();
    await expect(page.locator('html')).not.toHaveClass(/a11y-/);
  });

  test('largest text size does not cause horizontal overflow', async ({ page }) => {
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const lang of ['he', 'ar', 'en']) {
        for (const route of ['', 'areas/', 'clinical-studies/']) {
          await page.goto(`/${lang}/${route}`);
          await page.evaluate(() => document.documentElement.classList.add('a11y-fs-3', 'a11y-font', 'a11y-links'));
          expect(await overflow(page), `/${lang}/${route} at ${width}px`).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  test('high-contrast mode and the open menu pass axe', async ({ page }) => {
    await page.goto('/he/');
    await page.locator('.a11y__btn').click();
    await page.getByRole('button', { name: 'ניגודיות גבוהה' }).click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
  });
});

test('Instagram is linked from the header, the contact card and the footer', async ({ page }) => {
  await page.goto('/he/');
  const links = page.locator('a[href="https://www.instagram.com/la_skin_5"]');
  await expect(links).toHaveCount(4); // header icon, mobile menu, contact card, footer
  await expect(page.getByRole('link', { name: 'La Skin באינסטגרם' }).first()).toBeVisible();
});

test('name and phone inputs sit on the same line on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const lang of ['he', 'ar', 'en']) {
    await page.goto(`/${lang}/`);
    const a = await page.locator('#lead-name').boundingBox();
    const b = await page.locator('#lead-phone').boundingBox();
    expect(Math.abs(a!.y - b!.y), lang).toBeLessThan(1);
  }
});
