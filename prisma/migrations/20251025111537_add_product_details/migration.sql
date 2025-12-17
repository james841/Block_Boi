-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colors" TEXT[],
ADD COLUMN     "details" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "returns" TEXT,
ADD COLUMN     "shipping" TEXT,
ADD COLUMN     "sizes" TEXT[];
