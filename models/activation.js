import database from "infra/database";
import email from "infra/email";
import webserber from "infra/webserver";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 15; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO 
          user_activation_tokens (user_id, expires_at)
        VALUES 
          ($1, $2)
        RETURNING 
          *`,
      values: [userId, expiresAt],
    });

    return result.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Forum App <contato@forum-app.com>",
    to: user.email,
    subject: "Ative seu cadastro no forum-app",
    text: `Olá, ${user.username}! Clique no link abaixo para ativar sua conta: 
    
${webserber.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe do forum-app`,
  });
}

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const result = await database.query({
      text: `
      SELECT 
        *
      FROM 
        user_activation_tokens
      WHERE 
        user_id = $1
      ORDER BY 
        created_at DESC
      LIMIT 1`,
      values: [userId],
    });

    return result.rows[0];
  }
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
};

export default activation;
