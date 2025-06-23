import { useUserStore } from '@/stores';
import { cmd } from './Command';
import { DateTimeSchema, InsertOneResultSchema, ObjectIdSchema, UpdateResultSchema } from './Mongodb';
import { rules } from '@/utils';
import { z } from 'zod';
import { t } from '@/i18n';
import { match } from 'ts-pattern';
import { ExportData } from '@/utils/Export';

export const UserSchema = z
  .object({
    _id: ObjectIdSchema,
    id: z.string().regex(rules.idRegex),
    name: z.string(),
    type: z.enum(['Borrower', 'Manager']),
    phone: z.string().nullable(),
    is_lock: z.boolean().default(false),
    updated_at: DateTimeSchema,
    created_at: DateTimeSchema,
  })
  .transform((value) => {
    return {
      ...value,
      get cardContent() {
        return {
          label: match(value.type)
            .with('Borrower', () => t('user.type.Borrower'))
            .with('Manager', () => t('user.type.Manager'))
            .exhaustive(),
          items: [
            { title: t('user.id'), value: value.id },
            { title: t('user.name'), value: value.name },
            { title: t('user.phone'), value: value.phone },
          ],
        };
      },
    };
  });

export type UserType = typeof UserSchema._type.type;
export type User = z.infer<typeof UserSchema>;
export type Method = 'insert' | 'update';

export class UserForm {
  _id? = '';
  id = '';
  name = '';
  is_lock = false;
  phone: typeof UserSchema._type.phone = null;
  type: UserType = 'Borrower';

  keys() {
    return Object.keys(this) as Array<keyof this>;
  }

  fromUser(user: User) {
    this.keys().forEach((key) => {
      if (key in this && key in user) {
        this[key] = (user as any)[key];
      }
    });

    return this;
  }

  async insert() {
    const { _id, ...user } = this;
    const result = await cmd.user.insert_one.invoke(InsertOneResultSchema, { user });
    await useUserStore().find();

    return result;
  }

  async update(updateData: Partial<this> = this) {
    const userStore = useUserStore();
    const result = await cmd.user.update_one.invoke(UpdateResultSchema, { updateData });

    if (result) userStore.setSelectedData(updateData);

    return result;
  }

  reset(type?: UserType) {
    Object.assign(this, new UserForm());
    if (type) {
      this.type = type;
    }
  }
}
