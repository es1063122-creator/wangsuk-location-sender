import { firebaseConfig } from "./firebase-config.js";

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const $ = (id) => document.getElementById(id);

const equipmentLabels = {
  excavator: "굴착기",
  dump_truck: "덤프",
  forklift: "지게차",
  drilling_rig: "천공기",
  earth_anchor_rig: "어스앵카",
  sgr_drilling_rig: "SGR천공",
  crane: "크레인",
  loader: "로더",
  roller: "롤러",
  other: "기타 장비"
};

const state = {
  watchId: null,
  lastPosition: null,
  lastSentAtMs: 0,
  sendCount: 0,
  minSendIntervalMs: 10000,
  minMoveMeters: 3.0,
  firebaseReady: false,
  authUser: null
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);

function getDeviceId() {
  let deviceId =
    localStorage.getItem("wgs_device_id_firebase_v1");

  if (!deviceId) {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      deviceId =
        "DEVICE_" +
        window.crypto.randomUUID()
          .replaceAll("-", "")
          .slice(0, 16)
          .toUpperCase();
    } else {
      deviceId =
        "DEVICE_" +
        Date.now().toString(16).toUpperCase() +
        Math.random()
          .toString(16)
          .slice(2, 8)
          .toUpperCase();
    }

    localStorage.setItem(
      "wgs_device_id_firebase_v1",
      deviceId
    );
  }

  return deviceId;
}

function setStatus(text, kind = "warn") {
  const element = $("status");

  if (!element) {
    return;
  }

  element.textContent = text;
  element.className = `${kind} value`;
}

function updateTypeUi() {
  const isEquipment =
    $("type").value === "equipment";

  $("equipmentTypeWrap").classList.toggle(
    "hidden",
    !isEquipment
  );

  $("nameLabel").textContent =
    isEquipment
      ? "장비 규격 및 등록번호"
      : "근로자 이름";

  $("name").placeholder =
    isEquipment
      ? "예: 06굴착기 1234"
      : "예: 김 작업자";

  $("displayType").textContent =
    isEquipment
      ? equipmentLabels[$("equipmentType").value]
      : "근로자";
}

function readIdentity() {
  const deviceId = getDeviceId();
  const name = $("name").value.trim();
  const type = $("type").value;

  const equipmentType =
    type === "equipment"
      ? $("equipmentType").value
      : "";

  if (!name) {
    throw new Error(
      type === "equipment"
        ? "장비 규격과 등록번호 4자리를 입력하세요."
        : "근로자 이름을 입력하세요."
    );
  }

  localStorage.setItem(
    "wgs_tracking_name_firebase_v1",
    name
  );

  localStorage.setItem(
    "wgs_tracking_type_firebase_v1",
    type
  );

  localStorage.setItem(
    "wgs_equipment_type_firebase_v1",
    equipmentType
  );

  return {
    deviceId,
    name,
    type,
    equipmentType
  };
}

function loadIdentity() {
  $("name").value =
    localStorage.getItem(
      "wgs_tracking_name_firebase_v1"
    ) ?? "";

  $("type").value =
    localStorage.getItem(
      "wgs_tracking_type_firebase_v1"
    ) ?? "worker";

  $("equipmentType").value =
    localStorage.getItem(
      "wgs_equipment_type_firebase_v1"
    ) ?? "excavator";

  updateTypeUi();
  setStatus("Firebase 연결 중", "warn");
}

function distanceMeters(pointA, pointB) {
  if (!pointA || !pointB) {
    return Infinity;
  }

  const earthRadius = 6371000;

  const latitude1 =
    pointA.latitude * Math.PI / 180;

  const latitude2 =
    pointB.latitude * Math.PI / 180;

  const deltaLatitude =
    (pointB.latitude - pointA.latitude) *
    Math.PI / 180;

  const deltaLongitude =
    (pointB.longitude - pointA.longitude) *
    Math.PI / 180;

  const value =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) *
    Math.cos(latitude2) *
    Math.sin(deltaLongitude / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )
  );
}

function updateDisplay(position) {
  const coords = position.coords;

  $("lat").textContent =
    coords.latitude.toFixed(7);

  $("lng").textContent =
    coords.longitude.toFixed(7);

  $("alt").textContent =
    Number.isFinite(coords.altitude)
      ? `${coords.altitude.toFixed(1)} m`
      : "미수신";

  $("acc").textContent =
    `${coords.accuracy.toFixed(1)} m`;

  updateTypeUi();
}

async function ensureFirebaseAuth() {
  if (
    state.firebaseReady &&
    auth.currentUser
  ) {
    return auth.currentUser;
  }

  if (auth.currentUser) {
    state.authUser = auth.currentUser;
    state.firebaseReady = true;
    return auth.currentUser;
  }

  const credential =
    await signInAnonymously(auth);

  state.authUser = credential.user;
  state.firebaseReady = true;

  return credential.user;
}

