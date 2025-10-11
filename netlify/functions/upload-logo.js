import { getStore } from "@netlify/blobs";

export default async (req) => {
  try {
    const store = getStore("logo", { consistency: "strong" });
    const data = await req.text();
    await store.set("company-logo", data);
    return new Response("Logo uploaded", { status: 200 });
  } catch (error) {
    return new Response(`Error uploading logo: ${error.message}`, { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/upload-logo",
};
