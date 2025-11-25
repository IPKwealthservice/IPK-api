import { BadRequestException, Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { normalizePhone } from '../common/phone.util';
import { LeadEventService } from '../lead_event/lead-event.service';
import { LeadPhoneInput } from './dto/lead-phone.input';
import { LeadPhoneUpdateDto } from './dto/update/update-lead.dto';

@Injectable()
export class LeadPhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leadEvents: LeadEventService,
  ) { }

  async getPhones(leadId: string) {
    return this.prisma.leadPhone.findMany({
      where: { leadId, archived: false },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async addPhone(leadId: string, input: LeadPhoneInput, authorId?: string | null) {
    const normalized = normalizePhone(input.number);
    if (!normalized) throw new Error('Invalid phone number');

    const activeCount = await this.prisma.leadPhone.count({ where: { leadId, archived: false } });
    if (activeCount >= 4) throw new Error('Maximum 4 phone numbers allowed per lead');

    const data = {
      leadId,
      label: input.label as $Enums.PhoneLabel,
      number: input.number,
      normalized,
      isPrimary: Boolean(input.isPrimary),
      isWhatsapp: Boolean(input.isWhatsapp),
      archived: false,
    };

    const existing = await this.prisma.leadPhone.findFirst({ where: { leadId, normalized } });
    if (existing && !existing.archived) {
      throw new Error('Phone number already exists');
    }

    const created = existing
      ? await this.prisma.leadPhone.update({ where: { id: existing.id }, data })
      : await this.prisma.leadPhone.create({ data });

    if (created.isPrimary) {
      await this.prisma.leadPhone.updateMany({
        where: { leadId, archived: false, NOT: { id: created.id } },
        data: { isPrimary: false },
      });
    } else {
      const hasPrimary = await this.prisma.leadPhone.findFirst({
        where: { leadId, archived: false, isPrimary: true },
      });
      if (!hasPrimary) {
        await this.prisma.leadPhone.update({
          where: { id: created.id },
          data: { isPrimary: true },
        });
      }
    }

    await this.leadEvents.phoneAdded(
      leadId,
      {
        id: created.id,
        number: created.number,
        normalized: created.normalized,
        label: String(created.label),
      },
      authorId,
    );

    return this.getPhones(leadId);
  }

  async removePhone(phoneId: string, authorId?: string | null) {
    const phone = await this.prisma.leadPhone.findUnique({ where: { id: phoneId } });
    if (!phone) throw new Error('Phone not found');
    if (phone.archived) throw new Error('Phone already removed');

    await this.prisma.leadPhone.update({
      where: { id: phoneId },
      data: { archived: true, isPrimary: false },
    });

    if (phone.isPrimary) {
      const next = await this.prisma.leadPhone.findFirst({
        where: { leadId: phone.leadId, archived: false },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await this.prisma.leadPhone.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }

    await this.leadEvents.phoneRemoved(
      phone.leadId,
      { id: phoneId, number: phone.number, label: String(phone.label) },
      authorId,
    );

    return this.getPhones(phone.leadId);
  }

  async markPrimaryPhone(phoneId: string, authorId?: string | null) {
    const phone = await this.prisma.leadPhone.findUnique({ where: { id: phoneId } });
    if (!phone) throw new Error('Phone not found');
    if (phone.archived) throw new Error('Phone is archived');

    await this.prisma.leadPhone.updateMany({
      where: { leadId: phone.leadId, archived: false, NOT: { id: phoneId } },
      data: { isPrimary: false },
    });
    await this.prisma.leadPhone.update({ where: { id: phoneId }, data: { isPrimary: true } });

    await this.leadEvents.phoneMarkedPrimary(
      phone.leadId,
      { id: phoneId, number: phone.number, label: String(phone.label) },
      authorId,
    );

    return this.getPhones(phone.leadId);
  }

  async setWhatsapp(phoneId: string, isWhatsapp: boolean, authorId?: string | null) {
    const phone = await this.prisma.leadPhone.findUnique({ where: { id: phoneId } });
    if (!phone) throw new Error('Phone not found');
    if (phone.archived) throw new Error('Phone is archived');
    const updated = await this.prisma.leadPhone.update({
      where: { id: phoneId },
      data: { isWhatsapp },
    });
    await this.leadEvents.whatsappToggled(
      phone.leadId,
      { id: phoneId, number: phone.number },
      isWhatsapp,
      authorId,
    );
    return updated;
  }

  async syncLeadPhones(leadId: string, phones: LeadPhoneUpdateDto[]) {
    if (!phones) return;

    if (phones.length === 0) {
      await this.prisma.leadPhone.updateMany({
        where: { leadId, archived: false },
        data: { archived: true, isPrimary: false, isWhatsapp: false },
      });
      return;
    }

    if (phones.length > 4) {
      throw new BadRequestException('A maximum of 4 phone numbers are allowed');
    }

    const existing = await this.prisma.leadPhone.findMany({ where: { leadId } });
    const existingById = new Map(existing.map((p) => [p.id, p]));
    const existingByNormalized = new Map(existing.map((p) => [p.normalized, p]));
    const keepIds = new Set<string>();
    const seenNormalized = new Set<string>();
    let primaryCount = 0;

    for (const phone of phones) {
      const normalized = normalizePhone(phone.number);
      if (!normalized) {
        throw new BadRequestException('Invalid phone number provided');
      }
      if (seenNormalized.has(normalized)) {
        throw new BadRequestException('Duplicate phone numbers are not allowed');
      }
      seenNormalized.add(normalized);

      const data = {
        label: (phone.label as $Enums.PhoneLabel) ?? $Enums.PhoneLabel.MOBILE,
        number: phone.number,
        normalized,
        isPrimary: Boolean(phone.isPrimary),
        isWhatsapp: Boolean(phone.isWhatsapp),
        archived: false,
      };

      if (data.isPrimary) primaryCount++;
      if (primaryCount > 1) {
        throw new BadRequestException('Only one primary phone is allowed');
      }

      if (phone.id && existingById.has(phone.id)) {
        keepIds.add(phone.id);
        await this.prisma.leadPhone.update({
          where: { id: phone.id },
          data,
        });
      } else if (existingByNormalized.has(normalized)) {
        const match = existingByNormalized.get(normalized)!;
        keepIds.add(match.id);
        await this.prisma.leadPhone.update({
          where: { id: match.id },
          data,
        });
      } else {
        const created = await this.prisma.leadPhone.create({
          data: { ...data, leadId },
        });
        keepIds.add(created.id);
      }
    }

    const toArchive = existing.filter((p) => !keepIds.has(p.id) && !p.archived);
    if (toArchive.length > 0) {
      await this.prisma.leadPhone.updateMany({
        where: { id: { in: toArchive.map((p) => p.id) } },
        data: { archived: true, isPrimary: false, isWhatsapp: false },
      });
    }

    const hasPrimary = await this.prisma.leadPhone.findFirst({
      where: { leadId, archived: false, isPrimary: true },
    });
    if (!hasPrimary) {
      const firstActive = await this.prisma.leadPhone.findFirst({
        where: { leadId, archived: false },
        orderBy: { createdAt: 'asc' },
      });
      if (firstActive) {
        await this.prisma.leadPhone.update({ where: { id: firstActive.id }, data: { isPrimary: true } });
      }
    }
  }
}
