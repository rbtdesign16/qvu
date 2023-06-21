export const SUCCESS = "success";
export const ERROR = "error";
export const WARN = "warn";
export const INFO = "info";


export const isNotEmpty = (val) => {
  return val && ("" + val).length > 0;
};

export const copyObject = (o) => {
  return JSON.parse(JSON.stringify(o));
};

export const loadDocumentFromBlob = async (fileName, blob) => {
  if (blob) {
    let downloadLink = document.createElement("a");
    downloadLink.target = "_blank";
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }
};
