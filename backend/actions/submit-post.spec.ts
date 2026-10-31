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

const { default: action } = await import("./submit-post");

describe("submit-post", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireBlogUser.mockResolvedValue({ email: "author@example.com", role: "author" });
    mocks.getDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "123", status: "draft", authorEmail: "author@example.com" },
            ]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { id: "123", status: "in_review" },
            ]),
          }),
        }),
      }),
    });
  });

  it("submits a draft post for review", async () => {
    const result = await action.run({ id: "123" });

    expect(result).toHaveProperty("status", "in_review");
  });

  it("requires authentication", async () => {
    mocks.requireBlogUser.mockRejectedValue(new Error("Not authenticated"));

    await expect(action.run({ id: "123" })).rejects.toThrow("Not authenticated");
  });

  it("allows authors to submit their own posts", async () => {
    mocks.requireBlogUser.mockResolvedValue({ email: "author@example.com", role: "author" });

    const result = await action.run({ id: "123" });

    expect(result).toHaveProperty("status", "in_review");
  });

  it("prevents authors from submitting others' posts", async () => {
    mocks.requireBlogUser.mockResolvedValue({ email: "other@example.com", role: "author" });
    mocks.getDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "123", status: "draft", authorEmail: "author@example.com" },
            ]),
          }),
        }),
      }),
    });

    await expect(action.run({ id: "123" })).rejects.toThrow();
  });

  it("only allows draft posts to be submitted", async () => {
    mocks.getDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "123", status: "published", authorEmail: "author@example.com" },
            ]),
          }),
        }),
      }),
    });

    await expect(action.run({ id: "123" })).rejects.toThrow();
  });

  it("validates post ID is a valid UUID", async () => {
    await expect(action.run({ id: "not-a-uuid" })).rejects.toThrow();
  });
});
