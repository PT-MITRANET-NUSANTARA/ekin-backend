import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calender } from '../../calender/entities/calender.entity';

@Injectable()
export class CalenderSeeder {
  constructor(
    @InjectRepository(Calender)
    private calenderRepository: Repository<Calender>,
  ) {}

  async clear() {
    console.log('Clearing all calender records...');
    await this.calenderRepository.clear();
    console.log('All calender records cleared');
  }

  async seed() {
    const unitA = 'unit-001';
    const unitB = 'unit-002';
    const baseDate = new Date('2026-02-01T00:00:00Z');

    const records: Partial<Calender>[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      records.push({
        unit_id: unitA,
        date: new Date(d.toISOString().substring(0, 10)),
        is_holiday: i === 2,
        holiday_name: i === 2 ? 'Libur Internal Unit' : undefined,
        harian_time_start: i === 2 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T08:00:00Z`),
        harian_time_end: i === 2 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T16:00:00Z`),
        break_time_start: i === 2 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T12:00:00Z`),
        break_time_end: i === 2 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T13:00:00Z`),
        total_minutes: i === 2 ? 0 : 480,
      });
    }
    for (let i = 5; i < 10; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      records.push({
        unit_id: unitB,
        date: new Date(d.toISOString().substring(0, 10)),
        is_holiday: i === 7,
        holiday_name: i === 7 ? 'Libur Nasional' : undefined,
        harian_time_start: i === 7 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T08:30:00Z`),
        harian_time_end: i === 7 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T16:30:00Z`),
        break_time_start: i === 7 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T12:00:00Z`),
        break_time_end: i === 7 ? undefined : new Date(`${d.toISOString().substring(0, 10)}T13:00:00Z`),
        total_minutes: i === 7 ? 0 : 480,
      });
    }

    try {
      await this.clear();
      const saved = await this.calenderRepository.save(records);
      console.log('Seeded calender records:', saved.length);
      return saved;
    } catch (error) {
      console.error('Error seeding calender:', error.message);
      const existing = await this.calenderRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
      });
      return existing;
    }
  }

  async seedNonHolidayVersion() {
    const holidays = await this.calenderRepository.find({
      where: { is_holiday: true },
    });
    if (holidays.length === 0) {
      return [];
    }
    const updated = holidays.map((h) => {
      const dateStr = h.date.toISOString().substring(0, 10);
      return {
        ...h,
        is_holiday: false,
        holiday_name: undefined,
        harian_time_start: new Date(`${dateStr}T08:00:00Z`),
        harian_time_end: new Date(`${dateStr}T16:00:00Z`),
        break_time_start: new Date(`${dateStr}T12:00:00Z`),
        break_time_end: new Date(`${dateStr}T13:00:00Z`),
        total_minutes: 480,
      };
    });
    return this.calenderRepository.save(updated);
  }
}
