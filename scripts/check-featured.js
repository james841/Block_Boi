const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      where: { featuredOnHomepage: true },
      select: { id: true, name: true, featuredOnHomepage: true, imageUrl: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('DB ERROR', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
