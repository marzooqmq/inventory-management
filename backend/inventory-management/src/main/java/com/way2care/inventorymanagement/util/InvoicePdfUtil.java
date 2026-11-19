package com.way2care.inventorymanagement.util;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import java.math.BigDecimal;

public class InvoicePdfUtil {

    private InvoicePdfUtil() {}

    /* ================= COLORS ================= */
    public static final DeviceRgb GREEN = new DeviceRgb(26, 153, 86);
    public static final DeviceRgb LIGHT_GRAY = new DeviceRgb(240, 240, 240);
    public static final DeviceRgb DARK_GRAY = new DeviceRgb(120, 120, 120);
    public static final DeviceRgb LIGHT_GREEN = new DeviceRgb(200, 245, 220);
    public static final DeviceRgb TABLE_BORDER_COLOR = new DeviceRgb(220, 220, 220);

    public static final SolidBorder TABLE_BORDER =
            new SolidBorder(TABLE_BORDER_COLOR, 0.5f);

    /* ================= TEXT ================= */
    public static Paragraph regularText(String text, float size, PdfFont font) {
        return new Paragraph(text)
                .setFont(font)
                .setFontSize(size)
                .setFixedLeading(size + 2);
    }

    public static Paragraph boldText(String text, float size, PdfFont font) {
        return new Paragraph(text)
                .setFont(font)
                .setFontSize(size)
                .setFixedLeading(size + 2);
    }

    /* ================= CELLS ================= */
    public static Cell headerCell(String text, PdfFont font) {
        return new Cell()
                .add(boldText(text, 9.5f, font).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(GREEN)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6)
                .setBorder(TABLE_BORDER);
    }

    public static Cell bodyCell(String text, TextAlignment alignment, PdfFont font) {
        return new Cell()
                .add(regularText(text, 9f, font))
                .setTextAlignment(alignment)
                .setPadding(6)
                .setBorder(TABLE_BORDER);
    }

    public static Cell centerCell(String text, PdfFont font) {
        return bodyCell(text, TextAlignment.CENTER, font);
    }

    public static Cell addressCell(
            String title, String name, String address, String district,
            String state, String zip, String country, String phone, boolean showName, boolean nameBold,
            PdfFont boldFont, PdfFont regularFont) {

        Cell cell = new Cell().setBorder(Border.NO_BORDER);
        cell.add(regularText(title, 9.5f, regularFont).setMarginBottom(4));

        if (showName && name != null) {
            cell.add(
                    (nameBold ? boldText(name, 10, boldFont)
                            : regularText(name, 9, regularFont))
                            .setMarginBottom(2)
            );
        }

        cell.add(regularText(address.trim(), 9, regularFont).setMarginBottom(2));
        String districtLine = String.format("%s, %s - %s",
                district.trim(),state.trim(),zip.trim());
        cell.add(regularText(districtLine, 9, regularFont).setMarginBottom(2));
        cell.add(regularText(country, 9, regularFont));
        cell.add(regularText(phone, 9, regularFont).setMarginTop(2));
        return cell;
    }

    /* ================= INVOICE TITLE ================= */
    public static void drawInvoiceTitle(PdfDocument pdf, Document document, float yPosition, PdfFont boldfont) {
        PdfPage page = pdf.getFirstPage();
        PdfCanvas canvas = new PdfCanvas(page);

        float pageWidth = pdf.getDefaultPageSize().getWidth();
        float leftMargin = document.getLeftMargin();
        float rightMargin = document.getRightMargin();

        String title = "INVOICE";
        float fontSize = 18f;
        float gap = 10f;

        float textWidth = boldfont.getWidth(title, fontSize);
        float centerX = pageWidth / 2;

        float leftLineStart = leftMargin;
        float leftLineEnd = centerX - (textWidth / 2) - gap;

        float rightLineStart = centerX + (textWidth / 2) + gap;
        float rightLineEnd = pageWidth - rightMargin;

        canvas.setStrokeColor(ColorConstants.LIGHT_GRAY);
        canvas.setLineWidth(0.8f);

        canvas.moveTo(leftLineStart, yPosition)
                .lineTo(leftLineEnd, yPosition).stroke();

        canvas.moveTo(rightLineStart, yPosition)
                .lineTo(rightLineEnd, yPosition).stroke();

        canvas.beginText();
        canvas.setFontAndSize(boldfont, fontSize);
        canvas.moveText(centerX - (textWidth / 2), yPosition - 6);
        canvas.showText(title);
        canvas.endText();
    }

