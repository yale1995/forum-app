import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await cleanDatabase();
});

async function cleanDatabase() {
  const { query } = database;
  await query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

test("POST to /api/v1/migrations should return 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response1.status).toBe(201);

  const body1 = await response1.json();
  expect(Array.isArray(body1)).toEqual(true);
  expect(body1.length).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response2.status).toBe(200);

  const body2 = await response2.json();
  expect(Array.isArray(body2)).toEqual(true);
  expect(body2.length).toBe(0);
});
