// Domain entity for Appointment
import { AppointmentStatus, CountryCode } from '@rimac/shared';

export class Appointment {
  public readonly id: string;
  public readonly insuredId: string;
  public readonly scheduleId: number;
  public readonly countryISO: CountryCode;
  public readonly createdAt: string;
  public status: AppointmentStatus;
  public updatedAt?: string;
  public ttl?: number;

  constructor(
    id: string,
    insuredId: string,
    scheduleId: number,
    countryISO: CountryCode,
    createdAt: string,
    status: AppointmentStatus = 'pending',
    updatedAt?: string,
    ttl?: number
  ) {
    this.id = id;
    this.insuredId = insuredId;
    this.scheduleId = scheduleId;
    this.countryISO = countryISO;
    this.createdAt = createdAt;
    this.status = status;
    this.updatedAt = updatedAt;
    this.ttl = ttl;
  }

  // Business logic methods
  public markAsCompleted(): void {
    this.status = 'completed';
    this.updatedAt = new Date().toISOString();
  }

  public markAsFailed(): void {
    this.status = 'failed';
    this.updatedAt = new Date().toISOString();
  }

  public isCompleted(): boolean {
    return this.status === 'completed';
  }

  public isPending(): boolean {
    return this.status === 'pending';
  }

  public isFailed(): boolean {
    return this.status === 'failed';
  }

  // Convert to record for persistence
  public toRecord() {
    return {
      id: this.id,
      insuredId: this.insuredId,
      scheduleId: this.scheduleId,
      countryISO: this.countryISO,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ttl: this.ttl,
    };
  }

  // Factory method to create from record
  public static fromRecord(record: any): Appointment {
    return new Appointment(
      record.id,
      record.insuredId,
      record.scheduleId,
      record.countryISO,
      record.createdAt,
      record.status,
      record.updatedAt,
      record.ttl
    );
  }
}
