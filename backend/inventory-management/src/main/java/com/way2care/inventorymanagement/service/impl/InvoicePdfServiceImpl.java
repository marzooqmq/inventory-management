package com.way2care.inventorymanagement.service.impl;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.WriterProperties;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.CompanyProfile;
import com.way2care.inventorymanagement.model.Invoice;
import com.way2care.inventorymanagement.model.InvoiceItem;
import com.way2care.inventorymanagement.repository.CompanyProfileRepository;
import com.way2care.inventorymanagement.repository.InvoiceItemRepository;
import com.way2care.inventorymanagement.repository.InvoiceRepository;
import com.way2care.inventorymanagement.service.InvoicePdfService;
import com.way2care.inventorymanagement.util.InvoiceFontProvider;
import com.way2care.inventorymanagement.util.InvoicePdfUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoicePdfServiceImpl implements InvoicePdfService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final CompanyProfileRepository companyProfileRepository;

    @Override
    public Map.Entry<String, InputStreamResource> generateInvoicePdf(Integer id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        List<InvoiceItem> items = invoiceItemRepository.findByInvoice(invoice);

        CompanyProfile profile = companyProfileRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Company Profile not found"));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            /* ================= PDF OPTIMIZATION ================= */
            PdfWriter writer = new PdfWriter(
                    out, new WriterProperties().setCompressionLevel(9));

            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(28, 28, 28, 28);

            /* ================= FONTS ================= */
            InvoiceFontProvider fonts = new InvoiceFontProvider();
            PdfFont regularFont = fonts.regular();
            PdfFont boldFont = fonts.bold();

            /* ================= HEADER ================= */
            Table header = new Table(new float[]{1, 1});
            header.setWidth(UnitValue.createPercentValue(100));

            Image logo = new Image(
                    ImageDataFactory.create(
                            getClass().getClassLoader().getResource(profile.getLogoUrl())))
                    .setWidth(95).setAutoScale(true);

            header.addCell(new Cell().add(logo).setBorder(Border.NO_BORDER));

            Cell companyDetails = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT);

            companyDetails.add(InvoicePdfUtil.boldText(profile.getCompanyName(), 11, boldFont));
            companyDetails.add(InvoicePdfUtil.regularText(profile.getAddressLine1(), 9, regularFont));
            companyDetails.add(InvoicePdfUtil.regularText(
                    profile.getCity() + ", " + profile.getState() + " - " + profile.getZipCode(), 9, regularFont));
            companyDetails.add(InvoicePdfUtil.regularText(profile.getCountry(), 9, regularFont));
            companyDetails.add(InvoicePdfUtil.regularText("GSTIN: " + profile.getGstin(), 8.5f, regularFont).setFontColor(ColorConstants.DARK_GRAY));

            header.addCell(companyDetails);
            document.add(header);

            /* ================= TITLE ================= */
            float titleY = pdf.getDefaultPageSize().getTop() - 130;
            InvoicePdfUtil.drawInvoiceTitle(pdf, document, titleY, boldFont);
            document.add(new Paragraph("").setMarginTop(30));

            /* ================= BILL / SHIP / NUMBER ================= */
            Table party = new Table(new float[]{2, 1});
            party.setWidth(UnitValue.createPercentValue(100));
            party.setMarginBottom(6);

            party.addCell(InvoicePdfUtil.addressCell(
                    "Bill To",
                    invoice.getCustomer().getName(),
                    invoice.getCustomer().getAddress(),
                    invoice.getCustomer().getDistrict(),
                    invoice.getCustomer().getState(),
                    invoice.getCustomer().getZipCode(),
                    invoice.getCustomer().getCountry(),
                    invoice.getCustomer().getPhone(),
                    true, true, boldFont, regularFont));

            Cell invoiceNumber = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT);

            invoiceNumber.add(InvoicePdfUtil.regularText("Invoice#", 9, regularFont));
            invoiceNumber.add(InvoicePdfUtil.boldText(invoice.getInvoiceNumber(), 10, boldFont));

            party.addCell(invoiceNumber);
            document.add(party);

            Table shipTo = new Table(new float[]{1});
            shipTo.setWidth(UnitValue.createPercentValue(100));
            shipTo.setMarginBottom(12);

            shipTo.addCell(InvoicePdfUtil.addressCell(
                    "Ship To",
                    null,
                    invoice.getCustomer().getAddress(),
                    invoice.getCustomer().getDistrict(),
                    invoice.getCustomer().getState(),
                    invoice.getCustomer().getZipCode(),
                    invoice.getCustomer().getCountry(),
                    invoice.getCustomer().getPhone(),
                    false, false, boldFont, regularFont));
            document.add(shipTo);

            /* ================= DATES ================= */
            Table invoiceDetail = new Table(new float[]{1, 1, 1});
            invoiceDetail.setWidth(UnitValue.createPercentValue(100));
            invoiceDetail.setMarginBottom(12);

            invoiceDetail.addCell(InvoicePdfUtil.headerCell("Invoice Date", boldFont));
            invoiceDetail.addCell(InvoicePdfUtil.headerCell("Terms", boldFont));
            invoiceDetail.addCell(InvoicePdfUtil.headerCell("Due Date", boldFont));

            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

            invoiceDetail.addCell(InvoicePdfUtil.centerCell(invoice.getInvoiceDate().format(dateTimeFormatter), regularFont));
            invoiceDetail.addCell(InvoicePdfUtil.centerCell("Due on Receipt", regularFont));
            invoiceDetail.addCell(InvoicePdfUtil.centerCell(invoice.getInvoiceDate().format(dateTimeFormatter), regularFont));

            document.add(invoiceDetail);

            /* ================= ITEMS ================= */
            Table itemsTable = new Table(new float[]{0.5f, 4, 1.1f, 1.2f, 1.2f});
            itemsTable.setWidth(UnitValue.createPercentValue(100));
            itemsTable.setFixedLayout();

            itemsTable.addHeaderCell(InvoicePdfUtil.headerCell("#", boldFont));
            itemsTable.addHeaderCell(InvoicePdfUtil.headerCell("Item & Description", boldFont));
            itemsTable.addHeaderCell(InvoicePdfUtil.headerCell("Qty", boldFont));
            itemsTable.addHeaderCell(InvoicePdfUtil.headerCell("Rate", boldFont));
            itemsTable.addHeaderCell(InvoicePdfUtil.headerCell("Amount", boldFont));

            int itemNumber = 1;
            for (InvoiceItem item : items) {
                itemsTable.addCell(InvoicePdfUtil.centerCell(String.valueOf(itemNumber++), regularFont));

                itemsTable.addCell(InvoicePdfUtil.itemDescriptionCell(
                        item.getProduct().getName(),
                        item.getProduct().getDescription(), boldFont, regularFont));

                itemsTable.addCell(InvoicePdfUtil.qtyCell(item.getQuantity(), item.getUnitType().name(), regularFont));
                itemsTable.addCell(InvoicePdfUtil.bodyCell(
                        InvoicePdfUtil.formatAmount(item.getRate()), TextAlignment.RIGHT, regularFont));

                itemsTable.addCell(InvoicePdfUtil.bodyCell(
                        InvoicePdfUtil.formatAmount(item.getTotal()), TextAlignment.RIGHT, regularFont));
            }

            document.add(itemsTable);

            /* ================= TOTALS ================= */
            BigDecimal paidAmount = invoice.getPaidAmount() == null ? BigDecimal.ZERO : invoice.getPaidAmount();
            BigDecimal balance = invoice.getNetAmount().subtract(paidAmount);
            Table totals = InvoicePdfUtil.totalsTable(
                    invoice.getTotalAmount(),
                    invoice.getDiscount(),
                    invoice.getNetAmount(),
                    balance,
                    boldFont, regularFont);

            document.add(totals);

            /* ================= FOOTER ================= */
            document.add(InvoicePdfUtil.boldText("Terms & Conditions", 10, boldFont).setMarginTop(12));

            document.add(InvoicePdfUtil.regularText(
                    "• Full payment is due upon receipt of this invoice.", 9, regularFont));
            document.add(InvoicePdfUtil.regularText(
                    "• Goods once sold will not be taken back or exchanged.", 9, regularFont));

            document.add(InvoicePdfUtil.regularText("Thanks for your business.", 9.5f, boldFont)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.DARK_GRAY));

            document.close();

            return Map.entry(
                    invoice.getInvoiceNumber() + ".pdf",
                    new InputStreamResource(new ByteArrayInputStream(out.toByteArray())));
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}