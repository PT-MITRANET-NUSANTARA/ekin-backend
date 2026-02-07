import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../settings/entities/setting.entity';

@Injectable()
export class SettingSeeder {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async clear() {
    console.log('Clearing all settings...');
    await this.settingRepository.clear();
    console.log('All settings cleared');
  }

  async seed() {
    const defaultSetting = this.settingRepository.create({
      admin_id: '197904012005011015',
      default_harian_time_start: new Date(new Date().setHours(7, 0, 0, 0)),
      default_harian_time_end: new Date(new Date().setHours(17, 0, 0, 0)),
      default_break_time_start: new Date(new Date().setHours(11, 0, 0, 0)),
      default_break_time_end: new Date(new Date().setHours(12, 0, 0, 0)),
      default_total_minuetes: 480,
      bupati_id: '197904012005011015',
      default_work_days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    });

    try {
      // Clear existing settings first
      await this.clear();

      // Create new setting
      const createdSetting = await this.settingRepository.save(defaultSetting);
      console.log('Default setting created:', createdSetting);
      return createdSetting;
    } catch (error) {
      console.error('Error seeding setting:', error.message);
      // If there's an error, try to get existing setting
      const existingSetting = await this.settingRepository.find({
        order: { createdAt: 'DESC' },
        take: 1,
      });
      return existingSetting[0] || null;
    }
  }
}
