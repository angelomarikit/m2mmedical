import { test, expect } from '@playwright/test'

test('home loads and navigates to products', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Medical Equipment/i })).toBeVisible()
  await page.getByRole('link', { name: 'Products', exact: true }).first().click()
  await expect(page).toHaveURL(/\/products/)
  await expect(page.getByRole('heading', { name: /Product Catalog/i })).toBeVisible()
})

test('contact page shows verified phone', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.locator('#main-content').getByRole('link', { name: '+632-8639-5622' })).toBeVisible()
})
