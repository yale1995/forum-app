import database from "infra/database";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  const { query } = database;
  await query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

test("GET to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  expect(response.status).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body)).toEqual(true);
  expect(body.length).toBeGreaterThan(0);
});
