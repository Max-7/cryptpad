(function () {
  var CRYPTPAD_ORIGIN = 'http://localhost:3000';

  var Commands = {
    Init: 'init',
    InitDone: 'init-done',
    Ready: 'ready',
    Hello: 'hello',
    Open: 'open',
    OpenDone: 'open-done',
  };

  var fileInput = document.getElementById('file-input');
  var openBtn = document.getElementById('open-btn');
  var frame = document.getElementById('editor-frame');

  var selectedFile = null;
  var frameReady = false;
  var start = null;

  fileInput.addEventListener('change', function () {
    selectedFile = fileInput.files[0] || null;
    openBtn.disabled = !selectedFile || !frameReady;
    if (selectedFile) {
        console.log(`File selected: ${selectedFile.name}`);
    }
  });

  openBtn.addEventListener('click', function () {
    if (!selectedFile || !frameReady) {
        return;
    }
    openBtn.disabled = true;
    start = Date.now();
    console.log('Sending Init…');
    frame.contentWindow.postMessage({ command: Commands.Init }, CRYPTPAD_ORIGIN);
  });

  window.addEventListener('message', function (event) {
    if (event.origin !== CRYPTPAD_ORIGIN) {
        return;
    }
    var data = event.data;

    if (data.command === Commands.Ready) {
      console.log('Sending Hello...');
      frame.contentWindow.postMessage({ command: Commands.Hello }, CRYPTPAD_ORIGIN);
      frameReady = true;
      openBtn.disabled = !selectedFile;
      frame.style.display = 'block';
      return;
    }

    if (data.command === Commands.InitDone) {
      console.log('Sending file...');
      var reader = new FileReader();
      reader.onload = function (e) {
        frame.contentWindow.postMessage({
          command: Commands.Open,
          documentContent: e.target.result,
          documentName: selectedFile.name,
          documentExtension: 'docx',
          cryptpadEditor: 'word',
          key: crypto.randomUUID(),
          userName: 'Test',
          userId: 'Test',
          autosaveInterval: 10,
          mode: 'edit',
          locale: 'en',
        }, CRYPTPAD_ORIGIN);
      };
      reader.readAsArrayBuffer(selectedFile);
      return;
    }

    if (data.command === Commands.OpenDone) {
      const stop = Date.now();
      console.log(`Opened in ${(stop - start) / 1000}`);
    }
  });

  console.log(`Waiting for frame.html to load at ${CRYPTPAD_ORIGIN}...`);
})();
