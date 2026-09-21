import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { LOGO_BLANC_ROSE_BASE64 } from "./logo-base64";

const INK = "#2D2D2D";

const styles = StyleSheet.create({
  coverPage: {
    padding: 0,
    fontSize: 9,
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
  cellDate: { padding: 6, width: "16%", fontSize: 8, color: "#333333" },
  cellWho: { padding: 6, width: "18%", fontSize: 8, color: "#333333" },
  cellAction: { padding: 6, width: "18%", fontSize: 8, color: "#333333" },
  cellTarget: { padding: 6, width: "26%", fontSize: 8, color: "#333333" },
  cellDetails: { padding: 6, width: "22%", fontSize: 7, color: "#666666" },
  headerCellDate: { padding: 6, width: "16%", fontSize: 8, color: "#FFFFFF", fontWeight: 700, textTransform: "uppercase" },
  headerCellWho: { padding: 6, width: "18%", fontSize: 8, color: "#FFFFFF", fontWeight: 700, textTransform: "uppercase" },
  headerCellAction: { padding: 6, width: "18%", fontSize: 8, color: "#FFFFFF", fontWeight: 700, textTransform: "uppercase" },
  headerCellTarget: { padding: 6, width: "26%", fontSize: 8, color: "#FFFFFF", fontWeight: 700, textTransform: "uppercase" },
  headerCellDetails: { padding: 6, width: "22%", fontSize: 8, color: "#FFFFFF", fontWeight: 700, textTransform: "uppercase" },
  footer: {
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    marginTop: 16,
  },
});

export type AuditExportRow = {
  date: string;
  who: string;
  action: string;
  target: string;
  details: string;
};

export type AuditExportData = {
  generatedAt: string;
  rows: AuditExportRow[];
};

function AuditExportDocument({ data }: { data: AuditExportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.header}>
          <Image style={styles.brand} src={LOGO_BLANC_ROSE_BASE64} />
          <Text style={styles.subtitle}>Journal d&apos;audit — généré le {data.generatedAt}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={styles.headerCellDate}>Date</Text>
              <Text style={styles.headerCellWho}>Qui</Text>
              <Text style={styles.headerCellAction}>Action</Text>
              <Text style={styles.headerCellTarget}>Concerne</Text>
              <Text style={styles.headerCellDetails}>Détails</Text>
            </View>
            {data.rows.map((row, i) => (
              <View style={i % 2 === 1 ? [styles.row, styles.rowAlt] : [styles.row]} key={i} wrap={false}>
                <Text style={styles.cellDate}>{row.date}</Text>
                <Text style={styles.cellWho}>{row.who}</Text>
                <Text style={styles.cellAction}>{row.action}</Text>
                <Text style={styles.cellTarget}>{row.target}</Text>
                <Text style={styles.cellDetails}>{row.details}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footer}>
            BONJOUR IA — Cabinet de conseil, formation et application IA — {data.rows.length} action(s) enregistrée(s)
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateAuditExportPdf(data: AuditExportData): Promise<Buffer> {
  return renderToBuffer(<AuditExportDocument data={data} />);
}