function createPayload(
  identity,
  coords,
  active
) {
  return {
    deviceId: identity.deviceId,
    name: identity.name,
    type: identity.type,

    equipmentType:
      identity.equipmentType,

    equipmentTypeLabel:
      identity.equipmentType
        ? equipmentLabels[identity.equipmentType]
        : "",

    latitude:
      Number.isFinite(coords?.latitude)
        ? coords.latitude
        : 0,

    longitude:
      Number.isFinite(coords?.longitude)
        ? coords.longitude
        : 0,

    altitude:
      Number.isFinite(coords?.altitude)
        ? coords.altitude
        : null,

    accuracy:
      Number.isFinite(coords?.accuracy)
        ? coords.accuracy
        : 0,

    heading:
      Number.isFinite(coords?.heading)
        ? coords.heading
        : null,

    speed:
      Number.isFinite(coords?.speed)
        ? coords.speed
        : null,

    deviceTime:
      new Date().toISOString(),

    receivedAt:
      serverTimestamp(),

    active
  };
}

async function writePosition(
  position,
  force = false
) {
  const identity = readIdentity();
  const coords = position.coords;
  const now = Date.now();

  const movedDistance = distanceMeters(
    state.lastPosition?.coords,
    coords
  );

  if (
    !force &&
    now - state.lastSentAtMs <
      state.minSendIntervalMs &&
    movedDistance < state.minMoveMeters
  ) {
    return;
  }

  await ensureFirebaseAuth();

  const payload =
    createPayload(identity, coords, true);

  await set(
    ref(
      database,
      `tracking/latest/${identity.deviceId}`
    ),
    payload
  );

  state.lastPosition = position;
  state.lastSentAtMs = now;
  state.sendCount += 1;

  $("sentAt").textContent =
    new Date().toLocaleTimeString();

  $("count").textContent =
    String(state.sendCount);

  setStatus(
    "Firebase로 전송 중",
    "ok"
  );
}

function onPosition(position) {
  updateDisplay(position);

  writePosition(position).catch(error => {
    console.error(error);

    setStatus(
      `전송 오류: ${error.message}`,
      "bad"
    );
  });
}

function onPositionError(error) {
  const messages = {
    1: "위치 권한이 거부되었습니다.",
    2: "현재 위치를 확인할 수 없습니다.",
    3: "GPS 확인 시간이 초과되었습니다."
  };

  setStatus(
    messages[error.code] ?? error.message,
    "bad"
  );
}

async function startTracking() {
  try {
    readIdentity();

    setStatus(
      "Firebase 인증 중",
      "warn"
    );

    await ensureFirebaseAuth();
  } catch (error) {
    console.error(error);

    setStatus(
      `시작 오류: ${error.message}`,
      "bad"
    );

    return;
  }

  if (!navigator.geolocation) {
    setStatus(
      "이 휴대폰은 위치 기능을 지원하지 않습니다.",
      "bad"
    );

    return;
  }

  if (state.watchId !== null) {
    return;
  }

  setStatus(
    "GPS 확인 중",
    "warn"
  );

  state.watchId =
    navigator.geolocation.watchPosition(
      onPosition,
      onPositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );

  $("startBtn").disabled = true;
  $("stopBtn").disabled = false;
}

async function stopTracking() {
  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(
      state.watchId
    );

    state.watchId = null;
  }

  try {
    const identity = readIdentity();

    await ensureFirebaseAuth();

    const payload = createPayload(
      identity,
      state.lastPosition?.coords,
      false
    );

    await set(
      ref(
        database,
        `tracking/latest/${identity.deviceId}`
      ),
      payload
    );
  } catch (error) {
    console.warn(error);
  }

  $("startBtn").disabled = false;
  $("stopBtn").disabled = true;

  setStatus(
    "전송 중지",
    "warn"
  );
}

async function sendOnce() {
  try {
    readIdentity();

    setStatus(
      "Firebase 인증 중",
      "warn"
    );

    await ensureFirebaseAuth();
  } catch (error) {
    setStatus(
      `인증 오류: ${error.message}`,
      "bad"
    );

    return;
  }

  if (!navigator.geolocation) {
    setStatus(
      "위치 기능을 사용할 수 없습니다.",
      "bad"
    );

    return;
  }

  setStatus(
    "현재 위치 확인 중",
    "warn"
  );

  navigator.geolocation.getCurrentPosition(
    position => {
      updateDisplay(position);

      writePosition(position, true).catch(
        error => {
          console.error(error);

          setStatus(
            `전송 오류: ${error.message}`,
            "bad"
          );
        }
      );
    },
    onPositionError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
}

onAuthStateChanged(
  auth,
  user => {
    if (!user) {
      return;
    }

    state.authUser = user;
    state.firebaseReady = true;

    setStatus(
      "Firebase 연결 완료",
      "ok"
    );
  }
);

$("type").addEventListener(
  "change",
  updateTypeUi
);

$("equipmentType").addEventListener(
  "change",
  updateTypeUi
);

$("startBtn").addEventListener(
  "click",
  startTracking
);

$("stopBtn").addEventListener(
  "click",
  stopTracking
);

$("sendOnceBtn").addEventListener(
  "click",
  sendOnce
);

loadIdentity();

ensureFirebaseAuth().catch(error => {
  console.error(error);

  setStatus(
    `Firebase 연결 오류: ${error.message}`,
    "bad"
  );
});