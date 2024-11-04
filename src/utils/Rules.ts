import { ValidationRule } from 'quasar';
import { t } from '../i18n';

export const ipRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
export const idRegex = /^[a-zA-Z]{1}\d{8}$|^\d{7}$/;

const hostValid: ValidationRule = (val: string) => (val && ipRegex.test(val)) || t('rule.ip');
const requiredValid: ValidationRule = (val: unknown) => (!val ? t('rule.empty') : true);
const idValid: ValidationRule = (val: string) => (val && idRegex.test(val)) || t('rule.format');
const positiveNumberValid: ValidationRule = (val: unknown) => (typeof val === 'number' && val >= 0) || t('rule.positiveNumber');

export const ip: ValidationRule[] = [hostValid];
export const id: ValidationRule[] = [idValid];
export const required: ValidationRule[] = [requiredValid];
export const positiveNumber: ValidationRule[] = [positiveNumberValid];
