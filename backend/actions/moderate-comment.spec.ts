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

const { default: action } = await import("./moderate-comment");

describe("moderate-comment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireBlogUser.mockResolvedValue({ email: "editor@example.com", role: "editor" });
    mocks.getDb.mockReturnValue({
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { id: "comment-123", status: "approved" },
            ]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: "comment-123" },
          ]),
        }),
      }),
    });
  });

  it("approves a pending comment", async () => {
    const result = await action.run({ id: "comment-123", approve: true });

    expect(result).toHaveProperty("status", "approved");
  });

  it("deletes a comment when approve is false", async () => {
    const result = await action.run({ id: "comment-123", approve: false });

    expect(result).toEqual({ deleted: true });
  });

  it("requires editor or admin role", async () => {
    mocks.requireBlogUser.mockResolvedValue({ email: "author@example.com", role: "author" });

    await expect(action.run({ id: "comment-123", approve: true })).rejects.toThrow();
  });

  it("returns error when approving non-existent comment", async () => {
    mocks.getDb.mockReturnValue({
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    await expect(action.run({ id: "comment-123", approve: true })).rejects.toThrow("Comment not found");
  });

  it("returns error when deleting non-existent comment", async () => {
    mocks.getDb.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    await expect(action.run({ id: "comment-123", approve: false })).rejects.toThrow("Comment not found");
  });

  it("validates comment ID is a valid UUID", async () => {
    await expect(action.run({ id: "not-a-uuid", approve: true })).rejects.toThrow();
  });
});
