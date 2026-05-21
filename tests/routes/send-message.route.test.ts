import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDbConnect, mockFindOne } = vi.hoisted(() => ({
  mockDbConnect: vi.fn(),
  mockFindOne: vi.fn(),
}));

vi.mock("@/src/lib/dbConnect", () => ({
  default: mockDbConnect,
}));

vi.mock("@/src/model/User", () => ({
  default: {
    findOne: mockFindOne,
  },
}));

import { POST } from "@/src/app/api/send-message/route";

function createRequest(body: object | string) {
  return new Request("http://localhost/api/send-message", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/send-message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed JSON before connecting to the database", async () => {
    const response = await POST(createRequest("{"));
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      success: false,
      message: "Invalid request body",
    });
    expect(mockDbConnect).not.toHaveBeenCalled();
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it("rejects invalid message content with a 400", async () => {
    const response = await POST(
      createRequest({
        username: "valid_user",
        content: "short",
      })
    );
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      success: false,
      message: "Content must be at least of 10 characters",
    });
    expect(mockDbConnect).not.toHaveBeenCalled();
  });

  it("returns 404 when the recipient user does not exist", async () => {
    mockFindOne.mockResolvedValueOnce(null);

    const response = await POST(
      createRequest({
        username: "valid_user",
        content: "This is a valid anonymous message.",
      })
    );
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(404);
    expect(payload).toEqual({
      success: false,
      message: "User not found",
    });
    expect(mockDbConnect).toHaveBeenCalledOnce();
    expect(mockFindOne).toHaveBeenCalledWith({ username: "valid_user" });
  });

  it("stores a message when the target user accepts messages", async () => {
    const push = vi.fn();
    const save = vi.fn().mockResolvedValue(undefined);

    mockFindOne.mockResolvedValueOnce({
      isAcceptingMessage: true,
      message: { push },
      save,
    });

    const response = await POST(
      createRequest({
        username: "valid_user",
        content: "This is a valid anonymous message.",
      })
    );
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      message: "Message sent successfully",
    });
    expect(push).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith({
      content: "This is a valid anonymous message.",
      createdAt: expect.any(Date),
    });
    expect(save).toHaveBeenCalledOnce();
  });
});
