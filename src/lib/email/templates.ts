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

export function registrationConfirmationEmail(params: { firstName: string; questionnaireTitle: string }) {
  return wrapper(
    "Votre inscription est confirmée",
    `
    <p>Bonjour ${params.firstName},</p>
    <p>Votre inscription au questionnaire <strong>${params.questionnaireTitle}</strong> a bien été enregistrée.</p>
    <p style="font-size:12px;color:#666;margin-top:24px;">
      Conformément au RGPD, les données collectées (nom, prénom, email professionnel, réponses au questionnaire)
      sont utilisées uniquement dans le cadre du suivi de votre parcours de formation par BONJOUR IA et votre employeur,
      et conservées pour la durée nécessaire au suivi qualité (obligations Qualiopi). Vous pouvez exercer vos droits
      d'accès, de rectification ou de suppression en contactant BONJOUR IA.
    </p>
  `
  );
}

export function certificateEmail(params: {
  firstName: string;
  questionnaireTitle: string;
  score: number;
}) {
  return wrapper(
    "Votre certificat est prêt",
    `
    <p>Bonjour ${params.firstName},</p>
    <p>Bravo pour avoir complété le questionnaire <strong>${params.questionnaireTitle}</strong> !</p>
    <p>Votre score final : <strong style="color:#E91E8C;font-size:18px;">${params.score} points</strong></p>
    <p>Vous trouverez votre certificat en pièce jointe de cet email.</p>
  `
  );
}
