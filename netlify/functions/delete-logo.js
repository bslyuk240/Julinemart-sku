import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("logo", { consistency: "strong" });
    await store.delete("company-logo");
    return new Response("Logo deleted", { status: 200 });
  } catch (error) {
    return new Response(`Error deleting logo: ${error.message}`, { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/delete-logo",
};
