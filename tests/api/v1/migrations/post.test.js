import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Retrieving pending migrations", () => {
      test("For first time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(201);

        const body = await response.json();
        expect(Array.isArray(body)).toEqual(true);
        expect(body.length).toBeGreaterThan(0);
      });

      test("For second time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(Array.isArray(body)).toEqual(true);
        expect(body.length).toBe(0);
      });
    });
  });
});
