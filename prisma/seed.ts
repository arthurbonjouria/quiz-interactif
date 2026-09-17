import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const QUESTIONS: Array<{
  text: string;
  choices: string[];
  correctIndex: number;
  points?: number;
  timeLimitSec?: number;
}> = [
  {
    text: "Que signifie le sigle « IA Act » ?",
    choices: [
      "Le règlement européen sur l'intelligence artificielle",
      "Une loi française sur les algorithmes",
      "Une norme ISO pour les logiciels",
      "Un label qualité pour les chatbots",
    ],
    correctIndex: 0,
  },
  {
    text: "L'IA Act classe les systèmes d'IA selon :",
    choices: ["Leur prix", "Leur niveau de risque", "Leur langage de programmation", "Leur date de sortie"],
    correctIndex: 1,
  },
  {
    text: "Un système de notation sociale par les autorités publiques est considéré comme :",
    choices: ["À risque limité", "À risque minimal", "Interdit", "À haut risque"],
    correctIndex: 2,
  },
  {
    text: "Les systèmes d'IA utilisés dans le recrutement sont généralement classés :",
    choices: ["Interdits", "À haut risque", "Sans risque", "À risque limité"],
    correctIndex: 1,
  },
  {
    text: "Un chatbot doit informer l'utilisateur qu'il échange avec une IA : c'est une obligation de :",
    choices: ["Sécurité", "Transparence", "Confidentialité", "Performance"],
    correctIndex: 1,
  },
  {
    text: "Qui est responsable de la conformité d'un système d'IA à haut risque avant sa mise sur le marché ?",
    choices: ["L'utilisateur final", "Le fournisseur du système", "L'Union européenne", "Personne"],
    correctIndex: 1,
  },
  {
    text: "Le non-respect de l'IA Act peut entraîner :",
    choices: ["Aucune sanction", "Des amendes pouvant atteindre plusieurs % du CA mondial", "Une simple mise en garde", "La fermeture d'internet"],
    correctIndex: 1,
  },
  {
    text: "Une IA générative comme un assistant de rédaction doit notamment respecter une obligation de :",
    choices: [
      "Interdiction totale d'usage",
      "Transparence sur le contenu généré par IA",
      "Validation par un huissier",
      "Aucune obligation particulière",
    ],
    correctIndex: 1,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("BonjourIA2026!", 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@bonjour-ia.fr" },
    update: {},
    create: { email: "admin@bonjour-ia.fr", name: "Admin BONJOUR IA", passwordHash },
  });

  const company = await prisma.company.upsert({
    where: { domain: "entreprise-test.fr" },
    update: {},
    create: { domain: "entreprise-test.fr", name: "Entreprise Test", isPersonal: false },
  });

  const questionnaire = await prisma.questionnaire.upsert({
    where: { id: "seed-questionnaire-ia-act" },
    update: {},
    create: {
      id: "seed-questionnaire-ia-act",
      title: "IA Act — Connaissances réglementaires",
      category: "IA_ACT",
      questions: {
        create: QUESTIONS.map((q, i) => ({
          text: q.text,
          choices: JSON.stringify(q.choices),
          correctIndex: q.correctIndex,
          points: q.points ?? 1000,
          timeLimitSec: q.timeLimitSec ?? 20,
          order: i,
        })),
      },
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { code: "DEMO2026" },
    update: {},
    create: {
      code: "DEMO2026",
      label: "Campagne de démonstration",
      questionnaireId: questionnaire.id,
      companyId: company.id,
    },
  });

  console.log("Seed terminé.");
  console.log(`  Admin back-office : ${admin.email} / BonjourIA2026!`);
  console.log(`  Lien de test participant : /s/${campaign.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
