import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { z } from 'zod';
import { Item, ItemForm, ItemSchema, ItemType } from '@/models/Item';
import { cmd } from '@/models/Command';
import { match } from 'ts-pattern';

export const useItemStore = defineStore('Item', () => {
  const form = ref(new ItemForm());
  const _value = ref<Array<Item> | null>(null);

  const find = async () => {
    const result = await cmd.item.find.invoke(z.array(ItemSchema));
    if (result) {
      _value.value = result;
      _value.value.sort((a, b) => {
        return match([a.is_lock, b.is_lock])
          .with([false, true], () => -1)
          .with([true, false], () => 1)
          .otherwise(() => a.updated_at.getTime() - b.updated_at.getTime());
      });
    }

    return _value.value;
  };

  const value = async () => {
    if (_value.value) return _value.value;

    return await find();
  };

  const selectedItem = () => {
    if (_value.value === null) return null;

    const item = _value.value.find((v) => v._id === form.value._id);
    if (item === undefined) return null;

    return item;
  };

  const getByType = async (type: ItemType) => {
    const val = (await value()) || [];
    const items = val.filter((v) => v.type === type);

    return items;
  };

  const setSelectedData = (data: Partial<ItemForm>) => {
    const item = selectedItem();
    if (item === null) return null;

    if (!data.keys) return null;

    data.keys().forEach((key) => {
      if (key in item) {
        (item as any)[key] = data[key];
      }
    });

    return item;
  };

  const items = computed(async () => {
    const val = await value();

    return val?.filter((v) => !v.is_lock);
  });

  return { form, items, find, value, getByType, setSelectedData };
});
