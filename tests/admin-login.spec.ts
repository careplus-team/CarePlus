import { test, expect } from "@playwright/test";

test.describe("Admin Login Flow", () => {
  // Force Desktop View so "hidden lg:block" elements appear
  test.use({ viewport: { width: 1920, height: 1080 } });

  test.beforeEach(async ({ page }) => {
    // 1. Mock Session Check (Start with NO user logged in)
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ user: null }),
      });
    });

    // 2. Go to the Admin Login Page
    await page.goto("http://localhost:3000/admin/login");
  });

  // TEST 1: UI Verification (FIXED)
  test("should render admin login UI correctly", async ({ page }) => {
    // Check "Secure Admin Access" first (Always visible)
    await expect(
      page.getByRole("heading", { name: /Secure Admin Access/i }),
    ).toBeVisible();

    // FIX: Use Regex (/.../) to ignore newlines/spaces in the React code
    await expect(
      page.getByRole("heading", { name: /Healthcare Administrator/i }),
    ).toBeVisible();

    // Check Inputs (Using Placeholders to avoid Label/Icon issues)
    await expect(page.getByPlaceholder("admin@careplus.com")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Sign In as Administrator" }),
    ).toBeVisible();
  });

  // TEST 2: Happy Path (Real Admin Login)
  test("should login successfully if user is an Admin", async ({ page }) => {
    // Mock "Check Admin" API
    await page.route("**/api/check-admin", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ isAdmin: true }),
      });
    });

    // Mock Supabase Auth
    await page.route("**/auth/v1/token?grant_type=password", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: "fake_admin_token",
          user: { id: "admin_id", email: "admin@careplus.com" },
        }),
      });
    });

    // Use Placeholders
    await page
      .getByPlaceholder("admin@careplus.com")
      .fill("admin@careplus.com");
    await page.getByPlaceholder("Enter your password").fill("AdminPass123!");

    await page
      .getByRole("button", { name: "Sign In as Administrator" })
      .click();

    // Verify Redirect
    await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });
    // Verify Success Toast (Regex for robustness)
    await expect(page.getByText(/Login Successful/i)).toBeVisible();
  });

  // TEST 3: Unauthorized Access
  test("should block login if user is NOT an Admin", async ({ page }) => {
    // Mock "Check Admin" to return FALSE
    await page.route("**/api/check-admin", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ isAdmin: false }),
      });
    });

    await page
      .getByPlaceholder("admin@careplus.com")
      .fill("regular_user@gmail.com");
    await page.getByPlaceholder("Enter your password").fill("UserPass123!");

    await page
      .getByRole("button", { name: "Sign In as Administrator" })
      .click();

    await expect(page.getByText(/Unauthorized/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  // TEST 4: Wrong Password
  test("should show error on wrong password", async ({ page }) => {
    await page.route("**/api/check-admin", async (route) => {
      await route.fulfill({ body: JSON.stringify({ isAdmin: true }) });
    });

    await page.route("**/auth/v1/token?grant_type=password", async (route) => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ error_message: "Invalid login credentials" }),
      });
    });

    await page
      .getByPlaceholder("admin@careplus.com")
      .fill("admin@careplus.com");
    await page.getByPlaceholder("Enter your password").fill("WrongPass");

    await page
      .getByRole("button", { name: "Sign In as Administrator" })
      .click();

    await expect(
      page.getByText(/Login Failed|Invalid login credentials/i),
    ).toBeVisible();
  });
});
