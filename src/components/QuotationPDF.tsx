import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import type { CompletedService } from '../types'

// Register Roboto font for peso sign support
Font.register({
  family: 'Roboto',
  src: '/src/assets/fonts/Roboto-Regular.ttf',
})

// Traditional business letter styles based on the image
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.4,
  },
  
  // Header Section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
  },
  
  // Left side - Company info
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
  
  // Right side - Quotation details
  quotationInfo: {
    width: '35%',
    alignItems: 'flex-end',
  },
  quotationDetail: {
    flexDirection: 'row',
    marginBottom: 3,
    justifyContent: 'flex-end',
  },
  quotationLabel: {
    fontSize: 10,
    color: '#374151',
    width: 80,
    textAlign: 'right',
    marginRight: 5,
  },
  quotationValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
  },
  
  // Customer Section
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
  
  // Greeting
  greeting: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 20,
  },
  
  // Description paragraph
  descriptionParagraph: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 25,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  
  // Table
  tableContainer: {
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
  
  // Table columns
  colUnit: { width: '12%', textAlign: 'left' },
  colDescription: { width: '48%', textAlign: 'left' },
  colQty: { width: '10%', textAlign: 'center' },
  colUnitPrice: { width: '15%', textAlign: 'right' },
  colTotalPrice: { width: '15%', textAlign: 'right' },
  
  // Table rows
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
  
  // Total section
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
  
  // Terms section
  termsSection: {
    marginBottom: 25,
  },
  termsText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  
  // Thank you
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

interface QuotationPDFProps {
  service: CompletedService
}

const QuotationPDF: React.FC<QuotationPDFProps> = ({ service }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 45)
  const validUntilFormatted = validUntil.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const quotationNumber = service.quotation_number || `QT-${service.id.slice(-6).toUpperCase()}`
  
  // Calculate totals
  const laborCost = service.labor_cost || 0
  const partsCost = service.parts_used?.reduce((total, part) => 
    total + (part.quantity * part.cost), 0) || 0
  const total = laborCost + partsCost

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {/* Left side - Company Information */}
          <View style={styles.companyInfo}>
            <Image 
              style={styles.companyLogo}
              src="/src/assets/images/vp.png"
            />
            <Text style={styles.companyDetails}>
              Medical Equipment{'\n'}
              Repair and Maintenance{'\n'}
              Vivian Onate - Manager{'\n'}
              Tel. No. 09271783550{'\n'}
              Email: vannaonate@gmail.com
            </Text>
          </View>
          
          {/* Right side - Quotation Details */}
          <View style={styles.quotationInfo}>
            <View style={styles.quotationDetail}>
              <Text style={styles.quotationLabel}>Quotation No.</Text>
              <Text style={styles.quotationValue}>: {quotationNumber}</Text>
            </View>
            <View style={styles.quotationDetail}>
              <Text style={styles.quotationLabel}>Date</Text>
              <Text style={styles.quotationValue}>: {currentDate}</Text>
            </View>
            <View style={styles.quotationDetail}>
              <Text style={styles.quotationLabel}>Payment Term</Text>
              <Text style={styles.quotationValue}>: Cash / Check</Text>
            </View>
            <View style={styles.quotationDetail}>
              <Text style={styles.quotationLabel}>Valid Until</Text>
              <Text style={styles.quotationValue}>: {validUntilFormatted}</Text>
            </View>
            <View style={styles.quotationDetail}>
              <Text style={styles.quotationLabel}>Prepared By</Text>
              <Text style={styles.quotationValue}>: Vivian Onate</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <Text style={styles.customerName}>{service.client_name}</Text>
          <Text style={styles.customerAddress}>
            {service.location}{'\n'}
            Equipment: {service.equipment_type}
          </Text>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Dear Sir / Ma'am:</Text>

        {/* Description */}
        <Text style={styles.descriptionParagraph}>
          Good day, here is our Quotation for {service.title} of {service.equipment_type}. 
          {service.description ? ` ${service.description}` : ''} 
           Our team of skilled technicians will ensure quality service and professional handling of your medical equipment.
        </Text>

        {/* Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit</Text>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotalPrice]}>Total Price</Text>
          </View>

          {/* Labor Service Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellLeft, styles.colUnit]}>Service</Text>
            <Text style={[styles.tableCell, styles.tableCellLeft, styles.colDescription]}>
              {service.title} - Professional service by certified technician
              {service.technician ? ` (${service.technician})` : ''}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, styles.colQty]}>1</Text>
            <Text style={[styles.tableCell, styles.tableCellRight, styles.colUnitPrice]}>
              {formatPeso(laborCost)}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellRight, styles.colTotalPrice]}>
              {formatPeso(laborCost)}
            </Text>
          </View>

          {/* Parts Rows */}
          {service.parts_used?.map((part, index) => (
            <View key={part.id || index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellLeft, styles.colUnit]}>
                {part.name.split(' ')[0]}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellLeft, styles.colDescription]}>
                {part.name} - {part.description || 'Replacement part for medical equipment'}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellCenter, styles.colQty]}>
                {part.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight, styles.colUnitPrice]}>
                {formatPeso(part.cost)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight, styles.colTotalPrice]}>
                {formatPeso(part.quantity * part.cost)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalLine}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>{formatPeso(total)}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Unit are under warranty of (12) months, if the unit is broken, no warranty. But when the unit is good appearance 
            but does not work, we replace. We also offer repair of Medical / Hospital Equipment, and if you have question 
            concerning this quotation, please contact Ms. Vivian Onate or Email us @vannaonate@gmail.com
          </Text>
        </View>

        {/* Thank You */}
        <Text style={styles.thankYou}>Thank You Very Much!</Text>
      </Page>
    </Document>
  )
}

export default QuotationPDF 
