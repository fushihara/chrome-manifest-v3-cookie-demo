function addLog(msg){
  document.querySelector("#textarea").value += msg;
  document.querySelector("#textarea").value += "\n";
  console.log(msg);
}
chrome.tabs.query({active: true, lastFocusedWindow: true}, async (e) => {
  const tabId = e?.[0]?.id ?? 0;
  //await new Promise(resolve => { setTimeout(() => { resolve() }, 2 * 1000) });
  const result = await getData(tabId);
  let message = "";
  message += `${result.url}\nのCookieは以下の通り\n`;
  const cookieStr = Array.from(result.requestHeaders).filter(a=>String(a.name).toLowerCase() == "cookie")?.[0].value ?? "";
  if(cookieStr == ""){
    message += "クッキーなし";
  }else{
    message += cookieStr;
  }
  addLog(message);
});
async function getData(tabId) {
  const db = indexedDB.open("test-indexed-db", 1);
  await new Promise((resolve) => {
    db.onupgradeneeded = () => {
      db.result.createObjectStore("cookies", {keyPath: "id"});
    };
    db.onsuccess = () => {
      resolve();
    };
  });
  const result = await new Promise((resolve) => {
    const trans = db.result.transaction("cookies", "readwrite");
    const store = trans.objectStore("cookies");
    const r = store.get(tabId);
    r.onsuccess = () => {
      debugger;
      resolve(r?.result?.data);
    };
  });
  db.result.close();
  return result;
}
