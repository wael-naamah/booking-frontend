import { RcFile } from "antd/es/upload";
import { API_URL, FILES_STORE } from "./redux/network/api";

export const upload = async (file: RcFile) => {
  const imageName = file.name;
  const filePath = `services/${imageName}`;
  const uploadFileData = new FormData();
  uploadFileData.append("file", file);
  uploadFileData.append("path", filePath);
  const result = await fetch(`${API_URL}/files/upload`, {
    method: "POST",
    body: uploadFileData,
  });
  const data = await result.json();

  let uri = "";

  if (data && data.link) {
    uri = data.link;
  }

  return { uri };
};


const toDataURL = (filename: string) => {
  return fetch(`${API_URL}/files/download/${filename}`)
      .then((response) => {
          return response.blob();
      })
      .then((blob) => {
          return URL.createObjectURL(blob);
      }).catch((err) => {
        return '';
      })
};


export const download = async (filename: string) => {
  const a = document.createElement("a");
  a.href = await toDataURL(filename);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const generatePassword = () => {
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const specialChars = '!@#$%^&*()_-+=<>?';
  const numericChars = '0123456789';

  const getRandomChar = (characters: string | any[]) =>
    characters[Math.floor(Math.random() * characters.length)];

  const getRandomPassword = () =>
    getRandomChar(lowerCaseChars) +
    getRandomChar(upperCaseChars) +
    getRandomChar(specialChars) +
    getRandomChar(numericChars) +
    Array.from({ length: 6 }, () =>
      getRandomChar(lowerCaseChars + upperCaseChars + specialChars + numericChars)
    ).join('');

  return getRandomPassword();
};
