import { useItemStore } from '@/stores';
import { cmd } from './Command';
import { DateTimeSchema, InsertOneResultSchema, ObjectIdSchema, UpdateResultSchema } from './Mongodb';
import { z } from 'zod';
import { t } from '@/i18n';
import { ExportData } from '@/utils/Export';

export const ItemSchema = z
  .object({
    _id: ObjectIdSchema,
    name: z.string(),
    type: z.enum(['Borrower', 'Mortgage']),
    is_lock: z.boolean().default(false),
    updated_at: DateTimeSchema,
    created_at: DateTimeSchema,
  })
  .transform((value) => {
    return {
      ...value,
      get exportData() {
        const type = value.type === 'Borrower' ? t('item.type.Borrower') : t('item.type.Mortgage');
        const header = [`${type} - ${t('item.name')}`];
        const content = [[value.name]];

        return new ExportData(content, header);
      },
    };
  });

export type ItemType = typeof ItemSchema._type.type;
export type Item = z.infer<typeof ItemSchema>;
export type Method = 'insert' | 'update';

export class ItemForm {
  _id = '';
  name = '';
  is_lock = false;
  type: ItemType = 'Borrower';

  keys() {
    return Object.keys(this) as Array<keyof this>;
  }

  fromItem(item: Item) {
    this.keys().forEach((key) => {
      if (key in this && key in item) {
        this[key] = (item as any)[key];
      }
    });
  }

  async insert() {
    const { _id, ...item } = this;
    const result = await cmd.item.insert_one.invoke(InsertOneResultSchema, { item });
    if (result) {
      await useItemStore().find();
    }

    return result;
  }

  async update(updateData: Partial<this> = this) {
    const itemStore = useItemStore();
    const result = await cmd.item.update_one.invoke(UpdateResultSchema, { updateData });

    if (result) itemStore.setSelectedData(updateData);

    return result;
  }

  reset() {
    Object.assign(this, new ItemForm());
  }
}
