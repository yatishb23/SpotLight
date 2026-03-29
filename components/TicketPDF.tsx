import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image 
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: "#050505",
    color: "#e5e5e5",
  },
  mainContainer: {
    padding: 40,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  accentLine: {
    height: 3,
    backgroundColor: "#ffffff",
    width: "100%",
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  brand: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  contentBody: {
    flex: 1,
  },
  label: {
    fontSize: 7,
    color: "#525252",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
    textTransform: "uppercase",
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTop: "1pt solid #171717",
    paddingTop: 20,
  },
  dataItem: {
    width: "50%",
    marginBottom: 20,
  },
  value: {
    fontSize: 11,
    color: "#d4d4d4",
  },
  // FIXED QR PLACEMENT
  qrWrapper: {
    marginTop: 40,
    alignItems: "center", // Horizontal center
    justifyContent: "center", // Vertical center
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 4,
    width: 140, 
    height: 140,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 115,
    height: 115,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTop: "1pt solid #171717",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#404040",
  }
});

export const TicketPDF = ({ booking, user }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.mainContainer}>
        <View style={styles.accentLine} />
        <View style={styles.header}>
          <Text style={styles.brand}>EventHub.</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Verified Identity</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>
        </View>

        <View style={styles.contentBody}>
          <Text style={styles.label}>Event Designation</Text>
          <Text style={styles.eventTitle}>{booking.eventName}</Text>

          <View style={styles.dataGrid}>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Registry Token</Text>
              <Text style={[styles.value, { fontSize: 9, fontFamily: 'Courier' }]}>{booking.id}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.value}>{booking.quantity} Unit(s)</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: '#10b981' }]}>{booking.status}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>{booking.currency} {booking.totalAmount}</Text>
            </View>
          </View>

          {/* Corrected QR placement logic */}
          <View style={styles.qrWrapper}>
            <View style={styles.qrContainer}>
              <Image src={`data:image/png;base64,${booking.qr}`} style={styles.qrImage} />
            </View>
            <Text style={[styles.label, { marginTop: 10, color: '#ffffff' }]}>Scan at entry</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>NODE: HUB_SECURE_V2</Text>
          <Text style={styles.footerText}>TIMESTAMP: {new Date().getTime()}</Text>
        </View>
      </View>
    </Page>
  </Document>
);