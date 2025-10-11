// netlify/functions/fetch-image.js
export default async (req) => {
  const url = new URL(req.url).searchParams.get('url');

  if (!url) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(`Failed to fetch image. Status: ${response.status}`, { status: response.status });
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        return new Response('URL does not point to a valid image.', { status: 400 });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return new Response(dataUrl, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    return new Response(`Error fetching image: ${error.message}`, { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/fetch-image",
};
