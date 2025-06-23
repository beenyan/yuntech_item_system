import { useLendItemStore } from '@/stores';
import { cmd } from './Command';
import { DateTimeSchema, ObjectIdSchema, UpdateResultSchema } from './Mongodb';
import { z } from 'zod';
import { UserForm, UserSchema } from './User';
import { date } from 'quasar';
import { ItemSchema } from './Item';
import { cloneDeep } from 'lodash';
import { t } from '@/i18n';
import { formatChineseDateTime } from '@/utils';

export const LendItemSchema = z
  .object({
    _id: ObjectIdSchema,
    borrower_user: UserSchema,
    lend_item: ItemSchema,
    lend_item_amount: z.number().min(1),
    mortgage_item: ItemSchema,
    mortgage_item_amount: z.number().min(1),
    mortgage_money: z.number().min(0),
    lend_date_time: DateTimeSchema,
    due_date: DateTimeSchema,
    manager_user: UserSchema,
    return_date: DateTimeSchema.nullish(),
    return_user: UserSchema.nullish(),
    remark: z.string(),
    updated_at: DateTimeSchema,
    created_at: DateTimeSchema,
  })
  .transform((value) => {
    const is_return = !!value.return_date && !!value.return_user;
    const type = (is_return ? 'return' : new Date() >= value.due_date ? 'overDue' : 'notReturn') as Type;
    return {
      ...value,
      is_return,
      type,
      get card_contents() {
        const contensts = [
          value.borrower_user.cardContent,
          value.manager_user.cardContent,
          {
            label: t('item.type.Borrower'),
            items: [
              { title: t('item.name'), value: value.lend_item.name },
              { title: t('lend.amount'), value: value.lend_item_amount },
            ],
          },
          {
            label: t('item.type.Mortgage'),
            items: [
              { title: t('item.name'), value: value.mortgage_item.name },
              { title: t('lend.amount'), value: value.mortgage_item_amount },
              { title: t('lend.money'), value: value.mortgage_money },
            ],
          },
          {
            label: t('time'),
            items: [
              { title: t('lend.lend_time'), value: formatChineseDateTime(value.lend_date_time) },
              { title: t('lend.due_date'), value: formatChineseDateTime(value.due_date) },
              value.return_date ? { title: t('lend.return_date'), value: formatChineseDateTime(value.return_date) } : null,
            ].filter((x) => x !== null),
          },
        ];

        if (value.return_user) {
          const content = value.return_user.cardContent;
          content.label = `${t('user.type.Manager')} - ${t('lend.return')}`;
          contensts.push(content);
        }

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

export type LendItem = z.infer<typeof LendItemSchema>;
export type Type = 'return' | 'notReturn' | 'overDue';
export type Method = 'insert' | 'update';

export class LendItemForm {
  _id = '';
  borrower_user: UserForm = new UserForm();
  lend_item = '';
  lend_item_amount = 1;
  mortgage_item = '';
  mortgage_item_amount = 1;
  mortgage_money = 0;
  lend_date_time: Date = new Date();
  due_date: Date = date.addToDate(new Date(), { date: 30 });
  manager_user = '';
  remark = '';

  keys() {
    return Object.keys(this) as Array<keyof this>;
  }

  fromLendItem(lendItem: LendItem) {
    this.keys().forEach((key) => {
      if (key in this && key in lendItem) {
        this[key] = (lendItem as any)[key];
      }
    });

    this.borrower_user = cloneDeep(this.borrower_user);
    (['lend_item', 'mortgage_item', 'manager_user'] as const).forEach((key) => (this[key] = lendItem[key]._id));
  }

  async insert() {
    const { _id, ...lend } = this;
    if (!lend.borrower_user._id) {
      delete lend.borrower_user._id;
    }

    const result = await cmd.lendItem.insert_one.invoke(LendItemSchema, { lend });

    return result;
  }

  async update(updateData: Partial<this> = this) {
    const borrowStore = useLendItemStore();
    const result = await cmd.lendItem.update_one.invoke(UpdateResultSchema, { updateData });
    await borrowStore.find();

    return result;
  }

  reset() {
    Object.assign(this, new LendItemForm());
  }
}

export class ReturnLendFrom {
  _id: string = '';
  return_date: Date = new Date();
  manager_user: string = '';

  async insert() {
    const result = await cmd.lendItem.return_lend_item.invoke(UpdateResultSchema, { returnLendItem: this });

    return result;
  }

  reset() {
    Object.assign(this, new LendItemForm());
  }
}
