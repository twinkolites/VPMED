import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import type { CompletedService } from '../types'
import robotoFont from '../assets/fonts/Roboto-Regular.ttf'
import vpLogo from '../assets/images/vp.png'

// Ensure Roboto font is registered (safe to call multiple times)
Font.register({
  family: 'Roboto',
  src: robotoFont,
})

// PDF styles (based on QuotationPDF.tsx)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
  },
  companyInfo: {
    width: '60%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  companyLogo: {
    width: 100,
    height: 30,
    marginBottom: 10,
  },
  companyDetails: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.3,
  },
  reportInfo: {
    width: '35%',
    alignItems: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    justifyContent: 'flex-end',
  },
  infoLabel: {
    fontSize: 10,
    color: '#374151',
    width: 80,
    textAlign: 'right',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
  },
  customerSection: {
    marginBottom: 25,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  customerAddress: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.3,
    marginBottom: 15,
  },
  greeting: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 20,
  },
  descriptionParagraph: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 25,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  partsTableContainer: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
    marginBottom: 5,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  colDescription: { width: '60%', textAlign: 'left' },
  colQty: { width: '15%', textAlign: 'center' },
  colCost: { width: '25%', textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    marginBottom: 30,
  },
  totalLine: {
    borderTopWidth: 2,
    borderTopColor: '#374151',
    borderTopStyle: 'solid',
    paddingTop: 8,
    width: '30%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
  },
  thankYou: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginTop: 30,
  },
})

// Helper function to format currency in Philippines peso
const formatPeso = (amount: number): string => {
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `\u20B1${formattedAmount}` // Using Unicode escape for peso sign
}

interface CheckupPDFProps {
  service: CompletedService
}

const CheckupPDF: React.FC<CheckupPDFProps> = ({ service }) => {
  const reportNumber = service.quotation_number || `CHK-${service.id.slice(-6).toUpperCase()}`
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Calculate totals (even if parts are usually not present for checkup, keep for consistency)
  const laborCost = service.labor_cost || 0
  const partsCost = service.parts_used?.reduce((total, part) => 
    total + (part.quantity * part.cost), 0) || 0
  const total = laborCost + partsCost + (service.service_fee || 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {/* Left side - Company Information */}
          <View style={styles.companyInfo}>
            <Image style={styles.companyLogo} src={vpLogo} />
            <Text style={styles.companyDetails}>
              Medical Equipment{"\n"}
              Repair and Maintenance{"\n"}
              Vivian Onate - Manager{"\n"}
              Tel. No. 09271783550{"\n"}
              Email: vannaonate@gmail.com
            </Text>
          </View>

          {/* Right side - Report details */}
          <View style={styles.reportInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>REPORT NO.</Text>
              <Text style={styles.infoValue}>: {reportNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DATE</Text>
              <Text style={styles.infoValue}>: {currentDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PREPARED BY</Text>
              <Text style={styles.infoValue}>: {service.technician || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Client Information Section */}
        <View style={styles.customerSection}>
          <Text style={styles.customerName}>{service.client_name || 'N/A'}</Text>
          <Text style={styles.customerAddress}>
            {service.location || 'N/A'}{'\n'}
            Equipment: {service.equipment_type || 'N/A'}
          </Text>
        </View>

        {/* Inspection Findings / Description */}
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.sectionTitle}>Inspection Findings</Text>
          <Text style={styles.descriptionParagraph}>
            {service.description || 'No specific inspection findings provided.'}
          </Text>
        </View>

        {/* Notes */}
        {service.notes && (
          <View style={{ marginBottom: 25 }}>
            <Text style={styles.sectionTitle}>Technician Notes / Recommendations</Text>
            <Text style={styles.descriptionParagraph}>{service.notes}</Text>
          </View>
        )}

        {/* Cost Breakdown (Optional for Checkup, but consistent structure) */}
        <View style={styles.totalSection}>
          <View style={styles.totalLine}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Service Fee:</Text>
              <Text style={styles.totalValue}>{formatPeso(service.service_fee || 0)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Labor Cost:</Text>
              <Text style={styles.totalValue}>{formatPeso(laborCost)}</Text>
            </View>
            {partsCost > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Parts Cost:</Text>
                <Text style={styles.totalValue}>{formatPeso(partsCost)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>{formatPeso(total)}</Text>
            </View>
          </View>
        </View>

        {/* Thank you */}
        <Text style={styles.thankYou}>--- END OF CHECK-UP REPORT ---</Text>
      </Page>
    </Document>
  )
}

export default CheckupPDF 