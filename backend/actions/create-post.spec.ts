import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireBlogUser: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("../server/blog-auth.js", () => ({
  requireBlogUser: mocks.requireBlogUser,
}));

vi.mock("../server/db.js", () => ({
  getDb: mocks.getDb,
}));

const { default: action } = await import("./create-post");

describe("create-post", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireBlogUser.mockResolvedValue({ email: "author@example.com", role: "author" });
    mocks.getDb.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: "123", title: "Test Post", slug: "test-post-abc123" },
          ]),
        }),
      }),
    });
  });

  it("creates a draft post with valid input", async () => {
    const result = await action.run({
      title: "Test Post",
      markdown: "## Hello\n\nThis is a test.",
      tags: "test,demo",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title", "Test Post");
    expect(result).toHaveProperty("status", "draft");
  });

  it("generates a slug from the title", async () => {
    const result = await action.run({
      title: "My Amazing Story",
      markdown: "Content here",
      tags: "",
    });

    expect(result.slug).toMatch(/my-amazing-story-[a-f0-9]{6}/);
  });

  it("requires authentication", async () => {
    mocks.requireBlogUser.mockRejectedValue(new Error("Not authenticated"));

    await expect(
      action.run({ title: "Test", markdown: "", tags: "" })
    ).rejects.toThrow("Not authenticated");
  });

  it("validates title is not empty", async () => {
    await expect(
      action.run({ title: "", markdown: "", tags: "" })
    ).rejects.toThrow();
  });

  it("validates title max length", async () => {
    await expect(
      action.run({ title: "a".repeat(121), markdown: "", tags: "" })
    ).rejects.toThrow();
  });

  it("validates markdown max length", async () => {
    await expect(
      action.run({ title: "Test", markdown: "a".repeat(30001), tags: "" })
    ).rejects.toThrow();
  });
});
