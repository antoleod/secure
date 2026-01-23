export function calculateMonthlyPayment(amountCents: number, annualRatePercent: number, termMonths: number) {
    if (termMonths <= 0) return 0;
    const monthlyRate = annualRatePercent / 100 / 12;

    if (monthlyRate === 0) {
        return Math.round(amountCents / termMonths);
    }

    const factor = Math.pow(1 + monthlyRate, termMonths);
    const payment = (amountCents * monthlyRate * factor) / (factor - 1);
    return Math.round(payment);
}

export function calculateTotalRepayment(monthlyPaymentCents: number, termMonths: number) {
    return Math.round(monthlyPaymentCents * termMonths);
}
