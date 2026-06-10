import { test, expect } from "@playwright/test";

/**
 * E2E test: Login flow.
 * Verifies the login page loads, form is accessible, and submission works.
 */
test.describe("Authentication", () => {
  test("login page should be accessible and functional", async ({
    page,
  }) => {
    await page.goto("/login");

    // Check page title
    await expect(page).toHaveTitle(/CarbonLens/);

    // Check form elements are present and accessible
    const emailInput = page.getByLabel("Email");
    const passwordInput = page.getByLabel("Password");
    const submitButton = page.getByRole("button", { name: "Sign in" });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Check keyboard navigation
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(passwordInput).toBeFocused();
  });

  test("register page should validate password requirements", async ({
    page,
  }) => {
    await page.goto("/register");

    const nameInput = page.getByLabel("Name");
    const emailInput = page.getByLabel("Email");
    const passwordInput = page.getByLabel("Password");

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check password hint text
    await expect(
      page.getByText("At least 8 characters"),
    ).toBeVisible();
  });

  test("should show error for invalid login", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("wrong@test.com");
    await page.getByLabel("Password").fill("WrongPass1");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Should show error message
    await expect(
      page.getByRole("alert"),
    ).toBeVisible({ timeout: 5000 });
  });
});

/**
 * E2E test: Accessibility checks.
 */
test.describe("Accessibility", () => {
  test("login page should have skip link", async ({ page }) => {
    await page.goto("/login");

    // Tab to skip link
    await page.keyboard.press("Tab");
    const skipLink = page.getByText("Skip to main content");
    await expect(skipLink).toBeFocused();
  });

  test("login page should have proper heading structure", async ({
    page,
  }) => {
    await page.goto("/login");

    // Should have exactly one h1-like prominent heading
    const heading = page.getByText("Welcome back");
    await expect(heading).toBeVisible();
  });
});
