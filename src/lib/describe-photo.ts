import { describeEndpoint } from '@/lib/config';
import type { PhotoAnalysis } from '@/lib/schema';

export async function describePhoto(
  imageBase64: string,
  accessToken: string,
): Promise<PhotoAnalysis> {
  const response = await fetch(describeEndpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64 }),
  });

  const payload = (await response.json().catch(() => null)) as
    | PhotoAnalysis
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && payload.error
        ? payload.error
        : `Describe failed (${response.status})`;
    throw new Error(message);
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('description' in payload) ||
    !('tags' in payload) ||
    !Array.isArray(payload.tags)
  ) {
    throw new Error('Describe response was missing description or tags.');
  }

  return payload;
}