        /* ================= ITEM DESCRIPTION ================= */
    public static Cell itemDescriptionCell(String name, String description, PdfFont boldFont, PdfFont regularFont) {
        Cell cell = new Cell()
                .setTextAlignment(TextAlignment.LEFT)
                .setBorder(TABLE_BORDER)
                .setPadding(6);

        cell.add(boldText(name, 9.5f, boldFont));

        if (description != null && !description.isBlank()) {
            cell.add(
                    regularText(description, 8.5f, regularFont)
                            .setFontColor(DARK_GRAY)
            );
        }
        return cell;
    }

    public static Cell qtyCell(Integer qty, String unitLabel, PdfFont font) {
        Cell cell = new Cell()
                .setBorder(TABLE_BORDER)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6);

        cell.add(regularText(qty.toString(), 9, font));

        if (unitLabel != null && !unitLabel.isBlank()) {
            cell.add(
                    regularText(unitLabel.toLowerCase(), 8.5f, font).setFontColor(DARK_GRAY));
        }
        return cell;
    }

    /* ================= TOTALS ================= */
    public static Cell emptyCell() {
        return new Cell().setBorder(Border.NO_BORDER).setPadding(0);
    }

    private static void addEmptyPixcelCells(Table table) {
        table.addCell(emptyCell());
        table.addCell(emptyCell());
        table.addCell(emptyCell());
    }

    public static Table totalsTable(BigDecimal subTotal, BigDecimal discount, BigDecimal total, BigDecimal balance, PdfFont boldFont, PdfFont regularFont) {
        Table table = new Table(new float[]{0.5f, 4f, 1.1f, 1.2f, 1.2f});
        table.setWidth(UnitValue.createPercentValue(100));
        table.setFixedLayout();

        addEmptyPixcelCells(table);
        table.addCell(totalLabelCell("Sub Total", regularFont));
        table.addCell(totalValueCell(subTotal, regularFont));

        if(discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
            addEmptyPixcelCells(table);
            table.addCell(totalLabelCell("Discount", regularFont));
            table.addCell(totalValueCell(discount, regularFont));
        }

        addEmptyPixcelCells(table);
        table.addCell(totalLabelCell("Total", boldFont));
        table.addCell(totalValueCell(total, boldFont));

        addEmptyPixcelCells(table);
        table.addCell(grandTotalLabelCell("Balance Due", boldFont));
        table.addCell(grandTotalValueCell(balance, boldFont));

        return table;
    }

    private static Cell totalLabelCell(String label, PdfFont font) {
        return new Cell()
                .add(regularText(label, 10, font))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(8)
                .setBorder(Border.NO_BORDER);
    }

    private static Cell totalValueCell(BigDecimal value, PdfFont font) {
        return new Cell()
                .add(regularText(formatAmount(value), 10, font))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(8)
                .setBorder(Border.NO_BORDER);
    }

    private static Cell grandTotalLabelCell(String label, PdfFont font) {
        return new Cell()
                .add(boldText(label, 10, font))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(LIGHT_GREEN)
                .setPadding(10)
                .setBorder(Border.NO_BORDER);
    }

    private static Cell grandTotalValueCell(BigDecimal value, PdfFont font) {
        return new Cell()
                .add(boldText("₹" + formatAmount(value), 10, font))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBackgroundColor(LIGHT_GREEN)
                .setPadding(10)
                .setBorder(Border.NO_BORDER);
    }

    public static String formatAmount(BigDecimal value) {
        if (value == null) return "0.00";
        return value.setScale(2, BigDecimal.ROUND_HALF_UP).toString();
    }
}
