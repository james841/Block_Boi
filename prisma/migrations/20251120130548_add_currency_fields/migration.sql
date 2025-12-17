-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "displayCurrency" TEXT,
ADD COLUMN     "displayTotal" DOUBLE PRECISION,
ADD COLUMN     "paymentCurrency" TEXT;
