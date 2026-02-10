import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await orchestrator.createUser({
        username: "ExactCaseUser",
        email: "exact-case-user@example.com",
        password: "exact-case-user-password",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/ExactCaseUser",
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "ExactCaseUser",
        email: "exact-case-user@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With mismatch case", async () => {
      await orchestrator.createUser({
        username: "MismatchCaseUser",
        email: "mismatch-case-user@example.com",
        password: "mismatch-case-user-password",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/mismatchcaseuser",
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MismatchCaseUser",
        email: "mismatch-case-user@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With nonexistent user", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O usuário informado não existe.",
        action: "Verifique se o usuário existe e tente novamente.",
        status_code: 404,
      });
    });
  });
});
