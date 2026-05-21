import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDbConnect, mockFindOne, mockHash, mockSave, UserModelMock } = vi.hoisted(() => {
  const hoistedMockDbConnect = vi.fn();
  const hoistedMockFindOne = vi.fn();
  const hoistedMockHash = vi.fn();
  const hoistedMockSave = vi.fn();
  const hoistedUserModelMock = vi.fn(function (this: unknown, data: Record<string, unknown>) {
    return {
      ...data,
      save: hoistedMockSave,
    };
  });

  Object.assign(hoistedUserModelMock, {
    findOne: hoistedMockFindOne,
  });

  return {
    mockDbConnect: hoistedMockDbConnect,
    mockFindOne: hoistedMockFindOne,
    mockHash: hoistedMockHash,
    mockSave: hoistedMockSave,
    UserModelMock: hoistedUserModelMock,
  };
});

vi.mock("@/src/lib/dbConnect", () => ({
  default: mockDbConnect,
}));

vi.mock("@/src/model/User", () => ({
  default: UserModelMock,
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mockHash,
  },
}));

import { POST } from "@/src/app/api/sign-up/route";

function createRequest(body: object | string) {
  return new Request("http://localhost/api/sign-up", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/sign-up", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHash.mockResolvedValue("hashed-password");
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
  });

  it("rejects invalid signup payloads with a 400", async () => {
    const response = await POST(
      createRequest({
        username: "valid_user",
        email: "not-an-email",
        password: "secret123",
      })
    );
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      success: false,
      message: "Please enter a valid email address",
    });
    expect(mockDbConnect).not.toHaveBeenCalled();
  });

  it("returns 400 when the username is already taken by a verified user", async () => {
    mockFindOne.mockResolvedValueOnce({ _id: "user-1" });

    const response = await POST(
      createRequest({
        username: "valid_user",
        email: "user@example.com",
        password: "secret123",
      })
    );
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      success: false,
      message: "Username is already taken",
    });
    expect(mockDbConnect).toHaveBeenCalledOnce();
    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(UserModelMock).not.toHaveBeenCalled();
  });

  it("updates the verification code for an existing unverified email", async () => {
    const existingUser = {
      isVerified: false,
      save: mockSave,
    } as {
      isVerified: boolean;
      save: typeof mockSave;
      verifyCode?: string;
      verifyCodeExpiry?: Date;
    };

    mockFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingUser);

    const response = await POST(
      createRequest({
        username: "valid_user",
        email: "user@example.com",
        password: "secret123",
      })
    );
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      success: true,
      message: "User registered successfully",
    });
    expect(existingUser.verifyCode).toMatch(/^\d{6}$/);
    expect(existingUser.verifyCodeExpiry).toBeInstanceOf(Date);
    expect(mockSave).toHaveBeenCalledOnce();
    expect(mockHash).not.toHaveBeenCalled();
    expect(UserModelMock).not.toHaveBeenCalled();
  });

  it("creates a new user with a hashed password for a valid signup", async () => {
    mockFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const response = await POST(
      createRequest({
        username: "valid_user",
        email: "user@example.com",
        password: "secret123",
      })
    );
    const payload = await response.json() as { message: string; success: boolean };

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      success: true,
      message: "User registered successfully",
    });
    expect(mockHash).toHaveBeenCalledWith("secret123", 10);
    expect(UserModelMock).toHaveBeenCalledOnce();

    const createdUser = UserModelMock.mock.calls[0][0] as Record<string, unknown>;

    expect(createdUser.username).toBe("valid_user");
    expect(createdUser.email).toBe("user@example.com");
    expect(createdUser.password).toBe("hashed-password");
    expect(createdUser.isVerified).toBe(true);
    expect(createdUser.isAcceptingMessage).toBe(true);
    expect(createdUser.message).toEqual([]);
    expect(createdUser.verifyCode).toMatch(/^\d{6}$/);
    expect(createdUser.verifyCodeExpiry).toBeInstanceOf(Date);
    expect(mockSave).toHaveBeenCalledOnce();
  });
});
