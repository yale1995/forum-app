import database from "infra/database";
import email from "infra/email";
import { ForbiddenError, NotFoundError } from "infra/errors";
import webserber from "infra/webserver";
import authorization from "models/authorization";
import user from "models/user";

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 15; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

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

async function findOneValidById(tokenId) {
  const newToken = await runSelectQuery(tokenId);
  return newToken;

  async function runSelectQuery(tokenId) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      ORDER BY
        created_at DESC
      LIMIT 1`,
      values: [tokenId],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return result.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedToken = await runUpdateQuery(activationTokenId);
  return usedToken;

  async function runUpdateQuery(activationTokenId) {
    const result = await database.query({
      text: `
        UPDATE 
          user_activation_tokens
        SET 
          used_at = timezone('UTC', NOW()),
          updated_at = timezone('UTC', NOW())
        WHERE 
          id = $1
        RETURNING 
          *`,
      values: [activationTokenId],
    });

    return result.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILISECONDS,
};

export default activation;
