package com.way2care.inventorymanagement.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class AmountToWordsUtil {
    private static final String[] units = {
            "", "One", "Two", "Three", "Four", "Five",
            "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen",
            "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };

    private static final String[] tens = {
            "", "", "Twenty", "Thirty", "Forty",
            "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    private AmountToWordsUtil() {}

    public static String convertAmountToWords(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "Zero Rupees Only";
        }

        amount = amount.setScale(2, RoundingMode.HALF_UP);

        long rupees = amount.longValue();
        Integer paise = amount.subtract(BigDecimal.valueOf(rupees))
                .multiply(BigDecimal.valueOf(100))
                .intValue();

        StringBuilder words = new StringBuilder();

        if (rupees > 0) {
            words.append(convertNumberToWords(rupees)).append(" Rupees");
        }

        if (paise > 0) {
            words.append(" and ").append(convertNumberToWords(paise)).append(" Paise");
        }

        words.append(" Only");
        return words.toString().trim();
    }

    private static String convertNumberToWords(long number) {
        if (number == 0) return "Zero";

        StringBuilder words = new StringBuilder();

        if (number >= 10000000) {
            words.append(convertNumberToWords(number / 10000000)).append(" Crore ");
            number %= 10000000;
        }

        if (number >= 100000) {
            words.append(convertNumberToWords(number / 100000)).append(" Lakh ");
            number %= 100000;
        }

        if (number >= 1000) {
            words.append(convertNumberToWords(number / 1000)).append(" Thousand ");
            number %= 1000;
        }

        if (number >= 100) {
            words.append(convertNumberToWords(number / 100)).append(" Hundred ");
            number %= 100;
        }

        if (number > 0) {
            if (number < 20) {
                words.append(units[(int) number]).append(" ");
            } else {
                words.append(tens[(int) (number / 10)]).append(" ");
                if (number % 10 > 0) {
                    words.append(units[(int) (number % 10)]).append(" ");
                }
            }
        }
        return words.toString().trim();
    }
}
