import { test, expect } from "@playwright/test";

test.describe("User Signup Flow", () => {
  test.beforeEach(async ({ page }) => {
    // FIX 1: Full URL
    await page.goto("http://localhost:3000/signup");
  });

  // TEST 1: Check if all fields are visible
  test("should render all signup fields correctly", async ({ page }) => {
    // FIX 2: Use { exact: true } to distinguish "Name" from "Username"
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Mobile Number")).toBeVisible();
    await expect(page.getByLabel("Address")).toBeVisible();
    await expect(page.getByLabel("Date Of Birth")).toBeVisible();
    await expect(page.getByLabel("Gender")).toBeVisible();
    // { exact: true } is also needed here for Password vs Confirm Password
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
  });

  // TEST 2: Validation Errors
  test("should show validation errors for empty submission", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sign Up" }).click();

    const errorMsg = page
      .getByText(/String must contain at least|Required/i)
      .first();
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });

  // TEST 3: Happy Path (Mocked)
  test("should successfully register a user (Mocked)", async ({ page }) => {
    // --- MOCK SUPABASE AUTH ---
    await page.route("**/auth/v1/signup", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "fake_user_id_123",
            aud: "authenticated",
            role: "authenticated",
            email: "testuser@careplus.com",
            user_metadata: { email: "testuser@careplus.com" },
          },
          session: null,
        }),
      });
    });

    // --- MOCK SUPABASE DB ---
    await page.route("**/rest/v1/user", async (route) => {
      const postData = route.request().postDataJSON();
      console.log("✅ DATA SENT TO DB:", postData);
      await route.fulfill({
        status: 201,
        body: JSON.stringify(postData),
      });
    });

    // --- FILL THE FORM ---
    // FIX 2 APPLIED HERE TOO
    await page.getByLabel("Name", { exact: true }).fill("John Doe");
    await page.getByLabel("Email").fill("testuser@careplus.com");
    await page.getByLabel("Username").fill("johndoe123");
    await page.getByLabel("Mobile Number").fill("1234567890");
    await page.getByLabel("Address").fill("123 Health St");
    await page.getByLabel("Date Of Birth").fill("1995-05-15");
    await page.getByLabel("Gender").selectOption("male");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    // --- SUBMIT ---
    await page.getByRole("button", { name: "Sign Up" }).click();

    // --- VERIFY ---
    const successToast = page.getByText(/Registration Successful/i);
    await expect(successToast).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  // TEST 4: Handle "User Already Exists"
  test("should show error if user already exists", async ({ page }) => {
    await page.route("**/auth/v1/signup", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: "existing_id",
            user_metadata: {}, // Empty metadata triggers error
          },
        }),
      });
    });

    // FIX 2 APPLIED HERE TOO
    await page.getByLabel("Name", { exact: true }).fill("John Doe");
    await page.getByLabel("Email").fill("existing@careplus.com");
    await page.getByLabel("Username").fill("john");
    await page.getByLabel("Mobile Number").fill("000");
    await page.getByLabel("Address").fill("Street");
    await page.getByLabel("Date Of Birth").fill("2000-01-01");
    await page.getByLabel("Gender").selectOption("male");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByText(/Already Exist User/i)).toBeVisible();
  });
});
