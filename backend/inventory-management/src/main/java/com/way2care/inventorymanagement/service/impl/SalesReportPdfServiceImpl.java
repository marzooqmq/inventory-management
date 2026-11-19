package com.way2care.inventorymanagement.service.impl;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.WriterProperties;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.way2care.inventorymanagement.dto.reports.sales.SalesReportProjection;
import com.way2care.inventorymanagement.dto.reports.sales.SalesReportSummaryProjection;
import com.way2care.inventorymanagement.exception.ResourceNotFoundException;
import com.way2care.inventorymanagement.model.CompanyProfile;
import com.way2care.inventorymanagement.model.InvoiceStatus;
import com.way2care.inventorymanagement.model.PaymentStatus;
import com.way2care.inventorymanagement.model.Product;
import com.way2care.inventorymanagement.repository.CompanyProfileRepository;
import com.way2care.inventorymanagement.repository.InvoiceItemRepository;
import com.way2care.inventorymanagement.repository.ProductRepository;
import com.way2care.inventorymanagement.service.SalesReportPdfService;
import com.way2care.inventorymanagement.util.ReportsFontProvider;
import com.way2care.inventorymanagement.util.ReportsPdfUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesReportPdfServiceImpl implements SalesReportPdfService {

    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductRepository productRepository;
    private final CompanyProfileRepository companyProfileRepository;

    /* ===== COLORS ===== */
    private static final DeviceRgb GREEN = new DeviceRgb(26, 153, 86);
    private static final DeviceRgb LIGHT_GREEN = new DeviceRgb(236, 253, 245);
    private static final DeviceRgb DARK_GRAY = new DeviceRgb(107, 114, 128);
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);
    private static final DeviceRgb HEADER = new DeviceRgb(240, 253, 244);

    @Override
    public InputStreamResource generateSalesReportPdf(LocalDate startDate, LocalDate endDate,
                                                      Integer month, Integer year, String invoiceNumber,
                                                      Integer customerId, Integer productId,
                                                      PaymentStatus paymentStatus) {

        CompanyProfile profile = companyProfileRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));

        LocalDateTime start;
        LocalDateTime end;

        if (month != null && year != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            start = yearMonth.atDay(1).atStartOfDay();
            end = yearMonth.atEndOfMonth().atTime(LocalTime.MAX);
        } else if (startDate != null && endDate != null) {
            start = startDate.atStartOfDay();
            end = endDate.atTime(LocalTime.MAX);
        } else {
            throw new IllegalArgumentException("Invalid date filters provided.");
        }

        List<SalesReportProjection> records =
                invoiceItemRepository.findSalesReport(
                        start, end,
                        InvoiceStatus.CREATED,
                        invoiceNumber, customerId, productId, paymentStatus,
                        Pageable.unpaged()
                ).getContent();

        SalesReportSummaryProjection summary = invoiceItemRepository.findSalesSummary(
                start, end,
                InvoiceStatus.CREATED,
                invoiceNumber, customerId, productId, paymentStatus);

        try(ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(out,
                    new WriterProperties().setCompressionLevel(9));
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(80, 36, 40, 36);

            ReportsFontProvider fonts = new ReportsFontProvider();

            ReportsPdfUtil.addHeader(pdf, profile, fonts.regular(), fonts.bold());
            ReportsPdfUtil.addFooter(pdf, fonts.regular());

            /* ================= TITLE ================= */
            document.add(new Paragraph(buildTitle(productId, invoiceNumber))
                    .setFont(fonts.bold())
                    .setFontSize(14)
                    .setFontColor(new DeviceRgb(30, 41, 59))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(0));

            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
            document.add(new Paragraph(
                    dateTimeFormatter.format(start.toLocalDate()) + " - " + dateTimeFormatter.format(end.toLocalDate()))
                    .setFont(fonts.regular())
                    .setFontSize(9)
                    .setFontColor(DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(2)
                    .setMarginBottom(8));

            // ================= SUMMARY =================
            Table summaryTable = new Table(new float[]{3, 2});
            summaryTable.setWidth(UnitValue.createPercentValue(40));
            summaryTable.setBorder(new SolidBorder(GREEN, 1.2f));
            summaryTable.setMarginBottom(18);

            Cell titleCell = new Cell(1, 2)
                    .add(new Paragraph("Summary")
                            .setFont(fonts.bold())
                            .setFontSize(10)
                            .setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(GREEN)
                    .setPadding(6)
                    .setBorder(Border.NO_BORDER);

            summaryTable.addCell(titleCell);

            addSummary(summaryTable, "Total Invoices", summary.getTotalInvoices(), fonts);
            addSummary(summaryTable, "Total Quantity Sold", summary.getTotalQuantity(), fonts);
            addSummary(summaryTable, "Gross Amount", summary.getTotalSales(), fonts);
            addSummary(summaryTable, "Total Discount", summary.getTotalDiscount(), fonts);

            summaryTable.addCell(new Cell(1, 2)
                    .setBorderTop(new SolidBorder(GREEN, 0.8f))
                    .setBorderLeft(Border.NO_BORDER)
                    .setBorderRight(Border.NO_BORDER)
                    .setBorderBottom(Border.NO_BORDER));

            addSummary(summaryTable, "Net Amount", summary.gettotalNetAmount(), fonts);
            addSummary(summaryTable, "Amount Received", summary.getTotalPaidAmount(), fonts);

            addSummaryHighlight(summaryTable, "Balance Due",
                    summary.gettotalNetAmount().subtract(summary.getTotalPaidAmount()), fonts);

            document.add(summaryTable);

            /* ================= TABLE ================= */
            Table table = new Table(new float[]{2, 3, 3, 1, 2, 2})
                    .setWidth(UnitValue.createPercentValue(100));

            addHeader(table, "Invoice No", fonts);
            addHeader(table, "Customer", fonts);
            addHeader(table, "Product", fonts);
            addHeader(table, "Qty", fonts);
            addHeader(table, "Rate", fonts);
            addHeader(table, "Total", fonts);

            Map<String, List<SalesReportProjection>> invoices =
                    records.stream().collect(Collectors.groupingBy(
                            SalesReportProjection::getInvoiceNumber,
                            LinkedHashMap::new,
                            Collectors.toList()));

            boolean alternate = false;
            for (List<SalesReportProjection> invoiceItems : invoices.values()) {
                int rowSpan = invoiceItems.size();
                DeviceRgb rowColor = alternate ? LIGHT_GREEN : WHITE;

                for (int i = 0; i < invoiceItems.size(); i++) {
                    SalesReportProjection record = invoiceItems.get(i);

                    /* ===== Invoice No (ROWSPAN) ===== */
                    if (i == 0) {
                        table.addCell(new Cell(rowSpan, 1)
                                .add(new Paragraph(record.getInvoiceNumber())
                                        .setFont(fonts.regular()).setFontSize(9))
                                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                                .setBackgroundColor(rowColor));
                    }

                    /* ===== Customer (ROWSPAN) ===== */
                    if (i == 0) {
                        table.addCell(new Cell(rowSpan, 1)
                                .add(new Paragraph(record.getCustomerName())
                                        .setFont(fonts.regular()).setFontSize(9))
                                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                                .setBackgroundColor(rowColor));
                    }

                    table.addCell(body(record.getProductName(), fonts.regular(), TextAlignment.LEFT, rowColor));
                    table.addCell(body(String.valueOf(record.getQuantityInBoxes()), fonts.regular(), TextAlignment.CENTER, rowColor));
                    table.addCell(body(record.getRate().toString(), fonts.regular(), TextAlignment.RIGHT, rowColor));
                    table.addCell(body(record.getTotal().toString(), fonts.regular(), TextAlignment.RIGHT, rowColor));
                }
                alternate = !alternate;
            }

            document.add(table);
            document.close();

            return new InputStreamResource(new ByteArrayInputStream(out.toByteArray()));
        } catch (Exception e) {
            throw new RuntimeException("Error generating sales report PDF", e);
        }
    }

    @Override
    public String buildPdfFileName(LocalDate startDate, LocalDate endDate,
                                   Integer month, Integer year, String invoiceNumber,
                                   Integer customerId, Integer productId) {
        if (productId != null) {
            String name = productRepository.findById(productId)
                    .map(product -> product.getName().replace(" ", "_"))
                    .orElse("product");
            return "sales-report-" + name + ".pdf";
        }

        if (invoiceNumber != null) {
            return "sales-report-" + invoiceNumber + ".pdf";
        }

        if (month != null && year != null) {
            return "sales-report-" +
                    YearMonth.of(year, month)
                            .format(DateTimeFormatter.ofPattern("MMM-yyyy"))
                            .toLowerCase() + ".pdf";
        }
        return "sales-report-" + startDate + "_to_" + endDate + ".pdf";
    }

    private String buildTitle(Integer productId, String invoiceNumber) {
        if (productId != null) {
            return "Sales Report – Product: " +
                    productRepository.findById(productId)
                            .map(Product::getName)
                            .orElse("Product");
        }
        if (invoiceNumber != null) {
            return "Sales Report – Invoice: " + invoiceNumber;
        }
        return "Sales Report";
    }

    private void addHeader(Table table, String text, ReportsFontProvider fonts) {
        table.addHeaderCell(new Cell()
                        .add(new Paragraph(text).setFont(fonts.bold()))
                        .setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(GREEN)
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell body(String text, PdfFont font, TextAlignment alignment, DeviceRgb backgroundColor) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(9))
                .setTextAlignment(alignment)
                .setBackgroundColor(backgroundColor);
    }

    private void addSummary(Table table, String label, Object value, ReportsFontProvider fonts) {
        table.addCell(new Cell()
                .add(new Paragraph(label)
                        .setFont(fonts.regular())
                        .setFontSize(9))
                .setPadding(6)
                .setBorder(Border.NO_BORDER));

        table.addCell(new Cell()
                .add(new Paragraph(String.valueOf(value)).setFont(fonts.bold())
                        .setFontSize(9))
                .setTextAlignment(TextAlignment.RIGHT)
                .setPadding(6)
                .setBorder(Border.NO_BORDER));
    }

    private void addSummaryHighlight(Table table, String label, Object value, ReportsFontProvider fonts) {
        table.addCell(new Cell()
                .add(new Paragraph(label)
                        .setFont(fonts.bold())
                        .setFontSize(9))
                .setPadding(6)
                .setBackgroundColor(LIGHT_GREEN)
                .setBorder(Border.NO_BORDER));

        table.addCell(new Cell()
                .add(new Paragraph(String.valueOf(value))
                        .setFont(fonts.bold())
                        .setFontSize(9))
                .setTextAlignment(TextAlignment.RIGHT)
                .setPadding(6)
                .setBackgroundColor(LIGHT_GREEN)
                .setBorder(Border.NO_BORDER));
    }
}