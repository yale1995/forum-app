import orchestrator from "tests/orchestrator";
import email from "infra/email";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "jerimum card <contato@jerimumcard.com.br>",
      to: "yale850@gmail.com",
      subject: "Teste de assunto",
      text: "Teste de corpo",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@jerimumcard.com.br>");
    expect(lastEmail.recipients[0]).toBe("<yale850@gmail.com>");
    expect(lastEmail.subject).toBe("Teste de assunto");
    expect(lastEmail.text).toBe("Teste de corpo\n");
  });
});
