const Organizer = (() => {
  let dragData = null;

  function init() {
    document.querySelectorAll('.track-item').forEach(el => {
      el.addEventListener('dragstart', onDragStart);
      el.addEventListener('dragend', onDragEnd);
    });

    document.querySelectorAll('.folder-name').forEach(el => {
      el.addEventListener('dragover', onDragOver);
      el.addEventListener('dragleave', onDragLeave);
      el.addEventListener('drop', onDrop);
    });

    document.querySelectorAll('.set-name').forEach(el => {
      el.addEventListener('dragover', onDragOver);
      el.addEventListener('dragleave', onDragLeave);
      el.addEventListener('drop', onDrop);
    });
  }

  function onDragStart(e) {
    dragData = {
      filename: e.target.dataset.filename,
      set: e.target.dataset.set,
      folder: e.target.dataset.folder || ''
    };
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.4';
  }

  function onDragEnd(e) {
    e.target.style.opacity = '1';
    dragData = null;
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  async function onDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (!dragData) return;

    const targetSet = e.currentTarget.dataset.set;
    const targetFolder = e.currentTarget.dataset.folder || '';

    if (dragData.set === targetSet && dragData.folder === targetFolder) return;

    try {
      if (dragData.set === targetSet) {
        await API.moveFile(dragData.set, dragData.filename, dragData.folder, targetFolder);
      } else {
        await API.moveFileCross(dragData.filename, dragData.set, dragData.folder, targetSet, targetFolder);
      }
      toast(`Moved ${dragData.filename}`);
      Browser.load();
    } catch (err) {
      toast('Move failed', true);
    }
  }

  return { init };
})();
