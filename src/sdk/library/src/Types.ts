import { DEFAULT_CONFIG } from '@/Config';

export type ConfigType = typeof DEFAULT_CONFIG;

export interface File {
  name: string;
}

export enum ClientMessageType {
  SELECTION = 'SELECTION',
  CANCEL = 'CANCEL',
}
