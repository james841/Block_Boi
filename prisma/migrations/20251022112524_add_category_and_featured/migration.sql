-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false;
