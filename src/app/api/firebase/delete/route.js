import { storage } from '@/lib/firebase';
import { ref, listAll, deleteObject } from 'firebase/storage';

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return new Response(JSON.stringify({ error: 'Неверные данные запроса' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rootRef = ref(storage, 'InterVizo');
    const targetFolderRef = await findFolderRef(rootRef, _id);

    if (!targetFolderRef) {
      return new Response(JSON.stringify({ error: 'Папка с таким ID не найдена' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const deleted = await deleteAllFilesInFolder(targetFolderRef);

    return new Response(JSON.stringify({ success: true, deleted }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка при удалении интервью из Firebase:', error);
    return new Response(JSON.stringify({ error: 'Ошибка при удалении интервью из Firebase: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 🔍 Рекурсивный поиск папки с именем _id
async function findFolderRef(folderRef, _id) {
  const snapshot = await listAll(folderRef);

  for (const dirRef of snapshot.prefixes) {
    if (dirRef.name === _id) {
      return dirRef;
    }

    const found = await findFolderRef(dirRef, _id);
    if (found) return found;
  }

  return null;
}

// 🧹 Удаляет все файлы и подпапки рекурсивно
async function deleteAllFilesInFolder(folderRef) {
  const snapshot = await listAll(folderRef);
  const deleted = [];

  for (const fileRef of snapshot.items) {
    await deleteObject(fileRef);
    deleted.push(fileRef.fullPath);
  }

  for (const dirRef of snapshot.prefixes) {
    const subDeleted = await deleteAllFilesInFolder(dirRef);
    deleted.push(...subDeleted);
  }

  return deleted;
}
