import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const folderCount = await prisma.folder.count();
  const fileCount = await prisma.file.count();

  console.log('=== DATABASE INTEGRITY CHECK ===');
  console.log(`Total Folders: ${folderCount}`);
  console.log(`Total Files:   ${fileCount}`);

  // Calculate maximum tree depth in memory
  const folders = await prisma.folder.findMany({
    select: { id: true, parentId: true }
  });

  const folderMap = new Map(folders.map(f => [f.id, f.parentId]));
  let maxDepth = 0;

  for (const [id] of folderMap) {
    let depth = 0;
    let currentId: string | null | undefined = id;
    while (currentId) {
      depth++;
      currentId = folderMap.get(currentId);
    }
    if (depth > maxDepth) {
      maxDepth = depth;
    }
  }

  console.log(`Maximum Tree Depth: ${maxDepth}`);
  console.log('================================');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
