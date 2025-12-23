import type { WebhookPayload } from '../embedEditor/types';

export interface EmbedProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  payload: WebhookPayload;
}

export type ProjectUpdate = Partial<Pick<EmbedProject, 'name' | 'payload'>>;
