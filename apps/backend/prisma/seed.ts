import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXTENSIONS = ['txt', 'pdf', 'docx', 'xlsx', 'png', 'jpg', 'mp3', 'mp4', 'zip', 'json', 'md'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSize(): bigint {
  // Random size between 1KB and 5GB
  const min = 1024;
  const max = 5 * 1024 * 1024 * 1024;
  return BigInt(Math.floor(Math.random() * (max - min) + min));
}

async function main() {
  console.log('Clearing database...');
  await prisma.file.deleteMany();
  await prisma.folder.deleteMany();

  console.log('Generating root folders...');
  const roots = [
    { name: 'Documents' },
    { name: 'Pictures' },
    { name: 'Music' },
    { name: 'Videos' },
    { name: 'System' }
  ];

  const createdRoots: any[] = [];
  for (const root of roots) {
    const folder = await prisma.folder.create({
      data: { name: root.name }
    });
    createdRoots.push(folder);
  }

  let totalFolders = createdRoots.length;
  let totalFiles = 0;

  const docRoot = createdRoots.find(r => r.name === 'Documents')!;
  const picRoot = createdRoots.find(r => r.name === 'Pictures')!;
  const musicRoot = createdRoots.find(r => r.name === 'Music')!;
  const videoRoot = createdRoots.find(r => r.name === 'Videos')!;
  const systemRoot = createdRoots.find(r => r.name === 'System')!;

  // Helper function to create subfolders and files recursively
  async function generateBranch(parentId: string, currentDepth: number, maxDepth: number, foldersPerNode: number, filesPerNode: number) {
    if (currentDepth > maxDepth) return;

    // Create folders
    const foldersData = Array.from({ length: foldersPerNode }).map((_, i) => ({
      name: `Folder_L${currentDepth}_N${i}_${Math.floor(Math.random() * 1000)}`,
      parentId
    }));

    const createdFolders = [];
    for (const data of foldersData) {
      const f = await prisma.folder.create({ data });
      createdFolders.push(f);
      totalFolders++;
    }

    // Create files in the parent folder
    const filesData = Array.from({ length: filesPerNode }).map((_, i) => {
      const ext = getRandomElement(EXTENSIONS);
      return {
        name: `File_L${currentDepth}_N${i}_${Math.floor(Math.random() * 1000)}.${ext}`,
        size: getRandomSize(),
        extension: ext,
        folderId: parentId
      };
    });

    if (filesData.length > 0) {
      await prisma.file.createMany({
        data: filesData
      });
      totalFiles += filesData.length;
    }

    // Recurse into children
    for (const childFolder of createdFolders) {
      const nextFoldersPerNode = Math.max(0, foldersPerNode - 1);
      const nextFilesPerNode = Math.max(1, filesPerNode - 1);
      await generateBranch(childFolder.id, currentDepth + 1, maxDepth, nextFoldersPerNode, nextFilesPerNode);
    }
  }

  console.log('Generating tree for Documents (Hierarchical deep, depth 5)...');
  await generateBranch(docRoot.id, 1, 5, 4, 8);

  console.log('Generating tree for Pictures (Hierarchical deep, depth 4)...');
  await generateBranch(picRoot.id, 1, 4, 3, 6);

  console.log('Generating tree for Music (Flat)...');
  await generateBranch(musicRoot.id, 1, 2, 2, 10);

  console.log('Generating tree for Videos (Flat)...');
  await generateBranch(videoRoot.id, 1, 2, 2, 4);

  console.log('Generating tree for System...');
  await generateBranch(systemRoot.id, 1, 3, 2, 4);

  console.log('Generating additional bulk folders and files for scalability (1,000+ folders, 5,000+ files target)...');
  
  // We want to add ~1000 more folders, each containing 5 files.
  // This will bring total folders to ~1000+ and files to ~5000+.
  const bulkFolderCount = 1000;
  const filesPerBulkFolder = 5;
  
  console.log(`Generating ${bulkFolderCount} bulk folders under Documents/Pictures...`);
  
  // To avoid slowing down with too many queries, let's create folders and bulk-insert files
  for (let i = 0; i < bulkFolderCount; i++) {
    // Alternate parent between Documents and Pictures
    const parentFolderId = i % 2 === 0 ? docRoot.id : picRoot.id;
    const f = await prisma.folder.create({
      data: {
        name: `Archive_Box_${i}`,
        parentId: parentFolderId
      }
    });
    totalFolders++;

    const filesChunk = Array.from({ length: filesPerBulkFolder }).map((_, fileIdx) => {
      const ext = getRandomElement(EXTENSIONS);
      return {
        name: `archive_record_${i}_${fileIdx}.${ext}`,
        size: getRandomSize(),
        extension: ext,
        folderId: f.id
      };
    });

    await prisma.file.createMany({
      data: filesChunk
    });
    totalFiles += filesChunk.length;

    if (i > 0 && i % 200 === 0) {
      console.log(`...created ${i} bulk folders so far...`);
    }
  }

  // Add a specific hidden file at the deepest level for manual search validation
  const deepestFolder = await prisma.folder.findFirst({
    where: { parentId: { not: null } },
    orderBy: { createdAt: 'desc' }
  });

  if (deepestFolder) {
    await prisma.file.create({
      data: {
        name: 'SECRET_GOLD_RESERVES.xlsx',
        size: 999999999n,
        extension: 'xlsx',
        folderId: deepestFolder.id
      }
    });
    totalFiles++;
    console.log(`Added special search target 'SECRET_GOLD_RESERVES.xlsx' to deepest folder: ${deepestFolder.name}`);
  }

  console.log('====================================');
  console.log('SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`Total Folders created: ${totalFolders}`);
  console.log(`Total Files created: ${totalFiles}`);
  console.log('====================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
