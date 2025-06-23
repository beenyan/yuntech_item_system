import { useMaintenanceItemStore } from '@/stores';
import { cmd } from './Command';
import { DateTimeSchema, InsertOneResultSchema, ObjectIdSchema, UpdateResultSchema } from './Mongodb';
import { z } from 'zod';
import { UserSchema } from './User';
import { date } from 'quasar';
import { ItemSchema } from './Item';
import { t } from '@/i18n';
import { formatChineseDate } from '@/utils';

export const MaintenanceItemSchema = z
  .object({
    _id: ObjectIdSchema,
    item: ItemSchema,
    manager: UserSchema,
    cost: z.number().min(0),
    content: z.string(),
    cause: z.string(),
    start_date: DateTimeSchema,
    end_date: DateTimeSchema,
    remark: z.string(),
    updated_at: DateTimeSchema,
    created_at: DateTimeSchema,
  })
  .transform((value) => {
    return {
      ...value,
      get card_contents() {
        const contensts = [
          value.manager.cardContent,
          {
            label: t('maintenance.item'),
            items: [{ title: t('item.name'), value: value.item.name }],
          },
          {
            label: t('time'),
            items: [
              { title: t('maintenance.start_time'), value: formatChineseDate(value.start_date) },
              { title: t('maintenance.end_time'), value: formatChineseDate(value.end_date) },
            ],
          },
          {
            label: t('maintenance.key'),
            items: [
              { title: t('maintenance.content'), value: value.content },
              { title: t('maintenance.cause'), value: value.cause },
            ],
          },
        ];

        if (value.remark) {
          contensts.push({
            label: t('lend.remark'),
            items: [{ title: t('lend.remark'), value: value.remark }],
          });
        }

        return contensts;
      },
    };
  });

export type MaintenanceItem = z.infer<typeof MaintenanceItemSchema>;
export type Method = 'insert' | 'update';

export class MaintenanceItemForm {
  _id = '';
  item = '';
  manager = '';
  cost = 0;
  content = '';
  cause = '';
  start_date: Date = new Date();
  end_date: Date = date.addToDate(new Date(), { date: 30 });
  remark = '';

  keys() {
    return Object.keys(this) as Array<keyof this>;
  }

  fromMaintenanceItem(item: MaintenanceItem) {
    this.keys().forEach((key) => {
      if (key in this && key in item) {
        this[key] = (item as any)[key];
      }
    });

    (['item', 'manager'] as const).forEach((key) => (this[key] = item[key]._id));
  }

  async insert() {
    const { _id, ...maintenanceItem } = this;
    const result = await cmd.maintenanceItem.insert_one.invoke(InsertOneResultSchema, { data: maintenanceItem });

    return result;
  }

  async update(updateData: Partial<this> = this) {
    const borrowStore = useMaintenanceItemStore();
    const result = await cmd.maintenanceItem.update_by_id.invoke(UpdateResultSchema, { updateData });
    await borrowStore.find();

    return result;
  }

  reset() {
    Object.assign(this, new MaintenanceItemForm());
  }
}
