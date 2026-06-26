const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findFirst().then(r => {
  console.log('imageUrl:', r?.imageUrl?.slice(0, 100));
  p.$disconnect();
});