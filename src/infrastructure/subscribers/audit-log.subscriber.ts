import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Charge } from '../../domain/entities/charge.entity';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogAction } from '../../domain/enums/audit-log-action.enum';

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface<Charge> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Charge;
  }

  async afterInsert(event: InsertEvent<Charge>) {
    const auditLog = event.manager.create(AuditLog, {
      chargeId: event.entity.id,
      action: AuditLogAction.CHARGE_CREATED,
      newStatus: event.entity.status,
      metadata: { payload: event.entity },
    });
    await event.manager.save(AuditLog, auditLog);
  }

  async afterUpdate(event: UpdateEvent<Charge>) {
    if (!event.entity) return;

    const auditLog = event.manager.create(AuditLog, {
      chargeId: event.entity.id,
      action: AuditLogAction.STATUS_UPDATED,
      previousStatus: event.databaseEntity.status,
      newStatus: event.entity.status,
      metadata: {
        updatedColumns: event.updatedColumns.map((col) => col.propertyName),
      },
    });
    await event.manager.save(AuditLog, auditLog);
  }
}
