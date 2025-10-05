import { HTTP_STATUS } from 'lib/api/http';
import { GET } from './route';

describe('Health Check API', () => {
  it('returns status ok', async () => {
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(json).toEqual({ status: 'ok' });
  });
});
