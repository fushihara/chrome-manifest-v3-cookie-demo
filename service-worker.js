chrome.webRequest.onBeforeSendHeaders.addListener(
  (e) => {
    if (e.type == "main_frame") {
      upsertData({
        id: e.tabId,
        data: e,
      });
    }
  },
  {urls: ["<all_urls>"]},
  ["requestHeaders", "extraHeaders"]
);
async function upsertData(data) {
  const db = indexedDB.open("test-indexed-db", 1);
  await new Promise((resolve) => {
    db.onupgradeneeded = () => {
      db.result.createObjectStore("cookies", {keyPath: "id"});
    };
    db.onsuccess = () => {
      resolve();
    };
  });
  await new Promise((resolve) => {
    const trans = db.result.transaction("cookies", "readwrite");
    const store = trans.objectStore("cookies");
    const r = store.put(data);
    r.onsuccess = () => {
      resolve();
    };
  });
  db.result.close();
}
