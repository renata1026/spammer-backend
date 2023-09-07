-- CreateTable
CREATE TABLE "Message" (
    "id" STRING NOT NULL,
    "text" STRING NOT NULL,
    "like" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
