document.addEventListener('deviceready', onDeviceReady, false);

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhnqebmnz/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'fileupload';

function onDeviceReady() {
  console.log('Cordova is ready');

  const firebaseConfig = {
    apiKey: "AIzaSyDvFpFLPBEsAZCwTOUFrAKx2oxoZoL8UfQ",
    authDomain: "image-gallery-97.firebaseapp.com",
    databaseURL: "https://image-gallery-97-default-rtdb.firebaseio.com",
    projectId: "image-gallery-97",
    storageBucket: "image-gallery-97.appspot.com",
    messagingSenderId: "597014672150",
    appId: "1:597014672150:web:24d6eeb1983efebb805637"
  };

  firebase.initializeApp(firebaseConfig);

  document.getElementById('pickBtn').addEventListener('click', () => captureImage(Camera.PictureSourceType.PHOTOLIBRARY));
  document.getElementById('cameraBtn').addEventListener('click', () => captureImage(Camera.PictureSourceType.CAMERA));
  document.getElementById('loadGallery').addEventListener('click', loadGallery);
}

function captureImage(sourceType) {
  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 90,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: sourceType,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 1500,
    targetHeight: 2000,
    correctOrientation: true
  });

  function onSuccess(imageData) {
    const base64Img = "data:image/jpeg;base64," + imageData;
    uploadToCloudinary(base64Img);
  }

  function onFail(message) {
    alert('❌ Error: ' + message);
  }
}

function uploadToCloudinary(base64Image) {
  const data = new FormData();
  data.append('file', base64Image);
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: data
  })
    .then(res => res.json())
    .then(data => {
      if (data.secure_url && data.public_id) {
        saveToFirebase(data.secure_url, data.public_id);
        alert("✅ Uploaded successfully");
      } else {
        alert("❌ Upload failed");
      }
    })
    .catch(err => {
      alert("❌ Upload error: " + err.message);
    });
}

function saveToFirebase(imageUrl, publicId) {
  const db = firebase.database();
  const ref = db.ref('images');
  ref.push({ url: imageUrl, public_id: publicId });
}

function loadGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  const ref = firebase.database().ref('images');
  ref.once('value', snapshot => {
    snapshot.forEach(child => {
      const data = child.val();
      const wrapper = document.createElement('div');
      const img = document.createElement('img');
      img.src = data.url;
      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
      delBtn.style.display = 'block';
      delBtn.onclick = () => deleteImage(child.key, data.public_id);
      wrapper.appendChild(img);
      wrapper.appendChild(delBtn);
      gallery.appendChild(wrapper);
    });
  });
}

function deleteImage(firebaseKey, publicId) {
  const db = firebase.database();
  db.ref('images/' + firebaseKey).remove().then(() => {
    alert('✅ Removed from Firebase. You must delete manually from Cloudinary.');
    loadGallery();
  });
}