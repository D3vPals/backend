importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
);

// ✅ Firebase 앱이 이미 초기화되었는지 확인 후 초기화
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyAUKso4aihEq6q8xEKnfGMIinRvSBZDMoQ',
    projectId: 'devpals-e16c6',
    messagingSenderId: '337849225132',
    appId: '1:337849225132:web:3ec9211f5f2082ca043409',
  });
}

// Firebase Messaging 서비스 워커 등록
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신', payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  });
});
