import webserber from "infra/webserver";
import user from "models/user";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration flow (all successful)", () => {
  let createUserResponseBody;
  let activationTokenId;

  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "new-user@gmail.com",
          username: "new-user",
          password: "new-user-password",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "new-user",
      email: "new-user@gmail.com",
      password: createUserResponseBody.password,
      features: ["read:activation_token"],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    activationTokenId = orchestrator.extractUUID(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserber.origin}/cadastro/ativar/${activationTokenId}`,
    );

    expect(lastEmail.sender).toBe("<contato@forum-app.com>");
    expect(lastEmail.recipients[0]).toBe("<new-user@gmail.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no forum-app");
    expect(lastEmail.text).toContain("new-user");
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("new-user");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {});

  test("Get user information", async () => {});
});
