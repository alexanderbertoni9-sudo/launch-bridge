import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const studentEmail = process.env.E2E_STUDENT_EMAIL;
const studentPassword = process.env.E2E_STUDENT_PASSWORD;

test.describe("student and admin venture flow", () => {
  test.skip(
    !adminEmail || !adminPassword || !studentEmail || !studentPassword,
    "E2E admin and student credentials are required.",
  );

  test("student can create venture, fill canvas, request feedback, and admin can read it", async ({
    page,
    browser,
  }) => {
    const unique = Date.now();

    await page.goto("/auth");
    await page.getByLabel("Role").selectOption("STUDENT");
    await page.getByLabel("Email").fill(studentEmail as string);
    await page.getByLabel("Password").fill(studentPassword as string);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/student/);
    await page.getByRole("link", { name: "New Venture" }).click();

    await page.getByLabel("Venture Title").fill(`Venture ${unique}`);
    await page.getByLabel("Idea").fill("An app helping students validate startup ideas quickly.");
    await page.getByRole("button", { name: "Create and Open Canvas" }).click();

    await expect(page).toHaveURL(/\/student\/ventures\/.*\/canvas/);
    await page.getByLabel("Problem").fill("Students struggle to validate ideas quickly.");
    await page.getByLabel("Customer Segments").fill("Student founders");
    await page.getByLabel("Unique Value Proposition").fill("Fast validation loops");
    await page.getByRole("button", { name: "Save Canvas" }).click();

    await page.getByRole("link", { name: "Feedback" }).click();
    await page.getByRole("button", { name: "Request Feedback" }).click();
    await expect(page.getByText("New feedback entry saved")).toBeVisible();

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/auth?role=ADMIN");
    await adminPage.getByLabel("Role").selectOption("ADMIN");
    await adminPage.getByLabel("Email").fill(adminEmail as string);
    await adminPage.getByLabel("Password").fill(adminPassword as string);
    await adminPage.getByRole("button", { name: "Login" }).click();

    await expect(adminPage).toHaveURL(/\/admin/);
    await adminPage.getByRole("link", { name: "Open" }).first().click();
    await expect(adminPage.getByRole("heading", { name: /Venture/ })).toBeVisible();

    await adminContext.close();
  });
});
