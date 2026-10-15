import { AuthError, requireAccessToken } from '@/lib/auth';
import { photoAnalysisSchema } from '@/lib/schema';
import { generateObject } from 'ai';

function decodeBase64(value: string): Uint8Array {
  const normalized = value.includes(',') ? value.split(',').pop() ?? value : value;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function POST(request: Request) {
  try {
    await requireAccessToken(request);

    const body = (await request.json()) as { imageBase64?: unknown };
    if (typeof body.imageBase64 !== 'string' || body.imageBase64.length < 32) {
      return Response.json({ error: 'imageBase64 is required' }, { status: 400 });
    }

    const model = process.env.AI_GATEWAY_MODEL ?? 'google/gemini-2.5-flash';
    const { object } = await generateObject({
      model,
      schema: photoAnalysisSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this photo in one sentence. Then give 3-5 short lowercase tags.',
            },
            {
              type: 'image',
              image: decodeBase64(body.imageBase64),
              mediaType: 'image/jpeg',
            },
          ],
        },
      ],
    });

    return Response.json(object);
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : 'Describe failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
