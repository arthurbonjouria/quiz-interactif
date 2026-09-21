import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { LOGO_NOIR_ROSE_BASE64 } from "./logo-base64";

const INK = "#0A0A0A";
const BRAND = "#E91E8C";
const GRAY = "#666666";
const LIGHT_GRAY = "#9A9A9A";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  ribbon: {
    width: 16,
    height: "100%",
    backgroundColor: INK,
  },
  ribbonAccent: {
    width: 6,
    height: "100%",
    backgroundColor: BRAND,
  },
  content: {
    flex: 1,
    padding: "36pt 56pt",
    display: "flex",
    flexDirection: "column",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordmark: {
    height: 22,
    width: 44,
  },
  categoryPill: {
    backgroundColor: INK,
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.5,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: 999,
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    fontSize: 11,
    color: GRAY,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 18,
  },
  awardedTo: {
    fontSize: 11,
    color: LIGHT_GRAY,
    fontStyle: "italic",
    marginBottom: 10,
  },
  name: {
    fontSize: 34,
    fontWeight: 700,
    color: INK,
    marginBottom: 10,
    textAlign: "center",
  },
  nameRule: {
    width: 140,
    height: 3,
    backgroundColor: BRAND,
    borderRadius: 2,
    marginBottom: 14,
  },
  company: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 22,
  },
  description: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
    maxWidth: 420,
    lineHeight: 1.5,
  },
  descriptionHighlight: {
    fontWeight: 700,
    color: INK,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 20,
  },
  bottomBlock: {
    flexDirection: "column",
    alignItems: "center",
    width: 170,
  },
  bottomLabel: {
    fontSize: 8,
    color: LIGHT_GRAY,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  bottomValue: {
    fontSize: 11,
    color: INK,
    fontWeight: 700,
  },
  scoreBadge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: INK,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  scoreLabel: {
    fontSize: 7,
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  footer: {
    fontSize: 8,
    color: LIGHT_GRAY,
    textAlign: "center",
    marginTop: 18,
  },
});

const CATEGORY_LABELS: Record<string, string> = {
  Positionnement: "POSITIONNEMENT",
  "IA Act": "IA ACT",
  "Acquis de compétences": "ACQUIS",
};

export type CertificateData = {
  firstName: string;
  lastName: string;
  companyName: string;
  questionnaireTitle: string;
  category: string;
  score: number;
  date: string;
};

export function CertificateBody({ data }: { data: CertificateData }) {
  return (
    <View style={styles.page}>
      <View style={styles.ribbon} />
      <View style={styles.ribbonAccent} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Image style={styles.wordmark} src={LOGO_NOIR_ROSE_BASE64} />
          <Text style={styles.categoryPill}>{CATEGORY_LABELS[data.category] ?? data.category.toUpperCase()}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.kicker}>Certificat de participation</Text>
          <Text style={styles.awardedTo}>Ce certificat est décerné à</Text>
          <Text style={styles.name}>
            {data.firstName} {data.lastName}
          </Text>
          <View style={styles.nameRule} />
          <Text style={styles.company}>{data.companyName}</Text>
          <Text style={styles.description}>
            pour avoir complété avec succès le questionnaire{" "}
            <Text style={styles.descriptionHighlight}>« {data.questionnaireTitle} »</Text>, dans le cadre de son
            parcours de formation à l&apos;intelligence artificielle.
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.bottomBlock}>
            <Text style={styles.bottomLabel}>Date</Text>
            <Text style={styles.bottomValue}>{data.date}</Text>
          </View>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreValue}>{data.score}</Text>
            <Text style={styles.scoreLabel}>Points</Text>
          </View>

          <View style={styles.bottomBlock}>
            <Text style={styles.bottomLabel}>Délivré par</Text>
            <Text style={styles.bottomValue}>BONJOUR IA</Text>
          </View>
        </View>

        <Text style={styles.footer}>BONJOUR IA — Cabinet de conseil, formation et application IA</Text>
      </View>
    </View>
  );
}

function CertificateDocument({ data }: { data: CertificateData }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape">
        <CertificateBody data={data} />
      </Page>
    </Document>
  );
}

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  return renderToBuffer(<CertificateDocument data={data} />);
}
