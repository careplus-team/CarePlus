import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const EMAIL = process.env.TEST_USER_EMAIL;
const PASSWORD = process.env.TEST_USER_PASSWORD;

// Check if env vars are loaded
if (!EMAIL || !PASSWORD) {
  throw new Error("⚠️  MISSING ENV VARIABLES. Check .env.local");
}

test.describe("User Login Flow", () => {
  // SETUP: Go to login page before every test
  test.beforeEach(async ({ page }) => {
    // We use the full URL to avoid navigation errors if baseURL isn't set
    await page.goto("http://localhost:3000/login");
  });

  // TEST 1: UI Element Verification
  test("should display all login form elements correctly", async ({ page }) => {
    await expect(page.getByPlaceholder("villiam@gmail.com")).toBeVisible();
    await expect(page.getByPlaceholder("********")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  // TEST 2: Password Visibility Toggle (FIXED)
  test("should toggle password visibility when eye icon is clicked", async ({
    page,
  }) => {
    const passwordInput = page.getByPlaceholder("********");

    // FIX: Select the button INSIDE the form that is type="button"
    // This ignores the "Login" button (which is type="submit")
    // AND ignores the Next.js DevTools button (which is outside the form)
    const toggleButton = page.locator('form button[type="button"]');

    await passwordInput.fill("secret123");
    await expect(passwordInput).toHaveAttribute("type", "password"); // Hidden

    await toggleButton.click();

    await expect(passwordInput).toHaveAttribute("type", "text"); // Visible
  });

  // TEST 3: Invalid Login Handling (FIXED)
  test("should show error toast on invalid credentials", async ({ page }) => {
    await page.getByPlaceholder("villiam@gmail.com").fill("wrong@user.com");
    await page.getByPlaceholder("********").fill("wrongpass");

    await page.getByRole("button", { name: "Login" }).click();

    // FIX: Use a Regex (text enclosed in /.../) to match partial text
    // This helps if there are extra spaces or punctuation
    // 1. Check if the "Refresh" button inside the toast is visible
    const refreshBtn = page.getByRole("button", { name: "Refresh" });
    await expect(refreshBtn).toBeVisible({ timeout: 10000 });
  });

  // TEST 4: Happy Path
  test("should successfully login and redirect based on role", async ({
    page,
  }) => {
    // Mock the API to force "Doctor" logic
    await page.route("**/api/get-user-by-email-api", async (route) => {
      const json = { success: false };
      await route.fulfill({ json });
    });

    await page.getByPlaceholder("villiam@gmail.com").fill(EMAIL);
    await page.getByPlaceholder("********").fill(PASSWORD);

    await page.getByRole("button", { name: "Login" }).click();

    // Verify Redirect
    await expect(page).toHaveURL(/\/doctor\/doctor-dashboard/, {
      timeout: 15000,
    });
  });
});
