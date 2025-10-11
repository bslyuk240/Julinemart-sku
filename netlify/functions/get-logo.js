import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("logo");
    const data = await store.get("company-logo");
    if (data) {
      return new Response(data, { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain' } 
      });
    }
    return new Response("Not found", { status: 404 });
  } catch (error) {
    return new Response(`Error fetching logo: ${error.message}`, { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/get-logo",
};
