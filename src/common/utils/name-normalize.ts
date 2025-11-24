// src/common/utils/name-normalize.ts
export function normalizeNameCase(value?: string | null): string | null {
    if (!value) return value ?? null;

    return value
        .trim()
        .split(/\s+/)
        .map((word) => {
            if (!word) return word;
            const lower = word.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ');
}

/**
 * Build a "name" field from first+last if needed, and normalize casing.
 */
export function buildAndNormalizeFullName(
    name: string | null | undefined,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
): string | null {
    const nFirst = normalizeNameCase(firstName);
    const nLast = normalizeNameCase(lastName);
    const nNameFromInput = normalizeNameCase(name);

    if (nNameFromInput) return nNameFromInput;

    const parts = [nFirst, nLast].filter(Boolean);
    if (!parts.length) return null;

    return parts.join(' ');
}

export type NameParts = {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
};

/**
 * Normalize first/last/name fields consistently before persistence.
 */
export function normalizeLeadNames<T extends NameParts>(input: T): T {
    const normalizedFirst =
        input.firstName !== undefined ? normalizeNameCase(input.firstName) : undefined;
    const normalizedLast =
        input.lastName !== undefined ? normalizeNameCase(input.lastName) : undefined;

    const shouldBuildFullName =
        input.name !== undefined || normalizedFirst !== undefined || normalizedLast !== undefined;
    const normalizedName = shouldBuildFullName
        ? buildAndNormalizeFullName(input.name, normalizedFirst, normalizedLast)
        : undefined;

    return {
        ...input,
        ...(normalizedFirst !== undefined ? { firstName: normalizedFirst } : {}),
        ...(normalizedLast !== undefined ? { lastName: normalizedLast } : {}),
        ...(normalizedName !== undefined ? { name: normalizedName } : {}),
    };
}
