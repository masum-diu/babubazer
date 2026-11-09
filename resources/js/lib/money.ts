export function formatBdt(amount: number | string): string {
    const value = Number(amount || 0);

    return `৳${value.toLocaleString('en-BD', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}
