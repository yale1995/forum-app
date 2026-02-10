import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With a nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentusername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "ExactCaseUser",
            email: "exact-case-user@example.com",
            password: "exact-case-user-password",
          }),
        },
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

    test("With duplicated 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username-1",
          email: "username-1@example.com",
          password: "username-1-password",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username-2",
          email: "username-2@example.com",
          password: "username-2-password",
        }),
      });

      expect(user2Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/username-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "username-2",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize um username diferente para esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const email1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email-1",
          email: "email-1@example.com",
          password: "email-1-password",
        }),
      });

      expect(email1Response.status).toBe(201);

      const email2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email-2",
          email: "email-2@example.com",
          password: "email-2-password",
        }),
      });

      expect(email2Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email-2@example.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize um email diferente para realizar a operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const uniqueUsernameResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique-username-1",
            email: "unique-username-1@example.com",
            password: "unique-username-1-password",
          }),
        },
      );

      expect(uniqueUsernameResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique-username-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique-username-2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "unique-username-2",
        email: "unique-username-1@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const uniqueEmailResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique-email-1",
            email: "unique-email-1@example.com",
            password: "unique-email-1-password",
          }),
        },
      );

      expect(uniqueEmailResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique-email-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "unique-email-2@example.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "unique-email-1",
        email: "unique-email-2@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const newPasswordResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "new-password-1",
            email: "new-password-1@example.com",
            password: "new-password-1-password",
          }),
        },
      );

      expect(newPasswordResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/new-password-1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "new-password-2-password",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "new-password-1",
        email: "new-password-1@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("new-password-1");
      const correctPasswordMatch = await password.compare(
        "new-password-2-password",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
    });
  });
});
