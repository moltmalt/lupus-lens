const GENE_VALUE_REGEX = /^-?\d+(\.\d+)?$/;

export interface ParseResult {
    count: number;
    values: number[];
    error: string | null;
}

export function parseGeneVector(raw: string): ParseResult {
    if (!raw.trim()) return { count: 0, values: [], error: null };

    const tokens = raw
        .split(/[,\t\n]+/)
        .map((t) => t.trim())
        .filter(Boolean);

    const invalid = tokens.find((t) => !GENE_VALUE_REGEX.test(t));
    if (invalid) {
        return { count: 0, values: [], error: `Invalid value: "${invalid}"` };
    }

    const values = tokens.map(Number);
    return { count: values.length, values, error: null };
}

export function isValidPatientId(id: string): boolean {
    // Alphanumeric, 4-20 characters
    return /^[A-Za-z0-9]{4,20}$/.test(id.trim());
}
