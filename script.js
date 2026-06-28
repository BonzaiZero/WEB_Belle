const storageKeys = {
  recipient: "romantic-site-recipient",
  body: "romantic-site-body",
  signature: "romantic-site-signature"
};

const recipientInput = document.querySelector("#recipientInput");
const letterBody = document.querySelector("#letterBody");
const signatureInput = document.querySelector("#signatureInput");
const letterDate = document.querySelector("#letterDate");

let saveTimer;

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return false;
  }
  return true;
}

function updateSaveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (recipientInput) writeStorage(storageKeys.recipient, recipientInput.value);
    if (letterBody) writeStorage(storageKeys.body, letterBody.value);
    if (signatureInput) writeStorage(storageKeys.signature, signatureInput.value);
  }, 180);
}

function setToday() {
  const date = new Date();
  const formatted = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
  if (letterDate) letterDate.textContent = formatted;
}

function restoreDraft() {
  const savedRecipient = readStorage(storageKeys.recipient);
  const savedBody = readStorage(storageKeys.body);
  const savedSignature = readStorage(storageKeys.signature);

  if (savedRecipient !== null && recipientInput) recipientInput.value = savedRecipient;
  if (savedBody !== null && letterBody && !letterBody.hasAttribute('readonly')) letterBody.value = savedBody;
  if (savedSignature !== null && signatureInput) signatureInput.value = savedSignature;
}

if (recipientInput && letterBody && signatureInput) {
  [recipientInput, letterBody, signatureInput].forEach((field) => {
    field.addEventListener("input", () => {
      updateSaveState();
    });
  });
}

setToday();
restoreDraft();
