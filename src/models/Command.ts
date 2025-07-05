import { invoke } from '@tauri-apps/api';
import { ZodError, ZodType, z } from 'zod';
import { Notify } from 'quasar';
import { InvokeArgs } from '@tauri-apps/api/tauri';

const SuccessSchema = <T extends ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

const ResultSchema = <T extends ZodType>(dataSchema: T) => z.union([ErrorSchema, SuccessSchema(dataSchema)]);

type SuccessType<T> = {
  success: true;
  data: T;
};
type ErrorType = z.infer<typeof ErrorSchema>;
type ResultType<T> = SuccessType<T> | ErrorType;

class Command {
  #key: string;
  constructor(key: string) {
    this.#key = key;
  }

  invoke = async <T extends ZodType>(dataSchema: T, param?: InvokeArgs) => {
    try {
      const result = ResultSchema(dataSchema).parse(await invoke(this.#key, param)) as ResultType<z.infer<typeof dataSchema>>;

      if (result.success === true) {
        return result.data;
      }

      Notify.create({ type: 'warning', message: result.error });
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        error.issues.forEach((issue) => Notify.create({ type: 'negative', message: `${issue.message}: ${issue.path.join('.')}` }));
      } else {
        Notify.create({ type: 'negative', message: `Unknow Error: ${error}` });
      }

      return null;
    }
  };
}

const cmd = {
  login: new Command('login'),
  isLogin: new Command('is_login'),
  logout: new Command('logout'),
  getExportHistoryYears: new Command('get_export_history_years'),
  user: {
    insert_one: new Command('user_insert_one'),
    update_one: new Command('user_update_one'),
    find: new Command('user_find'),
  },
  item: {
    insert_one: new Command('item_insert_one'),
    update_one: new Command('item_update_one'),
    find: new Command('item_find'),
  },
  lendItem: {
    return_lend_item: new Command('return_lend_item'),
    delete_one: new Command('lend_delete_one'),
    insert_one: new Command('lend_insert_one'),
    update_one: new Command('lend_update_one'),
    find_not_return: new Command('lend_find_not_return'),
    find_by_filter: new Command('lend_find_by_filter'),
    lendHistoryFindByYear: new Command('lend_history_find_by_year'),
  },
  maintenanceItem: {
    delete_by_id: new Command('maintenance_delete_by_id'),
    insert_one: new Command('maintenance_insert_one'),
    update_by_id: new Command('maintenance_update_by_id'),
    find: new Command('maintenance_find'),
    find_by_filter: new Command('maintenance_find_by_filter'),
    historyFindByYear: new Command('maintenance_history_find_by_year'),
  },
};

export { cmd };
