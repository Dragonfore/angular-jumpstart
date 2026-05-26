export interface Item {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemPayload {
  title: string;
  description?: string;
}

export type UpdateItemPayload = Partial<CreateItemPayload>;
