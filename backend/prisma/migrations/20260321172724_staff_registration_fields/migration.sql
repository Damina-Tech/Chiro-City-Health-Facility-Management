-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "licenseIssueDate" TIMESTAMP(3),
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "specificFields" TEXT,
ADD COLUMN     "staffRole" TEXT;
