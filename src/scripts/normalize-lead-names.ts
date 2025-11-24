// src/scripts/normalize-lead-names.ts
import { PrismaClient } from '@prisma/client';
import 'reflect-metadata';
import { normalizeLeadNames } from '../common/utils/name-normalize';

const prisma = new PrismaClient();

async function main() {
    const batchSize = 500;
    let skip = 0;
    let updatedCount = 0;

    // process in batches to avoid memory issues
    while (true) {
        const leads = await prisma.ipkLeadd.findMany({
            skip,
            take: batchSize,
            orderBy: { id: 'asc' },
        });

        if (leads.length === 0) break;

        for (const lead of leads) {
            const normalized = normalizeLeadNames({
                firstName: lead.firstName,
                lastName: lead.lastName,
                name: lead.name,
            });
            const normalizedFirstName = normalized.firstName;
            const normalizedLastName = normalized.lastName;
            const normalizedName = normalized.name;

            // only update if something actually changed
            if (
                normalizedFirstName !== lead.firstName ||
                normalizedLastName !== lead.lastName ||
                normalizedName !== lead.name
            ) {
                await prisma.ipkLeadd.update({
                    where: { id: lead.id },
                    data: {
                        firstName: normalizedFirstName,
                        lastName: normalizedLastName,
                        name: normalizedName,
                    },
                });
                updatedCount++;
            }
        }

        skip += batchSize;
        console.log(`Processed ${skip} leads, updated ${updatedCount}`);
    }

    console.log(`Done. Total updated leads: ${updatedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
