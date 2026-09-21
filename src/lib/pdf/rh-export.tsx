import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { CertificateBody, type CertificateData } from "./certificate";
import { LOGO_BLANC_ROSE_BASE64 } from "./logo-base64";

const INK = "#2D2D2D";

const styles = StyleSheet.create({
  coverPage: {
    padding: 0,
    fontSize: 10,
  },
  header: {
    backgroundColor: INK,
    paddingVertical: 24,
    paddingHorizontal: 40,
  },
  brand: {
    height: 26,
    width: 52,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#CCCCCC",
    marginTop: 4,
  },
  body: {
    padding: 40,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 700,
    color: INK,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  rowAlt: {
    backgroundColor: "#FAFAFA",
  },
  headerRow: {
    backgroundColor: INK,
  },
  cell: {
    padding: 8,
    flex: 1,
    fontSize: 9,
    color: "#333333",
  },
  headerCell: {
    padding: 8,
    flex: 1,
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    marginTop: 24,
  },
});

export type RhExportRow = {
  fullName: string;
  email: string;
  score: number;
  date: string;
  status: string;
};

export type RhExportData = {
  companyName: string;
  campaignLabel: string;
  rows: RhExportRow[];
  certificates: CertificateData[];
};

function RhExportDocument({ data }: { data: RhExportData }) {
  const finishedCount = data.rows.filter((r) => r.status === "Terminé").length;
  const avgScore =
    data.rows.length > 0 ? Math.round(data.rows.reduce((s, r) => s + r.score, 0) / data.rows.length) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.header}>
          <Image style={styles.brand} src={LOGO_BLANC_ROSE_BASE64} />
          <Text style={styles.subtitle}>
            Récapitulatif — {data.companyName} — {data.campaignLabel}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Participants</Text>
              <Text style={styles.summaryValue}>{data.rows.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Terminés</Text>
              <Text style={styles.summaryValue}>{finishedCount}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Note moyenne</Text>
              <Text style={styles.summaryValue}>{avgScore}/10</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={styles.headerCell}>Nom</Text>
              <Text style={styles.headerCell}>Email</Text>
              <Text style={styles.headerCell}>Note</Text>
              <Text style={styles.headerCell}>Date</Text>
              <Text style={styles.headerCell}>Statut</Text>
            </View>
            {data.rows.map((row, i) => (
              <View style={i % 2 === 1 ? [styles.row, styles.rowAlt] : [styles.row]} key={i}>
                <Text style={styles.cell}>{row.fullName}</Text>
                <Text style={styles.cell}>{row.email}</Text>
                <Text style={styles.cell}>{row.score}/10</Text>
                <Text style={styles.cell}>{row.date}</Text>
                <Text style={styles.cell}>{row.status}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footer}>BONJOUR IA — Cabinet de conseil, formation et application IA</Text>
        </View>
      </Page>

      {data.certificates.map((cert, i) => (
        <Page key={i} size="A4" orientation="landscape">
          <CertificateBody data={cert} />
        </Page>
      ))}
    </Document>
  );
}

export async function generateRhExportPdf(data: RhExportData): Promise<Buffer> {
  return renderToBuffer(<RhExportDocument data={data} />);
}
