import { createClient } from '@vercel/kv';
 
export async function GET() {
  const users = createClient({
    url: process.env.USERS_REST_API_URL,
    token: process.env.USERS_REST_API_TOKEN,
  });
 
  const user = await users.hgetall('user:me');
 
  const products = createClient({
    url: process.env.PRODUCTS_REST_API_URL,
    token: process.env.PRODUCTS_REST_API_TOKEN,
  });
 
  const product = await products.hgetall('product:shirt');
  return Response.json(
    {
      user,
      product,
    },
    {
      status: 200,
    },
  );
}