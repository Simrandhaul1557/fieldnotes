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

const { default: action } = await import("./review-post");

describe("review-post", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireBlogUser.mockResolvedValue({ email: "editor@example.com", role: "editor" });
    mocks.getDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "123", status: "in_review" },
            ]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { id: "123", status: "published" },
            ]),
          }),
        }),
      }),
    });
  });

  it("publishes a reviewed post immediately", async () => {
    const result = await action.run({ id: "123" });

    expect(result).toHaveProperty("status", "published");
    expect(result).toHaveProperty("publishedAt");
  });

  it("schedules a post for future publication", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = await action.run({ id: "123", scheduledAt: futureDate });

    expect(result).toHaveProperty("status", "scheduled");
    expect(result).toHaveProperty("scheduledAt", futureDate);
  });

  it("requires editor or admin role", async () => {
    mocks.requireBlogUser.mockResolvedValue({ email: "author@example.com", role: "author" });

    await expect(action.run({ id: "123" })).rejects.toThrow();
  });

  it("only allows in_review posts to be published", async () => {
    mocks.getDb.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: "123", status: "draft" },
            ]),
          }),
        }),
      }),
    });

    await expect(action.run({ id: "123" })).rejects.toThrow();
  });

  it("validates scheduled time is in the future", async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();

    await expect(action.run({ id: "123", scheduledAt: pastDate })).rejects.toThrow();
  });

  it("validates post ID is a valid UUID", async () => {
    await expect(action.run({ id: "not-a-uuid" })).rejects.toThrow();
  });
});
