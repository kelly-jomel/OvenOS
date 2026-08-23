"use client";

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';
import React from 'react';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Loading PDF Engine...</span> }
);

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  logo: { width: 100, height: 'auto' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  businessDetails: { fontSize: 10, color: '#475569', marginTop: 10, lineHeight: 1.5 },
  clientSection: { marginTop: 20, marginBottom: 30, flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, color: '#1e293b' },
  text: { fontSize: 10, color: '#334155', lineHeight: 1.5 },
  table: { width: '100%', marginTop: 20 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 5 },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  tableCellHeader: { fontSize: 10, fontWeight: 'bold', color: '#1e293b' },
  tableCell: { fontSize: 10, color: '#334155' },
  totalsContainer: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '40%', marginBottom: 5 },
  totalText: { fontSize: 10, color: '#334155' },
  totalAmountText: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 10 },
  bankDetails: { fontSize: 9, color: '#64748b', lineHeight: 1.5 }
});

export const InvoiceDocument = ({ invoice, businessProfile, client }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          {businessProfile?.logoUrl ? (
            <Image src={businessProfile.logoUrl} style={styles.logo} />
          ) : (
            <Text style={styles.title}>{businessProfile?.businessName || 'Your Company'}</Text>
          )}
          <View style={styles.businessDetails}>
            <Text>{businessProfile?.address || 'Company Address'}</Text>
            <Text>GSTIN: {businessProfile?.gstin || 'N/A'}</Text>
            <Text>{businessProfile?.email || 'email@example.com'}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 28, color: '#cbd5e1', fontWeight: 'bold' }}>TAX INVOICE</Text>
          <Text style={{ fontSize: 10, marginTop: 10 }}>Date: {new Date(invoice?.date || Date.now()).toLocaleDateString()}</Text>
          <Text style={{ fontSize: 10 }}>Invoice #: {invoice?.id?.substring(0, 8).toUpperCase() || 'DRAFT'}</Text>
        </View>
      </View>

      {/* BILL TO */}
      <View style={styles.clientSection}>
        <View>
          <Text style={styles.sectionTitle}>BILL TO:</Text>
          <Text style={styles.text}>{client?.name || invoice?.clientName || 'Client Name'}</Text>
          <Text style={styles.text}>{client?.address || 'Client Address'}</Text>
          <Text style={styles.text}>GSTIN: {client?.gstin || 'Unregistered'}</Text>
        </View>
      </View>

      {/* LINE ITEMS TABLE */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, styles.tableCellHeader]}>Description</Text>
          <Text style={[styles.col2, styles.tableCellHeader]}>Qty</Text>
          <Text style={[styles.col3, styles.tableCellHeader]}>Rate</Text>
          <Text style={[styles.col4, styles.tableCellHeader]}>Amount</Text>
        </View>
        
        {invoice?.items?.map((item: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.col1, styles.tableCell]}>{item.description}</Text>
            <Text style={[styles.col2, styles.tableCell]}>{item.quantity}</Text>
            <Text style={[styles.col3, styles.tableCell]}>₹{Number(item.rate).toFixed(2)}</Text>
            <Text style={[styles.col4, styles.tableCell]}>₹{(item.quantity * item.rate).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* TOTALS */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Subtotal:</Text>
          <Text style={styles.totalText}>₹{Number(invoice?.subtotal || 0).toFixed(2)}</Text>
        </View>
        
        {invoice?.gstType === 'IGST' ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>IGST (18%):</Text>
            <Text style={styles.totalText}>₹{Number(invoice?.tax || 0).toFixed(2)}</Text>
          </View>
        ) : (
          <>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>CGST (9%):</Text>
              <Text style={styles.totalText}>₹{(Number(invoice?.tax || 0) / 2).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>SGST (9%):</Text>
              <Text style={styles.totalText}>₹{(Number(invoice?.tax || 0) / 2).toFixed(2)}</Text>
            </View>
          </>
        )}
        
        <View style={[styles.totalRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 5 }]}>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Total:</Text>
          <Text style={styles.totalAmountText}>₹{Number(invoice?.total || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* FOOTER / BANK DETAILS */}
      <View style={styles.footer}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <Text style={styles.bankDetails}>Bank: {businessProfile?.bankName || 'N/A'}</Text>
        <Text style={styles.bankDetails}>A/C No: {businessProfile?.accountNumber || 'N/A'}</Text>
        <Text style={styles.bankDetails}>IFSC: {businessProfile?.ifscCode || 'N/A'}</Text>
      </View>
    </Page>
  </Document>
);

export function DownloadInvoiceButton({ invoice, businessProfile, client }: any) {
  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} businessProfile={businessProfile} client={client} />}
      fileName={`Invoice_${invoice?.id?.substring(0,8) || 'Draft'}.pdf`}
      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
    >
      {({ loading }: { loading: boolean }) => (loading ? 'Generating...' : 'Download PDF')}
    </PDFDownloadLink>
  );
}
