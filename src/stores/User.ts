import { defineStore } from 'pinia';
import { ref } from 'vue';
import { z } from 'zod';
import { User, UserForm, UserSchema, UserType } from '@/models/User';
import { cmd } from '@/models/Command';
import { match } from 'ts-pattern';

export const useUserStore = defineStore('User', () => {
  const form = ref(new UserForm());
  const _value = ref<Array<User> | null>(null);

  const find = async () => {
    const result = await cmd.user.find.invoke(z.array(UserSchema));
    _value.value = result;

    return _value.value;
  };

  const value = async () => {
    if (_value.value) return _value.value;

    return await find();
  };

  const getByType = async (type: UserType) => {
    const val = await value();
    if (val === null) return [];
    const users = val.filter((v) => v.type === type);
    users.sort((a, b) => {
      return match([a.is_lock, b.is_lock])
        .with([false, true], () => -1)
        .with([true, false], () => 1)
        .otherwise(() => a.updated_at.getTime() - b.updated_at.getTime());
    });

    return users;
  };

  const selectedUser = () => {
    if (_value.value === null) return null;

    const user = _value.value.find((v) => v._id === form.value._id);
    if (user === undefined) return null;

    return user;
  };

  const setSelectedData = (data: Partial<UserForm>) => {
    const user = selectedUser();
    if (user === null) return null;

    if (!data.keys) return null;

    data.keys().forEach((key) => {
      if (key in user) {
        (user as any)[key] = data[key];
      }
    });

    return user;
  };

  return { form, find, value, getByType, setSelectedData };
});
