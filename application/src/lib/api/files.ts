export interface FileRecord {
  id: string;
  ownerType: string;
  ownerId: string;
  name: string;
  description: string | null;
  contentType: string | null;
  size: number | null;
  storageKey: string | null;
  contractId: string | null;
  createdAt: string;
  updatedAt: string;
  downloadUrl: string | null;
}

export class FilesApiClient {
  constructor(private baseURL = '/api/contracts') {}

  async list(contractId: string): Promise<FileRecord[]> {
    const res = await fetch(`${this.baseURL}/${contractId}/files`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to load files');
    }
    const data = await res.json();
    return (data.files ?? []) as FileRecord[];
  }

  async upload(
    contractId: string,
    file: File,
    options: { name?: string; description?: string } = {}
  ): Promise<FileRecord> {
    const formData = new FormData();
    formData.append('file', file);
    if (options.name) {
      formData.append('name', options.name);
    }
    if (options.description) {
      formData.append('description', options.description);
    }

    const res = await fetch(`${this.baseURL}/${contractId}/files`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to upload file';
      throw new Error(message);
    }

    return data.file as FileRecord;
  }

  async delete(contractId: string, fileId: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${contractId}/files/${fileId}`, {
      method: 'DELETE',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to delete file';
      throw new Error(message);
    }
  }
}
