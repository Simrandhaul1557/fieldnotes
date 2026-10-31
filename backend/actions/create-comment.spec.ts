import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock("../server/db.js", () => ({
  getDb: mocks.getDb,
}));

const { default: action } = await import("./create-comment");

describe("create-comment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "123", status: "published" },
            ]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: "comment-123", status: "pending" },
          ]),
        }),
      }),
    });
  });

  it("creates a pending comment on a published post", async () => {
    const result = await action.run({
      postId: "123",
      authorName: "Reader",
      body: "Great article!",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("status", "pending");
  });

  it("does not require authentication", async () => {
    const result = await action.run({
      postId: "123",
      authorName: "Reader",
      body: "Great article!",
    });

    expect(result).toHaveProperty("status", "pending");
  });

  it("rejects comments on non-existent posts", async () => {
    mocks.getDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    await expect(
      action.run({ postId: "123", authorName: "Reader", body: "Test" })
    ).rejects.toThrow("Story not found");
  });

  it("validates author name is not empty", async () => {
    await expect(
      action.run({ postId: "123", authorName: "", body: "Test" })
    ).rejects.toThrow();
  });

  it("validates author name max length", async () => {
    await expect(
      action.run({ postId: "123", authorName: "a".repeat(61), body: "Test" })
    ).rejects.toThrow();
  });

  it("validates comment body is not empty", async () => {
    await expect(
      action.run({ postId: "123", authorName: "Reader", body: "" })
    ).rejects.toThrow();
  });

  it("validates comment body max length", async () => {
    await expect(
      action.run({ postId: "123", authorName: "Reader", body: "a".repeat(2001) })
    ).rejects.toThrow();
  });

  it("validates post ID is a valid UUID", async () => {
    await expect(
      action.run({ postId: "not-a-uuid", authorName: "Reader", body: "Test" })
    ).rejects.toThrow();
  });
});
