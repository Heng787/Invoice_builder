import { BLOCK_TYPES } from './blockTypes.js'

/**
 * Layout presets for each of the 7 document types.
 * Positions (xPercent, yPercent) and sizes (widthPercent, heightPercent)
 * are specified as a fraction of the paper's total width and height.
 */
export const DOCUMENT_PRESETS = {
  'Invoice': [
    {
      type: BLOCK_TYPES.COMPANY_INFO,
      xPercent: 0.05,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        showLogo: true,
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.DOCUMENT_TITLE,
      xPercent: 0.60,
      yPercent: 0.05,
      widthPercent: 0.35,
      heightPercent: 0.05,
      defaultProps: {
        content: 'INVOICE',
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.60,
      yPercent: 0.11,
      widthPercent: 0.35,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Invoice No:',
        value: 'INV-2026-0001',
        labelWidth: 80,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.60,
      yPercent: 0.14,
      widthPercent: 0.35,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Issue Date:',
        value: '23/06/2026',
        labelWidth: 80,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.60,
      yPercent: 0.17,
      widthPercent: 0.35,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Due Date:',
        value: '23/07/2026',
        labelWidth: 80,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.CLIENT_INFO,
      xPercent: 0.05,
      yPercent: 0.18,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Bill To',
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.ITEM_TABLE,
      xPercent: 0.05,
      yPercent: 0.32,
      widthPercent: 0.90,
      heightPercent: 0.22,
      defaultProps: {
        emptyRows: 3,
        showHeader: true,
        showBorders: true,
        columns: [
          { id: 'no', label: '#', width: 5, visible: true },
          { id: 'description', label: 'Description', width: 50, visible: true },
          { id: 'qty', label: 'Qty', width: 10, visible: true },
          { id: 'unit_price', label: 'Unit Price', width: 15, visible: true },
          { id: 'total', label: 'Total', width: 20, visible: true }
        ]
      }
    },
    {
      type: BLOCK_TYPES.TOTALS_BLOCK,
      xPercent: 0.60,
      yPercent: 0.56,
      widthPercent: 0.35,
      heightPercent: 0.15,
      defaultProps: {
        showSubtotal: true,
        showDiscount: false,
        showTax: true,
        showTotal: true,
        showBalance: false,
        taxRate: 10,
        discountValue: 0
      }
    },
    {
      type: BLOCK_TYPES.BANK_DETAILS,
      xPercent: 0.05,
      yPercent: 0.74,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Bank Details',
        showBankName: true,
        showAccountNo: true,
        showAccountName: true
      }
    },
    {
      type: BLOCK_TYPES.PAYMENT_QR,
      xPercent: 0.75,
      yPercent: 0.74,
      widthPercent: 0.20,
      heightPercent: 0.12,
      defaultProps: {
        label: 'Scan to Pay',
        showLabel: true
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.48,
      yPercent: 0.88,
      widthPercent: 0.47,
      heightPercent: 0.06,
      defaultProps: {
        label: 'Authorized Signature',
        showDate: true
      }
    },
    {
      type: BLOCK_TYPES.FOOTER_NOTE,
      xPercent: 0.05,
      yPercent: 0.95,
      widthPercent: 0.90,
      heightPercent: 0.03,
      defaultProps: {
        label: '',
        content: 'Thank you for your business!',
        textAlign: 'center',
        fontSize: 10
      }
    }
  ],

  'Sale Order': [
    {
      type: BLOCK_TYPES.COMPANY_INFO,
      xPercent: 0.05,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        showLogo: true,
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.DOCUMENT_TITLE,
      xPercent: 0.35,
      yPercent: 0.05,
      widthPercent: 0.30,
      heightPercent: 0.06,
      defaultProps: {
        content: 'SALE ORDER',
        textAlign: 'center',
        fontSize: 24
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.65,
      yPercent: 0.05,
      widthPercent: 0.30,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Order No:',
        value: 'SO-0001',
        labelWidth: 80,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.65,
      yPercent: 0.08,
      widthPercent: 0.30,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Order Date:',
        value: '23/06/2026',
        labelWidth: 80,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.65,
      yPercent: 0.11,
      widthPercent: 0.30,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Ref No:',
        value: 'REF-8877',
        labelWidth: 80,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.HEADER_GRID,
      xPercent: 0.05,
      yPercent: 0.17,
      widthPercent: 0.90,
      heightPercent: 0.12,
      defaultProps: {
        columns: [
          { label: 'Seller', content: '' },
          { label: 'Buyer', content: '' },
          { label: 'Order Details', content: 'Payment Mode: COD\nPrepared By: Sales Dept' }
        ]
      }
    },
    {
      type: BLOCK_TYPES.ITEM_TABLE,
      xPercent: 0.05,
      yPercent: 0.31,
      widthPercent: 0.90,
      heightPercent: 0.22,
      defaultProps: {
        emptyRows: 3,
        columns: [
          { id: 'no', label: '#', width: 5, visible: true },
          { id: 'description', label: 'Description', width: 45, visible: true },
          { id: 'qty', label: 'Qty', width: 10, visible: true },
          { id: 'unit_price', label: 'Unit Price', width: 15, visible: true },
          { id: 'discount', label: 'Discount', width: 10, visible: true },
          { id: 'total', label: 'Total', width: 15, visible: true }
        ]
      }
    },
    {
      type: BLOCK_TYPES.TOTALS_BLOCK,
      xPercent: 0.60,
      yPercent: 0.55,
      widthPercent: 0.35,
      heightPercent: 0.15,
      defaultProps: {
        showSubtotal: true,
        showDiscount: true,
        showTax: false,
        showTotal: true,
        showBalance: false,
        discountType: 'fixed',
        discountValue: 10
      }
    },
    {
      type: BLOCK_TYPES.NOTES,
      xPercent: 0.05,
      yPercent: 0.72,
      widthPercent: 0.50,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Order Notes',
        content: 'Delivery is expected within 7-10 working days.'
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.05,
      yPercent: 0.85,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Seller Representative',
        showDate: true
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.55,
      yPercent: 0.85,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Buyer Signature',
        showDate: true
      }
    }
  ],

  'Receipt': [
    {
      type: BLOCK_TYPES.COMPANY_INFO,
      xPercent: 0.30,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        showLogo: false,
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: false,
        textAlign: 'center'
      }
    },
    {
      type: BLOCK_TYPES.DOCUMENT_TITLE,
      xPercent: 0.30,
      yPercent: 0.14,
      widthPercent: 0.40,
      heightPercent: 0.04,
      defaultProps: {
        content: 'RECEIPT',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.30,
      yPercent: 0.19,
      widthPercent: 0.40,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Receipt No:',
        value: 'REC-1002',
        labelWidth: 100,
        textAlign: 'center'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.30,
      yPercent: 0.22,
      widthPercent: 0.40,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Date:',
        value: '23/06/2026',
        labelWidth: 100,
        textAlign: 'center'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.20,
      yPercent: 0.27,
      widthPercent: 0.60,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Received From:',
        value: 'Acme Corporation',
        labelWidth: 120,
        textAlign: 'center'
      }
    },
    {
      type: BLOCK_TYPES.ITEM_TABLE,
      xPercent: 0.15,
      yPercent: 0.32,
      widthPercent: 0.70,
      heightPercent: 0.18,
      defaultProps: {
        emptyRows: 2,
        showRowNumbers: false,
        columns: [
          { id: 'description', label: 'Description', width: 70, visible: true },
          { id: 'total', label: 'Amount', width: 30, visible: true }
        ]
      }
    },
    {
      type: BLOCK_TYPES.TOTALS_BLOCK,
      xPercent: 0.30,
      yPercent: 0.52,
      widthPercent: 0.40,
      heightPercent: 0.05,
      defaultProps: {
        showSubtotal: false,
        showDiscount: false,
        showTax: false,
        showTotal: true,
        showBalance: false,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.15,
      yPercent: 0.59,
      widthPercent: 0.70,
      heightPercent: 0.04,
      defaultProps: {
        label: 'Amount in Words:',
        value: 'One Thousand Forty-Five Dollars Only',
        labelWidth: 120,
        textAlign: 'center'
      }
    },
    {
      type: BLOCK_TYPES.PAYMENT_QR,
      xPercent: 0.40,
      yPercent: 0.66,
      widthPercent: 0.20,
      heightPercent: 0.12,
      defaultProps: {
        label: 'Payment Receipt QR',
        showLabel: false
      }
    },
    {
      type: BLOCK_TYPES.THANK_YOU,
      xPercent: 0.20,
      yPercent: 0.81,
      widthPercent: 0.60,
      heightPercent: 0.05,
      defaultProps: {
        label: '',
        content: 'Thank you for your payment!',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      type: BLOCK_TYPES.FOOTER_NOTE,
      xPercent: 0.15,
      yPercent: 0.89,
      widthPercent: 0.70,
      heightPercent: 0.04,
      defaultProps: {
        label: '',
        content: 'This is a computer generated receipt and requires no physical signature.',
        textAlign: 'center',
        fontSize: 9
      }
    }
  ],

  'Quote': [
    {
      type: BLOCK_TYPES.COMPANY_INFO,
      xPercent: 0.05,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        showLogo: true,
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.DOCUMENT_TITLE,
      xPercent: 0.55,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.05,
      defaultProps: {
        content: 'QUOTATION',
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.55,
      yPercent: 0.11,
      widthPercent: 0.40,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Quote No:',
        value: 'QT-0001',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.55,
      yPercent: 0.14,
      widthPercent: 0.40,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Quote Date:',
        value: '23/06/2026',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.55,
      yPercent: 0.17,
      widthPercent: 0.40,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Valid Until:',
        value: '07/07/2026',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.CLIENT_INFO,
      xPercent: 0.05,
      yPercent: 0.17,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Quote For',
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.NOTES,
      xPercent: 0.05,
      yPercent: 0.28,
      widthPercent: 0.90,
      heightPercent: 0.05,
      defaultProps: {
        label: 'Dear Customer',
        content: 'Dear Acme Corporation, we are pleased to submit our commercial quotation for the requested items detailed below.'
      }
    },
    {
      type: BLOCK_TYPES.ITEM_TABLE,
      xPercent: 0.05,
      yPercent: 0.35,
      widthPercent: 0.90,
      heightPercent: 0.20,
      defaultProps: {
        emptyRows: 2,
        columns: [
          { id: 'no', label: '#', width: 5, visible: true },
          { id: 'description', label: 'Description', width: 45, visible: true },
          { id: 'qty', label: 'Qty', width: 10, visible: true },
          { id: 'unit_price', label: 'Unit Price', width: 15, visible: true },
          { id: 'discount', label: 'Discount', width: 10, visible: true },
          { id: 'total', label: 'Total', width: 15, visible: true }
        ]
      }
    },
    {
      type: BLOCK_TYPES.TOTALS_BLOCK,
      xPercent: 0.60,
      yPercent: 0.57,
      widthPercent: 0.35,
      heightPercent: 0.15,
      defaultProps: {
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showTotal: true,
        showBalance: false,
        taxRate: 10,
        discountValue: 0
      }
    },
    {
      type: BLOCK_TYPES.TERMS,
      xPercent: 0.05,
      yPercent: 0.74,
      widthPercent: 0.45,
      heightPercent: 0.12,
      defaultProps: {
        label: 'Terms & Conditions',
        content: '1. Prices are subject to VAT.\n2. Delivery lead time: 2 weeks.\n3. Validity: 14 days from date of quote.'
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.55,
      yPercent: 0.78,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Prepared By (Sales Dept)',
        showDate: true
      }
    },
    {
      type: BLOCK_TYPES.FOOTER_NOTE,
      xPercent: 0.05,
      yPercent: 0.94,
      widthPercent: 0.90,
      heightPercent: 0.03,
      defaultProps: {
        label: '',
        content: 'For queries regarding this quote, contact us at hello@mycompany.com.',
        textAlign: 'center',
        fontSize: 10
      }
    }
  ],

  'Delivery Note': [
    {
      type: BLOCK_TYPES.COMPANY_INFO,
      xPercent: 0.05,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        showLogo: true,
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.DOCUMENT_TITLE,
      xPercent: 0.30,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.06,
      defaultProps: {
        content: 'DELIVERY NOTE',
        textAlign: 'center',
        fontSize: 24
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.72,
      yPercent: 0.05,
      widthPercent: 0.23,
      heightPercent: 0.03,
      defaultProps: {
        label: 'DN No:',
        value: 'DN-9988',
        labelWidth: 60,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.72,
      yPercent: 0.08,
      widthPercent: 0.23,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Date:',
        value: '23/06/2026',
        labelWidth: 60,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.72,
      yPercent: 0.11,
      widthPercent: 0.23,
      heightPercent: 0.03,
      defaultProps: {
        label: 'PO Ref:',
        value: 'PO-5544',
        labelWidth: 60,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.HEADER_GRID,
      xPercent: 0.05,
      yPercent: 0.16,
      widthPercent: 0.90,
      heightPercent: 0.12,
      defaultProps: {
        columns: [
          { label: 'Ship From', content: '' },
          { label: 'Ship To / Buyer', content: '' },
          { label: 'Delivery Details', content: 'Carrier: Speed Logistics\nTracking No: TRK-9981' }
        ]
      }
    },
    {
      type: BLOCK_TYPES.ITEM_TABLE,
      xPercent: 0.05,
      yPercent: 0.30,
      widthPercent: 0.90,
      heightPercent: 0.22,
      defaultProps: {
        emptyRows: 3,
        columns: [
          { id: 'no', label: '#', width: 5, visible: true },
          { id: 'description', label: 'Item Description', width: 45, visible: true },
          { id: 'qty', label: 'Qty', width: 10, visible: true },
          { id: 'unit', label: 'Unit', width: 10, visible: true },
          { id: 'condition', label: 'Condition', width: 15, visible: true },
          { id: 'notes', label: 'Remarks', width: 15, visible: true }
        ]
      }
    },
    {
      type: BLOCK_TYPES.NOTES,
      xPercent: 0.05,
      yPercent: 0.54,
      widthPercent: 0.90,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Instructions',
        content: 'Please inspect the shipment upon arrival. Notify carrier immediately of any damaged items.'
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.05,
      yPercent: 0.66,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Delivered By (Driver)',
        showDate: true
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.55,
      yPercent: 0.66,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Received By (Customer)',
        showDate: true
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.55,
      yPercent: 0.76,
      widthPercent: 0.40,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Actual Delivery Date:',
        value: '___/___/2026',
        labelWidth: 140
      }
    }
  ],

  'Purchase Order': [
    {
      type: BLOCK_TYPES.COMPANY_INFO,
      xPercent: 0.05,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        showLogo: true,
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.DOCUMENT_TITLE,
      xPercent: 0.50,
      yPercent: 0.05,
      widthPercent: 0.45,
      heightPercent: 0.05,
      defaultProps: {
        content: 'PURCHASE ORDER',
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.50,
      yPercent: 0.11,
      widthPercent: 0.45,
      heightPercent: 0.03,
      defaultProps: {
        label: 'PO Number:',
        value: 'PO-2026-0001',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.50,
      yPercent: 0.14,
      widthPercent: 0.45,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Issue Date:',
        value: '23/06/2026',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.50,
      yPercent: 0.17,
      widthPercent: 0.45,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Required By:',
        value: '15/07/2026',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.CLIENT_INFO,
      xPercent: 0.05,
      yPercent: 0.17,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Vendor / Supplier',
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.HEADER_GRID,
      xPercent: 0.05,
      yPercent: 0.28,
      widthPercent: 0.90,
      heightPercent: 0.12,
      defaultProps: {
        columns: [
          { label: 'Bill To', content: '' },
          { label: 'Ship To', content: '' },
          { label: 'Payment Terms', content: 'Net 30 Days\nFOB Destination' }
        ]
      }
    },
    {
      type: BLOCK_TYPES.ITEM_TABLE,
      xPercent: 0.05,
      yPercent: 0.42,
      widthPercent: 0.90,
      heightPercent: 0.22,
      defaultProps: {
        emptyRows: 3,
        columns: [
          { id: 'no', label: '#', width: 5, visible: true },
          { id: 'description', label: 'Item / Description', width: 40, visible: true },
          { id: 'sku', label: 'SKU / Part #', width: 15, visible: true },
          { id: 'qty', label: 'Qty', width: 10, visible: true },
          { id: 'unit_price', label: 'Unit Price', width: 15, visible: true },
          { id: 'total', label: 'Total', width: 15, visible: true }
        ]
      }
    },
    {
      type: BLOCK_TYPES.TOTALS_BLOCK,
      xPercent: 0.60,
      yPercent: 0.66,
      widthPercent: 0.35,
      heightPercent: 0.15,
      defaultProps: {
        showSubtotal: true,
        showDiscount: false,
        showTax: true,
        showTotal: true,
        showBalance: false,
        taxRate: 10
      }
    },
    {
      type: BLOCK_TYPES.TERMS,
      xPercent: 0.05,
      yPercent: 0.82,
      widthPercent: 0.45,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Instructions & Terms',
        content: 'Send invoices to: payable@company.com.\nEnsure PO number is marked on packaging.'
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.55,
      yPercent: 0.82,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Purchasing Manager Signature',
        showDate: true
      }
    },
    {
      type: BLOCK_TYPES.FOOTER_NOTE,
      xPercent: 0.05,
      yPercent: 0.94,
      widthPercent: 0.90,
      heightPercent: 0.03,
      defaultProps: {
        label: '',
        content: 'This purchase order is subject to company standard terms of purchase.',
        textAlign: 'center',
        fontSize: 9
      }
    }
  ],

  'Credit Note': [
    {
      type: BLOCK_TYPES.COMPANY_INFO,
      xPercent: 0.05,
      yPercent: 0.05,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        showLogo: true,
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.DOCUMENT_TITLE,
      xPercent: 0.50,
      yPercent: 0.05,
      widthPercent: 0.45,
      heightPercent: 0.05,
      defaultProps: {
        content: 'CREDIT NOTE',
        textAlign: 'right',
        color: '#e63946'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.50,
      yPercent: 0.11,
      widthPercent: 0.45,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Credit Note No:',
        value: 'CRN-0001',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.50,
      yPercent: 0.14,
      widthPercent: 0.45,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Date Issued:',
        value: '23/06/2026',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.50,
      yPercent: 0.17,
      widthPercent: 0.45,
      heightPercent: 0.03,
      defaultProps: {
        label: 'Orig Invoice Ref:',
        value: 'INV-2026-0001',
        labelWidth: 100,
        textAlign: 'right'
      }
    },
    {
      type: BLOCK_TYPES.CLIENT_INFO,
      xPercent: 0.05,
      yPercent: 0.17,
      widthPercent: 0.40,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Credit To',
        showName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true
      }
    },
    {
      type: BLOCK_TYPES.FIELD_ROW,
      xPercent: 0.05,
      yPercent: 0.28,
      widthPercent: 0.90,
      heightPercent: 0.04,
      defaultProps: {
        label: 'Reason for Credit:',
        value: 'Returned goods - damaged in transit',
        labelWidth: 120
      }
    },
    {
      type: BLOCK_TYPES.ITEM_TABLE,
      xPercent: 0.05,
      yPercent: 0.34,
      widthPercent: 0.90,
      heightPercent: 0.22,
      defaultProps: {
        emptyRows: 2,
        columns: [
          { id: 'no', label: '#', width: 5, visible: true },
          { id: 'description', label: 'Item Description', width: 50, visible: true },
          { id: 'qty', label: 'Qty', width: 10, visible: true },
          { id: 'unit_price', label: 'Unit Price', width: 15, visible: true },
          { id: 'total', label: 'Credit Amt', width: 20, visible: true }
        ]
      }
    },
    {
      type: BLOCK_TYPES.TOTALS_BLOCK,
      xPercent: 0.60,
      yPercent: 0.58,
      widthPercent: 0.35,
      heightPercent: 0.15,
      defaultProps: {
        showSubtotal: false,
        showDiscount: false,
        showTax: false,
        showTotal: true,
        showBalance: false,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      type: BLOCK_TYPES.NOTES,
      xPercent: 0.05,
      yPercent: 0.74,
      widthPercent: 0.45,
      heightPercent: 0.10,
      defaultProps: {
        label: 'Notice',
        content: 'The credit amount will be applied to your outstanding balance or can be refunded upon request.'
      }
    },
    {
      type: BLOCK_TYPES.SIGNATURE_LINE,
      xPercent: 0.55,
      yPercent: 0.74,
      widthPercent: 0.40,
      heightPercent: 0.08,
      defaultProps: {
        label: 'Authorized Approval Signature',
        showDate: true
      }
    },
    {
      type: BLOCK_TYPES.FOOTER_NOTE,
      xPercent: 0.05,
      yPercent: 0.94,
      widthPercent: 0.90,
      heightPercent: 0.03,
      defaultProps: {
        label: '',
        content: 'For credit inquiries, please email support@mycompany.com.',
        textAlign: 'center',
        fontSize: 10
      }
    }
  ],

  'Custom': []
}

export const BUILTIN_PRESETS = [
  {
    id: "preset_invoice",
    name: "Invoice",
    isPreset: true,
    data: {
      name: "Invoice",
      format: "A4",
      orientation: "portrait",
      settings: {
        globalFont: "Noto Sans, sans-serif",
        globalFontSize: 13,
        currency: "USD",
        documentType: "Invoice"
      },
      blocks: [
        {
          id: "inv_logo",
          type: "image",
          x: 40,
          y: 40,
          width: 80,
          height: 80,
          src: null,
          fitMode: "contain"
        },
        {
          id: "inv_com_name",
          type: "text",
          x: 40,
          y: 130,
          width: 300,
          height: 32,
          content: "{{ComName}} Co.",
          fontSize: 18,
          fontWeight: "bold",
          bindingKey: "ComName",
          bindingFallback: "Company Name"
        },
        {
          id: "inv_com_address",
          type: "text",
          x: 40,
          y: 165,
          width: 300,
          height: 40,
          content: "Address: {{ComAddress}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComAddress",
          bindingFallback: "123 Street, Phnom Penh"
        },
        {
          id: "inv_com_phone",
          type: "text",
          x: 40,
          y: 210,
          width: 300,
          height: 25,
          content: "Phone: {{ComPhone}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComPhone",
          bindingFallback: "+855 12 345 678"
        },
        {
          id: "inv_title",
          type: "text",
          x: 297,
          y: 40,
          width: 200,
          height: 45,
          content: "INVOICE",
          fontSize: 28,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1a1a2e"
        },
        {
          id: "inv_no",
          type: "text",
          x: 554,
          y: 40,
          width: 200,
          height: 25,
          content: "Invoice No: {{invoiceNo}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "invoiceNo",
          bindingFallback: "INV-2026-0001"
        },
        {
          id: "inv_date",
          type: "text",
          x: 554,
          y: 70,
          width: 200,
          height: 25,
          content: "Date: {{date}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "date",
          bindingFallback: "2026-01-01"
        },
        {
          id: "inv_due",
          type: "text",
          x: 554,
          y: 100,
          width: 200,
          height: 25,
          content: "Due Date: {{dueDate}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "dueDate",
          bindingFallback: "2026-01-15"
        },
        {
          id: "inv_divider",
          type: "divider",
          x: 40,
          y: 250,
          width: 714,
          height: 2,
          lineWidth: 2,
          lineColor: "#111827"
        },
        {
          id: "inv_bill_to",
          type: "text",
          x: 40,
          y: 265,
          width: 200,
          height: 25,
          content: "Bill To:",
          fontSize: 12,
          fontWeight: "bold"
        },
        {
          id: "inv_cus_name",
          type: "text",
          x: 40,
          y: 295,
          width: 300,
          height: 25,
          content: "Name: {{CusName}}",
          fontSize: 14,
          fontWeight: "bold",
          bindingKey: "CusName",
          bindingFallback: "Customer Name"
        },
        {
          id: "inv_cus_address",
          type: "text",
          x: 40,
          y: 325,
          width: 300,
          height: 45,
          content: "Address: {{CusAddress}}",
          fontSize: 12,
          bindingKey: "CusAddress",
          bindingFallback: "Phnom Penh, Cambodia"
        },
        {
          id: "inv_table",
          type: "item_table",
          x: 40,
          y: 390,
          width: 714,
          height: 320,
          arraySource: "items",
          emptyRows: 10,
          showBorders: true,
          showHeader: true,
          columns: [
            { id: "no", label: "No.", width: 8, visible: true },
            { id: "description", label: "Description", width: 42, visible: true, binding: "name" },
            { id: "unit", label: "Unit", width: 10, visible: true, binding: "unit" },
            { id: "qty", label: "Qty", width: 10, visible: true, binding: "qty" },
            { id: "unit_price", label: "Price", width: 15, visible: true, binding: "unit_price" },
            { id: "amount", label: "Amount", width: 15, visible: true, binding: "amount" }
          ]
        },
        {
          id: "inv_totals",
          type: "totals_block",
          x: 494,
          y: 730,
          width: 260,
          height: 120,
          showSubtotal: true,
          showDiscount: false,
          showTax: true,
          showTotal: true,
          showBalance: false,
          subtotalBindingKey: "subtotal",
          taxBindingKey: "tax",
          totalBindingKey: "grandTotal",
          subtotalLabel: "Subtotal:",
          taxLabel: "Tax (10%):",
          totalLabel: "Grand Total:"
        },
        {
          id: "inv_bank",
          type: "text",
          x: 40,
          y: 730,
          width: 400,
          height: 100,
          content: "Bank Details:\n{{bankDetails}}",
          fontSize: 11,
          color: "#6b7280",
          bindingKey: "bankDetails",
          bindingFallback: "ABA Bank: 000 111 222 (USD)"
        },
        {
          id: "inv_sig_buyer",
          type: "signature_line",
          x: 40,
          y: 880,
          width: 220,
          height: 80,
          label: "Buyer's Signature",
          showDate: true,
          textAlign: "center"
        },
        {
          id: "inv_sig_seller",
          type: "signature_line",
          x: 534,
          y: 880,
          width: 220,
          height: 80,
          label: "Seller's Signature",
          showDate: true,
          textAlign: "center"
        }
      ]
    }
  },
  {
    id: "preset_sale_order",
    name: "Sale Order",
    isPreset: true,
    data: {
      name: "Sale Order",
      format: "A4",
      orientation: "portrait",
      settings: {
        globalFont: "Noto Sans, sans-serif",
        globalFontSize: 13,
        currency: "USD",
        documentType: "Sale Order"
      },
      blocks: [
        {
          id: "so_logo",
          type: "image",
          x: 40,
          y: 40,
          width: 80,
          height: 80,
          src: null,
          fitMode: "contain"
        },
        {
          id: "so_com_name",
          type: "text",
          x: 40,
          y: 130,
          width: 300,
          height: 32,
          content: "{{ComName}} Co.",
          fontSize: 18,
          fontWeight: "bold",
          bindingKey: "ComName",
          bindingFallback: "Company Name"
        },
        {
          id: "so_com_address",
          type: "text",
          x: 40,
          y: 165,
          width: 300,
          height: 40,
          content: "Address: {{ComAddress}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComAddress",
          bindingFallback: "123 Street, Phnom Penh"
        },
        {
          id: "so_com_phone",
          type: "text",
          x: 40,
          y: 210,
          width: 300,
          height: 25,
          content: "Phone: {{ComPhone}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComPhone",
          bindingFallback: "+855 12 345 678"
        },
        {
          id: "so_title",
          type: "text",
          x: 297,
          y: 40,
          width: 200,
          height: 45,
          content: "SALE ORDER",
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1a1a2e"
        },
        {
          id: "so_no",
          type: "text",
          x: 554,
          y: 40,
          width: 200,
          height: 25,
          content: "Order No: {{orderNo}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "orderNo",
          bindingFallback: "SO-2026-0001"
        },
        {
          id: "so_date",
          type: "text",
          x: 554,
          y: 70,
          width: 200,
          height: 25,
          content: "Date: {{date}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "date",
          bindingFallback: "2026-01-01"
        },
        {
          id: "so_ref",
          type: "text",
          x: 554,
          y: 100,
          width: 200,
          height: 25,
          content: "Ref No: {{refNo}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "refNo",
          bindingFallback: "REF-9988"
        },
        {
          id: "so_divider",
          type: "divider",
          x: 40,
          y: 250,
          width: 714,
          height: 2,
          lineWidth: 2,
          lineColor: "#111827"
        },
        {
          id: "so_bill_to",
          type: "text",
          x: 40,
          y: 265,
          width: 200,
          height: 25,
          content: "Bill To:",
          fontSize: 12,
          fontWeight: "bold"
        },
        {
          id: "so_cus_name",
          type: "text",
          x: 40,
          y: 295,
          width: 300,
          height: 25,
          content: "Name: {{CusName}}",
          fontSize: 14,
          fontWeight: "bold",
          bindingKey: "CusName",
          bindingFallback: "Customer Name"
        },
        {
          id: "so_cus_address",
          type: "text",
          x: 40,
          y: 325,
          width: 300,
          height: 45,
          content: "Address: {{CusAddress}}",
          fontSize: 12,
          bindingKey: "CusAddress",
          bindingFallback: "Phnom Penh, Cambodia"
        },
        {
          id: "so_table",
          type: "item_table",
          x: 40,
          y: 390,
          width: 714,
          height: 320,
          arraySource: "items",
          emptyRows: 10,
          showBorders: true,
          showHeader: true,
          columns: [
            { id: "no", label: "No.", width: 8, visible: true },
            { id: "description", label: "Description", width: 42, visible: true, binding: "name" },
            { id: "unit", label: "Unit", width: 10, visible: true, binding: "unit" },
            { id: "qty", label: "Qty", width: 10, visible: true, binding: "qty" },
            { id: "unit_price", label: "Price", width: 15, visible: true, binding: "unit_price" },
            { id: "amount", label: "Amount", width: 15, visible: true, binding: "amount" }
          ]
        },
        {
          id: "so_totals",
          type: "totals_block",
          x: 494,
          y: 730,
          width: 260,
          height: 120,
          showSubtotal: true,
          showDiscount: false,
          showTax: true,
          showTotal: true,
          showBalance: false,
          subtotalBindingKey: "subtotal",
          taxBindingKey: "tax",
          totalBindingKey: "grandTotal",
          subtotalLabel: "Subtotal:",
          taxLabel: "Tax (10%):",
          totalLabel: "Grand Total:"
        },
        {
          id: "so_bank",
          type: "text",
          x: 40,
          y: 730,
          width: 400,
          height: 100,
          content: "Bank Details:\n{{bankDetails}}",
          fontSize: 11,
          color: "#6b7280",
          bindingKey: "bankDetails",
          bindingFallback: "ABA Bank: 000 111 222 (USD)"
        },
        {
          id: "so_sig_buyer",
          type: "signature_line",
          x: 40,
          y: 880,
          width: 200,
          height: 80,
          label: "Buyer",
          showDate: true,
          textAlign: "center"
        },
        {
          id: "so_sig_delivery",
          type: "signature_line",
          x: 297,
          y: 880,
          width: 200,
          height: 80,
          label: "Delivery",
          showDate: true,
          textAlign: "center"
        },
        {
          id: "so_sig_seller",
          type: "signature_line",
          x: 554,
          y: 880,
          width: 200,
          height: 80,
          label: "Seller",
          showDate: true,
          textAlign: "center"
        }
      ]
    }
  },
  {
    id: "preset_receipt",
    name: "Receipt",
    isPreset: true,
    data: {
      name: "Receipt",
      format: "A4",
      orientation: "portrait",
      settings: {
        globalFont: "Noto Sans, sans-serif",
        globalFontSize: 13,
        currency: "USD",
        documentType: "Receipt"
      },
      blocks: [
        {
          id: "rc_com_name",
          type: "text",
          x: 197,
          y: 40,
          width: 400,
          height: 32,
          content: "{{ComName}} Co.",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          bindingKey: "ComName",
          bindingFallback: "Company Name"
        },
        {
          id: "rc_com_address",
          type: "text",
          x: 197,
          y: 75,
          width: 400,
          height: 25,
          content: "Address: {{ComAddress}}",
          fontSize: 12,
          color: "#6b7280",
          textAlign: "center",
          bindingKey: "ComAddress",
          bindingFallback: "Phnom Penh, Cambodia"
        },
        {
          id: "rc_com_phone",
          type: "text",
          x: 197,
          y: 105,
          width: 400,
          height: 25,
          content: "Phone: {{ComPhone}}",
          fontSize: 12,
          color: "#6b7280",
          textAlign: "center",
          bindingKey: "ComPhone",
          bindingFallback: "+855 12 345 678"
        },
        {
          id: "rc_divider1",
          type: "divider",
          x: 40,
          y: 140,
          width: 714,
          height: 2,
          lineWidth: 1,
          lineColor: "#e5e7eb"
        },
        {
          id: "rc_title",
          type: "text",
          x: 197,
          y: 160,
          width: 400,
          height: 40,
          content: "RECEIPT",
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1a1a2e"
        },
        {
          id: "rc_no",
          type: "text",
          x: 197,
          y: 210,
          width: 400,
          height: 25,
          content: "Receipt No: {{receiptNo}}",
          fontSize: 12,
          textAlign: "center",
          bindingKey: "receiptNo",
          bindingFallback: "REC-2026-0001"
        },
        {
          id: "rc_date",
          type: "text",
          x: 197,
          y: 240,
          width: 400,
          height: 25,
          content: "Date: {{date}}",
          fontSize: 12,
          textAlign: "center",
          bindingKey: "date",
          bindingFallback: "2026-01-01"
        },
        {
          id: "rc_customer",
          type: "text",
          x: 197,
          y: 270,
          width: 400,
          height: 25,
          content: "Customer: {{CusName}}",
          fontSize: 12,
          textAlign: "center",
          bindingKey: "CusName",
          bindingFallback: "John Doe"
        },
        {
          id: "rc_divider2",
          type: "divider",
          x: 40,
          y: 310,
          width: 714,
          height: 2,
          lineWidth: 1,
          lineColor: "#e5e7eb"
        },
        {
          id: "rc_table",
          type: "item_table",
          x: 40,
          y: 330,
          width: 714,
          height: 220,
          arraySource: "items",
          emptyRows: 5,
          showBorders: true,
          showHeader: true,
          columns: [
            { id: "no", label: "No.", width: 10, visible: true },
            { id: "description", label: "Description", width: 65, visible: true, binding: "name" },
            { id: "amount", label: "Amount", width: 25, visible: true, binding: "amount" }
          ]
        },
        {
          id: "rc_divider3",
          type: "divider",
          x: 40,
          y: 570,
          width: 714,
          height: 2,
          lineWidth: 1,
          lineColor: "#e5e7eb"
        },
        {
          id: "rc_total",
          type: "text",
          x: 454,
          y: 590,
          width: 300,
          height: 30,
          content: "Total: {{grandTotal}}",
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "right",
          bindingKey: "grandTotal",
          bindingFallback: "$0.00"
        },
        {
          id: "rc_thank_you",
          type: "text",
          x: 97,
          y: 640,
          width: 600,
          height: 35,
          content: "{{thankYou}}",
          fontSize: 12,
          textAlign: "center",
          bindingKey: "thankYou",
          bindingFallback: "Thank You!"
        },
        {
          id: "rc_divider4",
          type: "divider",
          x: 40,
          y: 690,
          width: 714,
          height: 2,
          lineWidth: 1,
          lineColor: "#e5e7eb"
        }
      ]
    }
  },
  {
    id: "preset_quote",
    name: "Quote",
    isPreset: true,
    data: {
      name: "Quote",
      format: "A4",
      orientation: "portrait",
      settings: {
        globalFont: "Noto Sans, sans-serif",
        globalFontSize: 13,
        currency: "USD",
        documentType: "Quotation"
      },
      blocks: [
        {
          id: "qt_logo",
          type: "image",
          x: 40,
          y: 40,
          width: 80,
          height: 80,
          src: null,
          fitMode: "contain"
        },
        {
          id: "qt_com_name",
          type: "text",
          x: 40,
          y: 130,
          width: 300,
          height: 32,
          content: "{{ComName}} Co.",
          fontSize: 18,
          fontWeight: "bold",
          bindingKey: "ComName",
          bindingFallback: "Company Name"
        },
        {
          id: "qt_com_address",
          type: "text",
          x: 40,
          y: 165,
          width: 300,
          height: 40,
          content: "Address: {{ComAddress}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComAddress",
          bindingFallback: "123 Street, Phnom Penh"
        },
        {
          id: "qt_com_phone",
          type: "text",
          x: 40,
          y: 210,
          width: 300,
          height: 25,
          content: "Phone: {{ComPhone}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComPhone",
          bindingFallback: "+855 12 345 678"
        },
        {
          id: "qt_title",
          type: "text",
          x: 297,
          y: 40,
          width: 200,
          height: 45,
          content: "QUOTATION",
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1a1a2e"
        },
        {
          id: "qt_no",
          type: "text",
          x: 554,
          y: 40,
          width: 200,
          height: 25,
          content: "Quote No: {{quoteNo}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "quoteNo",
          bindingFallback: "QT-2026-0001"
        },
        {
          id: "qt_date",
          type: "text",
          x: 554,
          y: 70,
          width: 200,
          height: 25,
          content: "Date: {{date}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "date",
          bindingFallback: "2026-01-01"
        },
        {
          id: "qt_valid",
          type: "text",
          x: 554,
          y: 100,
          width: 200,
          height: 25,
          content: "Valid Until: {{validUntil}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "validUntil",
          bindingFallback: "2026-01-31"
        },
        {
          id: "qt_divider",
          type: "divider",
          x: 40,
          y: 250,
          width: 714,
          height: 2
        },
        {
          id: "qt_bill_to",
          type: "text",
          x: 40,
          y: 265,
          width: 200,
          height: 25,
          content: "Bill To:",
          fontSize: 12,
          fontWeight: "bold"
        },
        {
          id: "qt_cus_name",
          type: "text",
          x: 40,
          y: 295,
          width: 300,
          height: 25,
          content: "Name: {{CusName}}",
          fontSize: 14,
          fontWeight: "bold",
          bindingKey: "CusName",
          bindingFallback: "Customer Name"
        },
        {
          id: "qt_cus_address",
          type: "text",
          x: 40,
          y: 325,
          width: 300,
          height: 45,
          content: "Address: {{CusAddress}}",
          fontSize: 12,
          bindingKey: "CusAddress",
          bindingFallback: "Phnom Penh, Cambodia"
        },
        {
          id: "qt_table",
          type: "item_table",
          x: 40,
          y: 390,
          width: 714,
          height: 320,
          arraySource: "items",
          emptyRows: 10,
          showBorders: true,
          showHeader: true,
          columns: [
            { id: "no", label: "No.", width: 8, visible: true },
            { id: "description", label: "Description", width: 37, visible: true, binding: "name" },
            { id: "unit", label: "Unit", width: 10, visible: true, binding: "unit" },
            { id: "qty", label: "Qty", width: 10, visible: true, binding: "qty" },
            { id: "unit_price", label: "Price", width: 12, visible: true, binding: "unit_price" },
            { id: "discount", label: "Discount", width: 10, visible: true, binding: "discount" },
            { id: "amount", label: "Amount", width: 13, visible: true, binding: "amount" }
          ]
        },
        {
          id: "qt_terms",
          type: "text",
          x: 40,
          y: 730,
          width: 400,
          height: 100,
          content: "Terms & Conditions:\n{{termsAndConditions}}",
          fontSize: 11,
          color: "#6b7280",
          bindingKey: "termsAndConditions",
          bindingFallback: "1. Prices are valid for 30 days.\n2. Delivery within 7 days after order."
        },
        {
          id: "qt_totals",
          type: "totals_block",
          x: 494,
          y: 730,
          width: 260,
          height: 120,
          showSubtotal: true,
          showDiscount: true,
          showTax: true,
          showTotal: true,
          showBalance: false,
          subtotalBindingKey: "subtotal",
          discountBindingKey: "discount",
          taxBindingKey: "tax",
          totalBindingKey: "grandTotal",
          subtotalLabel: "Subtotal:",
          discountLabel: "Discount:",
          taxLabel: "Tax (10%):",
          totalLabel: "Grand Total:"
        },
        {
          id: "qt_sig_auth",
          type: "signature_line",
          x: 534,
          y: 880,
          width: 220,
          height: 80,
          label: "Authorized Signature",
          showDate: true,
          textAlign: "center"
        }
      ]
    }
  },
  {
    id: "preset_delivery_note",
    name: "Delivery Note",
    isPreset: true,
    data: {
      name: "Delivery Note",
      format: "A4",
      orientation: "portrait",
      settings: {
        globalFont: "Noto Sans, sans-serif",
        globalFontSize: 13,
        currency: "USD",
        documentType: "Delivery Note"
      },
      blocks: [
        {
          id: "dn_logo",
          type: "image",
          x: 40,
          y: 40,
          width: 80,
          height: 80,
          src: null,
          fitMode: "contain"
        },
        {
          id: "dn_com_name",
          type: "text",
          x: 40,
          y: 130,
          width: 300,
          height: 32,
          content: "{{ComName}} Co.",
          fontSize: 18,
          fontWeight: "bold",
          bindingKey: "ComName",
          bindingFallback: "Company Name"
        },
        {
          id: "dn_com_address",
          type: "text",
          x: 40,
          y: 165,
          width: 300,
          height: 40,
          content: "Address: {{ComAddress}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComAddress",
          bindingFallback: "123 Street, Phnom Penh"
        },
        {
          id: "dn_com_phone",
          type: "text",
          x: 40,
          y: 210,
          width: 300,
          height: 25,
          content: "Phone: {{ComPhone}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComPhone",
          bindingFallback: "+855 12 345 678"
        },
        {
          id: "dn_title",
          type: "text",
          x: 297,
          y: 40,
          width: 200,
          height: 45,
          content: "DELIVERY NOTE",
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1a1a2e"
        },
        {
          id: "dn_no",
          type: "text",
          x: 554,
          y: 40,
          width: 200,
          height: 25,
          content: "DN No: {{deliveryNo}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "deliveryNo",
          bindingFallback: "DN-2026-0001"
        },
        {
          id: "dn_date",
          type: "text",
          x: 554,
          y: 70,
          width: 200,
          height: 25,
          content: "Date: {{date}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "date",
          bindingFallback: "2026-01-01"
        },
        {
          id: "dn_divider",
          type: "divider",
          x: 40,
          y: 250,
          width: 714,
          height: 2,
          lineWidth: 2,
          lineColor: "#111827"
        },
        {
          id: "dn_ship_from",
          type: "text",
          x: 40,
          y: 265,
          width: 320,
          height: 75,
          content: "Ship From:\n{{shipFrom}}",
          fontSize: 12,
          bindingKey: "shipFrom",
          bindingFallback: "Our Warehouse, Phnom Penh"
        },
        {
          id: "dn_ship_to",
          type: "text",
          x: 434,
          y: 265,
          width: 320,
          height: 75,
          content: "Ship To:\n{{shipTo}}",
          fontSize: 12,
          bindingKey: "shipTo",
          bindingFallback: "Client Office, Siem Reap"
        },
        {
          id: "dn_table",
          type: "item_table",
          x: 40,
          y: 390,
          width: 714,
          height: 320,
          arraySource: "items",
          emptyRows: 8,
          showBorders: true,
          showHeader: true,
          columns: [
            { id: "no", label: "No.", width: 10, visible: true },
            { id: "item", label: "Item Description", width: 45, visible: true, binding: "name" },
            { id: "qty", label: "Qty", width: 15, visible: true, binding: "qty" },
            { id: "unit", label: "Unit", width: 15, visible: true, binding: "unit" },
            { id: "condition", label: "Condition", width: 15, visible: true, binding: "condition" }
          ]
        },
        {
          id: "dn_sig_delivered",
          type: "signature_line",
          x: 40,
          y: 880,
          width: 220,
          height: 80,
          label: "Delivered By",
          showDate: true,
          textAlign: "center"
        },
        {
          id: "dn_sig_received",
          type: "signature_line",
          x: 534,
          y: 880,
          width: 220,
          height: 80,
          label: "Received By",
          showDate: false,
          textAlign: "center"
        },
        {
          id: "dn_received_date",
          type: "text",
          x: 534,
          y: 970,
          width: 220,
          height: 25,
          content: "Date Received: {{dateReceived}}",
          fontSize: 11,
          textAlign: "center",
          bindingKey: "dateReceived",
          bindingFallback: "___/___/______"
        }
      ]
    }
  },
  {
    id: "preset_purchase_order",
    name: "Purchase Order",
    isPreset: true,
    data: {
      name: "Purchase Order",
      format: "A4",
      orientation: "portrait",
      settings: {
        globalFont: "Noto Sans, sans-serif",
        globalFontSize: 13,
        currency: "USD",
        documentType: "Purchase Order"
      },
      blocks: [
        {
          id: "po_logo",
          type: "image",
          x: 40,
          y: 40,
          width: 80,
          height: 80,
          src: null,
          fitMode: "contain"
        },
        {
          id: "po_com_name",
          type: "text",
          x: 40,
          y: 130,
          width: 300,
          height: 32,
          content: "{{ComName}} Co.",
          fontSize: 18,
          fontWeight: "bold",
          bindingKey: "ComName",
          bindingFallback: "Company Name"
        },
        {
          id: "po_com_address",
          type: "text",
          x: 40,
          y: 165,
          width: 300,
          height: 40,
          content: "Address: {{ComAddress}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComAddress",
          bindingFallback: "123 Street, Phnom Penh"
        },
        {
          id: "po_com_phone",
          type: "text",
          x: 40,
          y: 210,
          width: 300,
          height: 25,
          content: "Phone: {{ComPhone}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComPhone",
          bindingFallback: "+855 12 345 678"
        },
        {
          id: "po_title",
          type: "text",
          x: 297,
          y: 40,
          width: 200,
          height: 45,
          content: "PURCHASE ORDER",
          fontSize: 22,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1a1a2e"
        },
        {
          id: "po_no",
          type: "text",
          x: 554,
          y: 40,
          width: 200,
          height: 25,
          content: "PO No: {{poNo}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "poNo",
          bindingFallback: "PO-2026-0001"
        },
        {
          id: "po_date",
          type: "text",
          x: 554,
          y: 70,
          width: 200,
          height: 25,
          content: "Date: {{date}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "date",
          bindingFallback: "2026-01-01"
        },
        {
          id: "po_divider",
          type: "divider",
          x: 40,
          y: 250,
          width: 714,
          height: 2,
          lineWidth: 2,
          lineColor: "#111827"
        },
        {
          id: "po_vendor",
          type: "text",
          x: 40,
          y: 265,
          width: 300,
          height: 25,
          content: "Vendor: {{vendorName}}",
          fontSize: 12,
          fontWeight: "bold",
          bindingKey: "vendorName",
          bindingFallback: "Supplier Name"
        },
        {
          id: "po_vendor_address",
          type: "text",
          x: 40,
          y: 295,
          width: 300,
          height: 60,
          content: "Address: {{vendorAddress}}",
          fontSize: 12,
          bindingKey: "vendorAddress",
          bindingFallback: "Supplier Address, Thailand"
        },
        {
          id: "po_table",
          type: "item_table",
          x: 40,
          y: 390,
          width: 714,
          height: 320,
          arraySource: "items",
          emptyRows: 10,
          showBorders: true,
          showHeader: true,
          columns: [
            { id: "no", label: "No.", width: 8, visible: true },
            { id: "description", label: "Description", width: 42, visible: true, binding: "name" },
            { id: "sku", label: "SKU", width: 15, visible: true, binding: "sku" },
            { id: "qty", label: "Qty", width: 10, visible: true, binding: "qty" },
            { id: "price", label: "Price", width: 12, visible: true, binding: "price" },
            { id: "total", label: "Total", width: 13, visible: true, binding: "total" }
          ]
        },
        {
          id: "po_totals",
          type: "totals_block",
          x: 494,
          y: 730,
          width: 260,
          height: 120,
          showSubtotal: true,
          showDiscount: false,
          showTax: true,
          showTotal: true,
          showBalance: false,
          subtotalBindingKey: "subtotal",
          taxBindingKey: "tax",
          totalBindingKey: "grandTotal",
          subtotalLabel: "Subtotal:",
          taxLabel: "Tax (10%):",
          totalLabel: "Grand Total:"
        },
        {
          id: "po_sig_auth",
          type: "signature_line",
          x: 534,
          y: 880,
          width: 220,
          height: 80,
          label: "Authorized By",
          showDate: true,
          textAlign: "center"
        }
      ]
    }
  },
  {
    id: "preset_credit_note",
    name: "Credit Note",
    isPreset: true,
    data: {
      name: "Credit Note",
      format: "A4",
      orientation: "portrait",
      settings: {
        globalFont: "Noto Sans, sans-serif",
        globalFontSize: 13,
        currency: "USD",
        documentType: "Credit Note"
      },
      blocks: [
        {
          id: "cn_logo",
          type: "image",
          x: 40,
          y: 40,
          width: 80,
          height: 80,
          src: null,
          fitMode: "contain"
        },
        {
          id: "cn_com_name",
          type: "text",
          x: 40,
          y: 130,
          width: 300,
          height: 32,
          content: "{{ComName}} Co.",
          fontSize: 18,
          fontWeight: "bold",
          bindingKey: "ComName",
          bindingFallback: "Company Name"
        },
        {
          id: "cn_com_address",
          type: "text",
          x: 40,
          y: 165,
          width: 300,
          height: 40,
          content: "Address: {{ComAddress}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComAddress",
          bindingFallback: "123 Street, Phnom Penh"
        },
        {
          id: "cn_com_phone",
          type: "text",
          x: 40,
          y: 210,
          width: 300,
          height: 25,
          content: "Phone: {{ComPhone}}",
          fontSize: 12,
          color: "#6b7280",
          bindingKey: "ComPhone",
          bindingFallback: "+855 12 345 678"
        },
        {
          id: "cn_title",
          type: "text",
          x: 297,
          y: 40,
          width: 200,
          height: 45,
          content: "CREDIT NOTE",
          fontSize: 22,
          fontWeight: "bold",
          textAlign: "center",
          color: "#e63946"
        },
        {
          id: "cn_no",
          type: "text",
          x: 554,
          y: 40,
          width: 200,
          height: 25,
          content: "CN No: {{cnNo}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "cnNo",
          bindingFallback: "CN-2026-0001"
        },
        {
          id: "cn_date",
          type: "text",
          x: 554,
          y: 70,
          width: 200,
          height: 25,
          content: "Date: {{date}}",
          fontSize: 12,
          textAlign: "right",
          bindingKey: "date",
          bindingFallback: "2026-01-01"
        },
        {
          id: "cn_divider",
          type: "divider",
          x: 40,
          y: 250,
          width: 714,
          height: 2,
          lineWidth: 2,
          lineColor: "#e63946"
        },
        {
          id: "cn_orig_invoice",
          type: "text",
          x: 40,
          y: 265,
          width: 350,
          height: 25,
          content: "Original Invoice: {{originalInvoice}}",
          fontSize: 12,
          bindingKey: "originalInvoice",
          bindingFallback: "INV-2026-0001"
        },
        {
          id: "cn_reason",
          type: "text",
          x: 40,
          y: 295,
          width: 350,
          height: 50,
          content: "Reason: {{reason}}",
          fontSize: 12,
          bindingKey: "reason",
          bindingFallback: "Returned damaged goods"
        },
        {
          id: "cn_table",
          type: "item_table",
          x: 40,
          y: 390,
          width: 714,
          height: 320,
          arraySource: "items",
          emptyRows: 8,
          showBorders: true,
          showHeader: true,
          columns: [
            { id: "no", label: "No.", width: 10, visible: true },
            { id: "description", label: "Description", width: 50, visible: true, binding: "name" },
            { id: "qty", label: "Qty", width: 15, visible: true, binding: "qty" },
            { id: "amount", label: "Credit Amount", width: 25, visible: true, binding: "amount" }
          ]
        },
        {
          id: "cn_total",
          type: "text",
          x: 454,
          y: 730,
          width: 300,
          height: 30,
          content: "Total Credit: {{totalCredit}}",
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "right",
          bindingKey: "totalCredit",
          bindingFallback: "$0.00"
        },
        {
          id: "cn_sig_auth",
          type: "signature_line",
          x: 534,
          y: 880,
          width: 220,
          height: 80,
          label: "Authorized Signature",
          showDate: true,
          textAlign: "center"
        }
      ]
    }
  }
];
