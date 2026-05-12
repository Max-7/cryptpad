(function () {
  var Commands = {
    Init: 'init',
    InitDone: 'init-done',
    Ready: 'ready',
    Hello: 'hello',
    Open: 'open',
    OpenDone: 'open-done',
  };

  let origin = undefined;

  function sendToParent(data) {
    window.parent.postMessage(data, origin);
  }

  function onReady() {
    sendToParent({ command: Commands.OpenDone });
  }

  function initialize() {
    if (typeof window.CryptPadAPI === 'function') {
      sendToParent({ command: Commands.InitDone });
    }
  }

  function openFile(data) {
    const documentUrl = URL.createObjectURL(new Blob([data.documentContent], { type: 'application/octet-stream' }));
    const config = {
      document: {
        url: documentUrl,
        fileType: data.documentExtension,
        title: data.documentName,
        key: data.key,
      },
      documentType: data.cryptpadEditor,
      editorConfig: {
        lang: data.locale,
        user: {
          name: data.userName,
          id: data.userId,
        }
      },
      autosave: data.autosaveInterval,
      mode: data.mode,
      events: {
        onReady: onReady,
        onSave: () => {},
        onHasUnsavedChanges: () => {},
        onError: () => {},
      }
    };
    window.CryptPadAPI(window.location.origin, 'editor-container', config);
  }

  window.addEventListener('message', (event) => {
    if (!event.data.command) {
      console.log("Missing 'command', ignoring");
      return;
    }
    if (event.data.command === Commands.Hello) {
      origin = event.origin;
      console.log(`Origin set to '${origin}'`);
      return;
    }
    if (!origin || event.origin !== origin) {
      return;
    }
    switch (event.data.command) {
      case Commands.Init: {
        initialize();
        break;
      }
      case Commands.Open: {
        openFile(event.data);
        break;
      }
      default:
        break;
    }
  });

  window.parent.postMessage({ command: Commands.Ready }, '*');
})();
