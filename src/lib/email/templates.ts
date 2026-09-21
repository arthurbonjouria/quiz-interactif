import { LOGO_BLANC_ROSE_BASE64 } from "./logo-base64";

const wrapper = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#F7F7F8;font-family:Arial,Helvetica,sans-serif;color:#0A0A0A;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#0A0A0A;padding:24px 32px;">
                <img src="${LOGO_BLANC_ROSE_BASE64}" alt="BONJOUR IA" height="28" style="display:block;height:28px;width:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#F7F7F8;font-size:12px;color:#666;">
                BONJOUR IA — Cabinet de conseil, formation et application IA.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const credentialsBlock = (email: string, password?: string) =>
  password
    ? `
    <div style="margin:20px 0;padding:16px 20px;background:#F7F7F8;border-radius:8px;">
      <p style="margin:0 0 8px;font-size:13px;color:#666;">
        Retrouvez tous vos cours et vos résultats sur votre espace personnel :
      </p>
      <p style="margin:0 0 4px;font-size:13px;"><strong>Identifiant :</strong> ${email}</p>
      <p style="margin:0 0 12px;font-size:13px;"><strong>Mot de passe :</strong> ${password}</p>
      <a href="${SITE_URL}/student/login" style="display:inline-block;background:#0A0A0A;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:bold;">
        Accéder à mon espace
      </a>
    </div>
  `
    : "";

export function registrationConfirmationEmail(params: {
  firstName: string;
  questionnaireTitle: string;
  studentEmail?: string;
  studentPassword?: string;
}) {
  return wrapper(
    "Votre inscription est confirmée",
    `
    <p>Bonjour ${params.firstName},</p>
    <p>Votre inscription au questionnaire <strong>${params.questionnaireTitle}</strong> a bien été enregistrée.</p>
    ${params.studentEmail ? credentialsBlock(params.studentEmail, params.studentPassword) : ""}
    <p style="font-size:12px;color:#666;margin-top:24px;">
      Conformément au RGPD, les données collectées (nom, prénom, email professionnel, réponses au questionnaire)
      sont utilisées uniquement dans le cadre du suivi de votre parcours de formation par BONJOUR IA et votre employeur,
      et conservées pour la durée nécessaire au suivi qualité (obligations Qualiopi). Vous pouvez exercer vos droits
      d'accès, de rectification ou de suppression en contactant BONJOUR IA.
    </p>
  `
  );
}

export function folderInviteEmail(params: {
  firstName: string;
  folderTitle: string;
  courseTitles: string[];
  email: string;
  password: string;
}) {
  const coursesList = params.courseTitles.map((t) => `<li style="margin-bottom:4px;">${t}</li>`).join("");
  return wrapper(
    "Vos cours sont disponibles",
    `
    <p>Bonjour ${params.firstName},</p>
    <p>Vous avez été inscrit(e) au parcours <strong>${params.folderTitle}</strong>, qui comprend :</p>
    <ul style="font-size:14px;color:#333;padding-left:20px;">${coursesList}</ul>
    ${credentialsBlock(params.email, params.password)}
  `
  );
}

export function certificateEmail(params: {
  firstName: string;
  questionnaireTitle: string;
  score: number;
  gradeOutOf10?: number;
}) {
  const scoreLine =
    params.gradeOutOf10 !== undefined
      ? `Votre note : <strong style="color:#E91E8C;font-size:18px;">${params.gradeOutOf10}/10</strong>`
      : `Votre score final : <strong style="color:#E91E8C;font-size:18px;">${params.score} points</strong>`;

  return wrapper(
    "Votre certificat est prêt",
    `
    <p>Bonjour ${params.firstName},</p>
    <p>Bravo pour avoir complété le questionnaire <strong>${params.questionnaireTitle}</strong> !</p>
    <p>${scoreLine}</p>
    <p>Vous trouverez votre certificat en pièce jointe de cet email.</p>
  `
  );
}
